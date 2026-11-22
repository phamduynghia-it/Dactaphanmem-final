package com.fpms.controller;

import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.entity.Booking;
import com.fpms.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Controller", description = "APIs đặt sân và quản lý đơn đặt")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Khách hàng tạo đơn đặt sân kèm dịch vụ")
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        Booking booking = bookingService.createBooking(request);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/confirm-payment")
    @Operation(summary = "Xác nhận thanh toán cọc thành công (webhook/callback)")
    public ResponseEntity<String> confirmPayment(@PathVariable Long id) {
        bookingService.confirmPaymentSuccess(id);
        return ResponseEntity.ok("Xác nhận thanh toán đơn đặt sân thành công");
    }
}
