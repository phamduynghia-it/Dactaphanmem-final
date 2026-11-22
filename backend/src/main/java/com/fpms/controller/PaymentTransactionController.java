package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.PaymentTransactionResponse;
import com.fpms.service.PaymentTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment-transactions")
@RequiredArgsConstructor
@Tag(name = "4. Giao dịch (Payment Transactions)", description = "APIs theo dõi và đối soát giao dịch thanh toán")
public class PaymentTransactionController {

    private final PaymentTransactionService paymentTransactionService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các giao dịch thanh toán")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getAllTransactions() {
        List<PaymentTransactionResponse> responses = paymentTransactionService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách giao dịch thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết giao dịch thanh toán theo ID")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> getTransactionById(@PathVariable Long id) {
        PaymentTransactionResponse response = paymentTransactionService.getTransactionById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin giao dịch thành công", response));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Lấy lịch sử giao dịch thanh toán theo mã đơn đặt sân")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getTransactionsByBookingId(@PathVariable Long bookingId) {
        List<PaymentTransactionResponse> responses = paymentTransactionService.getTransactionsByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử giao dịch theo đơn thành công", responses));
    }
}
