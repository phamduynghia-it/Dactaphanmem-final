package com.fpms.service.impl;

import com.fpms.dto.request.BookingConfirmDepositRequest;
import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.dto.request.PaymentTransactionCreateRequest;
import com.fpms.dto.request.ServiceOrderRequest;
import com.fpms.dto.response.BookingResponse;
import com.fpms.entity.*;
import com.fpms.enums.BookingStatus;
import com.fpms.enums.PaymentStatus;
import com.fpms.enums.PaymentType;
import com.fpms.repository.*;
import com.fpms.service.BookingService;
import com.fpms.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
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
        // 1. Kiểm tra slot sân có khả dụng không
        PitchSlot slot = pitchSlotRepository.findById(request.getPitchSlotId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca đá chỉ định"));

        if (!slot.isAvailable()) {
            throw new RuntimeException("Ca đá này đã được đặt hoặc đang được giữ chỗ!");
        }

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
                .bookingCode("BK" + System.currentTimeMillis())
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
                    .transactionCode("TXN" + System.currentTimeMillis())
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
}
