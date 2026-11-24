package com.fpms.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO yêu cầu tạo mới giao dịch thanh toán (Payment Transaction).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionCreateRequest {

    /**
     * Mã giao dịch từ cổng thanh toán (VNPay, MoMo...) hoặc do hệ thống tự sinh nếu để trống.
     */
    @Size(max = 100, message = "Mã giao dịch không được vượt quá 100 ký tự")
    private String transactionCode;

    /**
     * ID đơn đặt sân liên kết.
     */
    @NotNull(message = "Mã đơn đặt sân (bookingId) không được để trống")
    private Long bookingId;

    /**
     * Mã đơn đặt sân (tùy chọn tra cứu thay thế).
     */
    private String bookingCode;

    /**
     * ID phương thức thanh toán (VNPAY, TIỀN MẶT, CHUYỂN KHOẢN...).
     */
    private Long paymentMethodId;

    /**
     * Mã phương thức thanh toán (VNPAY, MOMO, CASH, BANK_TRANSFER).
     */
    private String paymentMethodCode;

    /**
     * Loại giao dịch: DEPOSIT (Đặt cọc), FULL (Toàn bộ), REMAINING (Còn lại), REFUND (Hoàn tiền).
     */
    @NotBlank(message = "Loại giao dịch không được để trống")
    @Pattern(regexp = "^(DEPOSIT|FULL|REMAINING|REFUND)$", message = "Loại giao dịch phải là DEPOSIT, FULL, REMAINING hoặc REFUND")
    @Builder.Default
    private String paymentType = "DEPOSIT";

    /**
     * Số tiền thanh toán thực tế của giao dịch.
     */
    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền giao dịch tối thiểu là 1.000 VNĐ")
    private BigDecimal amount;

    /**
     * Trạng thái giao dịch: PENDING (Chờ xử lý), SUCCESS (Thành công), FAILED (Thất bại).
     */
    @Pattern(regexp = "^(PENDING|SUCCESS|FAILED)$", message = "Trạng thái giao dịch phải là PENDING, SUCCESS hoặc FAILED")
    @Builder.Default
    private String status = "PENDING";
}
