package com.fpms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCreateRequest {

    @NotNull(message = "Mã ca đá (pitchSlotId) không được để trống")
    private Long pitchSlotId;

    private Long customerId;

    @NotBlank(message = "Họ tên người đặt sân không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String guestName;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng (10 chữ số, VD: 0987654321)")
    private String guestPhone;

    private String bookingType;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String customerNote;

    private String paymentMethodCode;

    @Valid
    private List<ServiceOrderRequest> services;
}
