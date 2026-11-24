package com.fpms.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceItemUpdateRequest {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(max = 150, message = "Tên dịch vụ không được vượt quá 150 ký tự")
    private String name;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(max = 50, message = "Đơn vị tính không được vượt quá 50 ký tự")
    private String unit;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0", message = "Đơn giá dịch vụ phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    private String category; // DRINK, EQUIPMENT, REFEREE

    @Size(max = 500, message = "Mô tả dịch vụ không được vượt quá 500 ký tự")
    private String description;

    private Boolean isActive;
}
