package com.fpms.controller;

import com.fpms.dto.request.BookingConfirmDepositRequest;
import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.BookingResponse;
import com.fpms.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "2. Quản lý Đơn (Bookings)", description = "APIs đặt sân và quản lý danh sách đơn đặt")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các đơn đặt sân")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> responses = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn đặt sân thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết đơn đặt sân theo ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn đặt sân thành công", response));
    }

    @GetMapping("/code/{bookingCode}")
    @Operation(summary = "Tra cứu đơn đặt sân theo mã booking (bookingCode)")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByCode(@PathVariable String bookingCode) {
        BookingResponse response = bookingService.getBookingByCode(bookingCode);
        return ResponseEntity.ok(ApiResponse.success("Tra cứu đơn đặt sân thành công", response));
    }

    @PostMapping
    @Operation(summary = "Khách hàng tạo đơn đặt sân kèm dịch vụ")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo đơn đặt sân thành công", response));
    }

    @PostMapping("/{id}/confirm-payment")
    @Operation(summary = "Xác nhận thanh toán cọc thành công (mô phỏng cổng thanh toán VNPay) và lưu dịch vụ")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmPayment(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) BookingConfirmDepositRequest request) {
        BookingResponse response = bookingService.confirmPaymentSuccess(id, request);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận thanh toán đơn đặt sân thành công", response));
    }

    @PostMapping("/{id}/cancel-payment")
    @Operation(summary = "Hủy giao dịch thanh toán đặt cọc của đơn đặt sân")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelPayment(@PathVariable Long id) {
        BookingResponse response = bookingService.cancelBookingPayment(id);
        return ResponseEntity.ok(ApiResponse.success("Hủy giao dịch thanh toán thành công", response));
    }
}
