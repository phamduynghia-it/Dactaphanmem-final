package com.fpms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * DTO xác nhận thanh toán cọc thành công từ cổng thanh toán (mô phỏng VNPay).
 * Lúc này danh sách dịch vụ DTO mới chính thức được gửi lên để insert vào bảng booking_services.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingConfirmDepositRequest {

    @Valid
    private List<ServiceOrderRequest> services;

    @Size(max = 100, message = "Mã giao dịch thanh toán không được vượt quá 100 ký tự")
    private String paymentTransactionCode;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;
}
