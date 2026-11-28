package com.fpms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * DTO cập nhật thông tin đơn đặt sân & dịch vụ đi kèm
 * (chỉ áp dụng khi đơn đang ở trạng thái CONFIRMED hoặc CHECKED_IN).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingUpdateRequest {

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(max = 100, message = "Tên khách hàng không được vượt quá 100 ký tự")
    private String guestName;

    @NotBlank(message = "Số điện thoại khách hàng không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng (10 chữ số, VD: 0987654321)")
    private String guestPhone;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String customerNote;

    /**
     * Danh sách dịch vụ đi kèm mới (nếu truyền lên sẽ đồng bộ qua BookingServiceItemService)
     */
    @Valid
    private List<ServiceOrderRequest> services;
}
