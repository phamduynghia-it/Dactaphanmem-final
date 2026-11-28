package com.fpms.service.impl;

import com.fpms.dto.request.AdminBookingCreateRequest;
import com.fpms.dto.request.BookingConfirmDepositRequest;
import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.dto.request.BookingUpdateRequest;
import com.fpms.dto.request.PaymentTransactionCreateRequest;
import com.fpms.dto.request.ServiceOrderRequest;
import com.fpms.dto.response.BookingResponse;
import com.fpms.entity.*;
import com.fpms.enums.BookingStatus;
import com.fpms.enums.PaymentStatus;
import com.fpms.enums.PaymentType;
import com.fpms.repository.*;
import com.fpms.service.BookingService;
import com.fpms.service.BookingServiceItemService;
import com.fpms.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final PitchSlotRepository pitchSlotRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentTransactionService paymentTransactionService;
    private final BookingServiceItemService bookingServiceItemService;

    private String generateUniqueCode(String prefix) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 5).toUpperCase();
        return prefix + datePart + randomPart;
    }

    /**
     * Kiểm tra ca đá hợp lệ để đặt: chưa qua giờ kết thúc (endTime) và đang trống (AVAILABLE).
     */
    private void validateSlotForBooking(PitchSlot slot) {
        if (slot.getDateslot() != null && slot.getTimeSlot() != null && slot.getTimeSlot().getEndTime() != null) {
            LocalDateTime slotEndDateTime = LocalDateTime.of(slot.getDateslot(), slot.getTimeSlot().getEndTime());
            if (LocalDateTime.now().isAfter(slotEndDateTime)) {
                throw new RuntimeException("Ca đá này đã qua giờ kết thúc, không thể đặt sân!");
            }
        }
        if (!slot.isAvailable()
                || bookingRepository.existsByPitchSlotIdAndStatusNot(slot.getId(), BookingStatus.CANCELLED.name())) {
            throw new RuntimeException("Ca đá này đã được đặt hoặc đang được giữ chỗ!");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân với ID: " + id));
        return BookingResponse.fromEntity(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt với mã: " + bookingCode));
        return BookingResponse.fromEntity(booking);
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        // 1. Kiểm tra slot sân chưa qua giờ kết thúc và đang khả dụng
        PitchSlot slot = pitchSlotRepository.findById(request.getPitchSlotId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca đá chỉ định"));

        validateSlotForBooking(slot);

        // 2. Tạm khóa giữ chỗ slot trong 15 phút
        slot.holdSlot(15);
        pitchSlotRepository.save(slot);

        // 3. Khởi tạo Booking với Snapshot giá sân
        BigDecimal totalPitchAmount = slot.getPrice();
        BigDecimal totalServiceAmount = BigDecimal.ZERO;

        User customer = null;
        if (request.getCustomerId() != null) {
            customer = userRepository.findById(request.getCustomerId()).orElse(null);
        }

        Booking booking = Booking.builder()
                .bookingCode(generateUniqueCode("BK"))
                .pitchSlot(slot)
                .customer(customer)
                .guestName(request.getGuestName() != null ? request.getGuestName() : (customer != null ? customer.getFullName() : "Khách vãng lai"))
                .guestPhone(request.getGuestPhone() != null ? request.getGuestPhone() : (customer != null ? customer.getPhoneNumber() : "0900000000"))
                .totalPitchAmount(totalPitchAmount)
                .bookingType(request.getBookingType() != null ? request.getBookingType() : "ONLINE")
                .status(BookingStatus.PENDING_PAYMENT.name())
                .customerNote(request.getCustomerNote())
                .build();

        // 4. Tính toán chi phí dịch vụ đi kèm (chưa insert vào bảng booking_services)
        if (request.getServices() != null && !request.getServices().isEmpty()) {
            for (var itemReq : request.getServices()) {
                ServiceItem sItem = serviceItemRepository.findById(itemReq.getServiceId())
                        .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại: " + itemReq.getServiceId()));

                BigDecimal itemTotal = sItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                totalServiceAmount = totalServiceAmount.add(itemTotal);
                // LƯU Ý: Chưa thêm vào booking.getServices() để không insert vào DB lúc này
            }
        }

        booking.setTotalServiceAmount(totalServiceAmount);
        booking.setTotalAmount(totalPitchAmount.add(totalServiceAmount));
        
        // Tiền cọc giữ chỗ mặc định 30% tổng đơn
        booking.setDepositAmount(booking.getTotalAmount().multiply(new BigDecimal("0.30")));

        Booking saved = bookingRepository.save(booking);

        // 5. Khi đặt sân -> gọi PaymentTransactionService tạo transaction mặc định (type DEPOSIT, status PENDING)
        try {
            PaymentTransactionCreateRequest txReq = PaymentTransactionCreateRequest.builder()
                    .bookingId(saved.getId())
                    .bookingCode(saved.getBookingCode())
                    .paymentType(PaymentType.DEPOSIT.name())
                    .amount(saved.getDepositAmount())
                    .status(PaymentStatus.PENDING.name())
                    .paymentMethodCode(request.getPaymentMethodCode() != null ? request.getPaymentMethodCode() : "VNPAY")
                    .transactionCode(generateUniqueCode("TXN"))
                    .build();
            paymentTransactionService.createTransaction(txReq);
        } catch (Exception ignored) {
        }

        return BookingResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public BookingResponse confirmPaymentSuccess(Long bookingId, BookingConfirmDepositRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn đặt không tồn tại: " + bookingId));

        // 1. Chỉ khi thanh toán cọc thành công mới chính thức insert vào bảng booking_services
        List<ServiceOrderRequest> serviceRequests = (request != null && request.getServices() != null)
                ? request.getServices()
                : List.of();

        if (!serviceRequests.isEmpty()) {
            BigDecimal calculatedServiceAmount = BigDecimal.ZERO;
            for (ServiceOrderRequest itemReq : serviceRequests) {
                if (itemReq.getServiceId() == null || itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                    continue;
                }
                ServiceItem sItem = serviceItemRepository.findById(itemReq.getServiceId())
                        .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại: " + itemReq.getServiceId()));

                BigDecimal itemTotal = sItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                calculatedServiceAmount = calculatedServiceAmount.add(itemTotal);

                BookingServiceItem bsi = BookingServiceItem.builder()
                        .booking(booking)
                        .service(sItem)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(sItem.getPrice()) // Snapshot đơn giá thực tế
                        .totalPrice(itemTotal)
                        .build();

                booking.getServices().add(bsi);
            }
            booking.setTotalServiceAmount(calculatedServiceAmount);
            booking.setTotalAmount(booking.getTotalPitchAmount().add(calculatedServiceAmount));
            booking.setDepositAmount(booking.getTotalAmount().multiply(new BigDecimal("0.30")));
        }

        // 2. Chuyển trạng thái đơn sang CONFIRMED và khóa ca đá sang BOOKED
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        if (booking.getPitchSlot() != null) {
            booking.getPitchSlot().bookSlot(); // Chuyển slot sang BOOKED chính thức
            pitchSlotRepository.save(booking.getPitchSlot());
        }

        Booking saved = bookingRepository.save(booking);

        // 3. Đặt cọc thành công -> chuyển transaction tương ứng sang SUCCESS
        try {
            paymentTransactionService.updateBookingTransactionStatus(saved.getId(), PaymentType.DEPOSIT, PaymentStatus.SUCCESS);
        } catch (Exception ignored) {
        }

        return BookingResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public BookingResponse cancelBookingPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn đặt không tồn tại: " + bookingId));

        // 1. Chuyển trạng thái đơn sang CANCELLED
        booking.setBookingStatus(BookingStatus.CANCELLED);

        // 2. Nhả ca đá về AVAILABLE
        if (booking.getPitchSlot() != null) {
            booking.getPitchSlot().releaseSlot();
            pitchSlotRepository.save(booking.getPitchSlot());
        }

        Booking saved = bookingRepository.save(booking);

        // 3. Ấn hủy -> chuyển transaction sang FAILED
        try {
            paymentTransactionService.updateBookingTransactionStatus(saved.getId(), PaymentType.DEPOSIT, PaymentStatus.FAILED);
        } catch (Exception ignored) {
        }

        return BookingResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public BookingResponse createAdminBooking(AdminBookingCreateRequest request) {
        // 1. Kiểm tra ca đá tồn tại, chưa qua giờ kết thúc và còn trống
        PitchSlot slot = pitchSlotRepository.findById(request.getPitchSlotId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca đá chỉ định"));

        validateSlotForBooking(slot);

        // 2. Kiểm tra phương thức thanh toán (CASH hoặc BANK_TRANSFER) trong bảng payment_method
        String methodCode = request.getPaymentMethodCode() != null
                ? request.getPaymentMethodCode().trim().toUpperCase()
                : "CASH";
        if (!"CASH".equals(methodCode) && !"BANK_TRANSFER".equals(methodCode)) {
            throw new RuntimeException("Phương thức cọc/thanh toán tại quầy chỉ hỗ trợ CASH hoặc BANK_TRANSFER");
        }
        PaymentMethod paymentMethod = paymentMethodRepository.findByCode(methodCode)
                .filter(PaymentMethod::isActive)
                .orElseThrow(() -> new RuntimeException("Phương thức thanh toán " + methodCode + " chưa tồn tại hoặc đang bị khóa trong bảng payment_method"));

        // 3. Khóa cứng ca đá sang BOOKED ngay lập tức
        slot.bookSlot();
        pitchSlotRepository.save(slot);

        // 4. Khởi tạo Booking tại quầy (bookingType = DIRECT, status = CONFIRMED)
        BigDecimal totalPitchAmount = slot.getPrice();
        BigDecimal totalServiceAmount = BigDecimal.ZERO;

        Booking booking = Booking.builder()
                .bookingCode(generateUniqueCode("BK"))
                .pitchSlot(slot)
                .guestName(request.getGuestName().trim())
                .guestPhone(request.getGuestPhone().trim())
                .totalPitchAmount(totalPitchAmount)
                .bookingType("DIRECT")
                .status(BookingStatus.CONFIRMED.name())
                .customerNote(request.getCustomerNote())
                .build();

        // 5. Nếu có dịch vụ đi kèm -> lưu luôn vào booking_services
        if (request.getServices() != null && !request.getServices().isEmpty()) {
            for (ServiceOrderRequest itemReq : request.getServices()) {
                if (itemReq.getServiceId() == null || itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                    continue;
                }
                ServiceItem sItem = serviceItemRepository.findById(itemReq.getServiceId())
                        .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại: " + itemReq.getServiceId()));

                BigDecimal itemTotal = sItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                totalServiceAmount = totalServiceAmount.add(itemTotal);

                BookingServiceItem bsi = BookingServiceItem.builder()
                        .booking(booking)
                        .service(sItem)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(sItem.getPrice())
                        .totalPrice(itemTotal)
                        .build();
                booking.getServices().add(bsi);
            }
        }

        booking.setTotalServiceAmount(totalServiceAmount);
        BigDecimal totalAmount = totalPitchAmount.add(totalServiceAmount);
        booking.setTotalAmount(totalAmount);

        // 6. Tính tiền cọc / thanh toán (DEPOSIT 30% hoặc FULL 100%)
        boolean isFullPayment = "FULL".equalsIgnoreCase(request.getPaymentType());
        PaymentType txType = isFullPayment ? PaymentType.FULL : PaymentType.DEPOSIT;
        BigDecimal paidAmount = isFullPayment
                ? totalAmount
                : totalAmount.multiply(new BigDecimal("0.30"));
        booking.setDepositAmount(paidAmount);

        Booking saved = bookingRepository.save(booking);

        // 7. Tạo giao dịch thanh toán thành công ngay lập tức (status = SUCCESS)
        PaymentTransactionCreateRequest txReq = PaymentTransactionCreateRequest.builder()
                .bookingId(saved.getId())
                .bookingCode(saved.getBookingCode())
                .paymentMethodId(paymentMethod.getId())
                .paymentMethodCode(paymentMethod.getCode())
                .paymentType(txType.name())
                .amount(paidAmount)
                .status(PaymentStatus.SUCCESS.name())
                .transactionCode(generateUniqueCode("TXN"))
                .build();
        paymentTransactionService.createTransaction(txReq);

        return BookingResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(Long bookingId, BookingUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn đặt sân không tồn tại: " + bookingId));

        // Chỉ cho phép sửa khi đơn ở trạng thái CONFIRMED hoặc CHECKED_IN
        BookingStatus currentStatus = BookingStatus.from(booking.getStatus());
        if (currentStatus != BookingStatus.CONFIRMED && currentStatus != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Chỉ được phép chỉnh sửa đơn khi đang ở trạng thái CONFIRMED hoặc CHECKED_IN!");
        }

        // 1. Cập nhật thông tin khách hàng & ghi chú (không cho phép đổi ca đá)
        booking.setGuestName(request.getGuestName().trim());
        booking.setGuestPhone(request.getGuestPhone().trim());
        booking.setCustomerNote(request.getCustomerNote());

        booking.calculateTotalAmount();
        bookingRepository.save(booking);

        // 3. Nếu có truyền danh sách dịch vụ -> gọi sang hàm update 1 của BookingServiceItemService
        if (request.getServices() != null) {
            bookingServiceItemService.updateBookingServices(booking.getId(), request.getServices());
        }

        Booking refreshed = bookingRepository.findById(booking.getId()).orElse(booking);
        return BookingResponse.fromEntity(refreshed);
    }

    @Override
    @Transactional
    public BookingResponse updateSingleBookingService(Long bookingId, ServiceOrderRequest request) {
        // Gọi sang hàm update 2 của BookingServiceItemService để cập nhật số lượng 1 dịch vụ
        bookingServiceItemService.updateSingleBookingService(
                bookingId,
                request.getServiceId(),
                request.getQuantity()
        );

        Booking updated = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn đặt sân không tồn tại: " + bookingId));
        return BookingResponse.fromEntity(updated);
    }
}
