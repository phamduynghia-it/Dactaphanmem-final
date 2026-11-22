package com.fpms.service.impl;

import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.dto.response.BookingResponse;
import com.fpms.entity.*;
import com.fpms.repository.*;
import com.fpms.service.BookingService;
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
                .status("PENDING_PAYMENT")
                .customerNote(request.getCustomerNote())
                .build();

        // 4. Xử lý các dịch vụ đi kèm (nước uống, áo bib, thuê bóng...)
        if (request.getServices() != null && !request.getServices().isEmpty()) {
            for (var itemReq : request.getServices()) {
                ServiceItem sItem = serviceItemRepository.findById(itemReq.getServiceId())
                        .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại: " + itemReq.getServiceId()));

                BigDecimal itemTotal = sItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                totalServiceAmount = totalServiceAmount.add(itemTotal);

                BookingServiceItem bsi = BookingServiceItem.builder()
                        .booking(booking)
                        .service(sItem)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(sItem.getPrice()) // SNAPSHOT ĐƠN GIÁ TẠI THỜI ĐIỂM ĐẶT
                        .totalPrice(itemTotal)
                        .build();

                booking.getServices().add(bsi);
            }
        }

        booking.setTotalServiceAmount(totalServiceAmount);
        booking.setTotalAmount(totalPitchAmount.add(totalServiceAmount));
        
        // Tiền cọc giữ chỗ mặc định 30% tổng đơn
        booking.setDepositAmount(booking.getTotalAmount().multiply(new BigDecimal("0.30")));

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void confirmPaymentSuccess(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn đặt không tồn tại"));

        booking.setStatus("CONFIRMED");
        booking.getPitchSlot().bookSlot(); // Chuyển slot sang BOOKED chính thức

        bookingRepository.save(booking);
        pitchSlotRepository.save(booking.getPitchSlot());
    }
}
