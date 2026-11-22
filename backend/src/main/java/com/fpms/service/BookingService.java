package com.fpms.service;

import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.dto.response.BookingResponse;
import com.fpms.entity.*;
import com.fpms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PitchSlotRepository pitchSlotRepository;
    private final ServiceItemRepository serviceItemRepository;

    @Transactional
    public Booking createBooking(BookingCreateRequest request) {
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

        Booking booking = Booking.builder()
                .bookingCode("BK" + System.currentTimeMillis())
                .pitchSlot(slot)
                .customerId(request.getCustomerId())
                .guestName(request.getGuestName())
                .guestPhone(request.getGuestPhone())
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

        return bookingRepository.save(booking);
    }

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
