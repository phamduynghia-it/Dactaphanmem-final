package com.fpms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * DTO dành cho Admin/Nhân viên tạo đơn đặt sân trực tiếp tại quầy.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBookingCreateRequest {

    @NotNull(message = "Vui lòng chọn ca đá trống")
    private Long pitchSlotId;

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(max = 100, message = "Tên khách hàng không được vượt quá 100 ký tự")
    private String guestName;

    @NotBlank(message = "Số điện thoại khách hàng không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng (10 chữ số, VD: 0987654321)")
    private String guestPhone;

    /**
     * Hình thức thu tiền tại quầy: DEPOSIT (Cọc 30%) hoặc FULL (Thanh toán 100%)
     */
    @NotBlank(message = "Vui lòng chọn hình thức thanh toán / đặt cọc")
    @Pattern(regexp = "^(DEPOSIT|FULL)$", message = "Hình thức thanh toán chỉ hỗ trợ DEPOSIT hoặc FULL")
    @Builder.Default
    private String paymentType = "DEPOSIT";

    /**
     * Phương thức thanh toán trong bảng payment_method: CASH hoặc BANK_TRANSFER
     */
    @NotBlank(message = "Vui lòng chọn phương thức thanh toán")
    @Pattern(regexp = "^(CASH|BANK_TRANSFER)$", message = "Phương thức thanh toán tại quầy chỉ hỗ trợ CASH hoặc BANK_TRANSFER")
    @Builder.Default
    private String paymentMethodCode = "CASH";

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String customerNote;

    @Valid
    private List<ServiceOrderRequest> services;
}
