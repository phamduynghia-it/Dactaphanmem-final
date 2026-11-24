package com.fpms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceItemUpdateRequest {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    private String name;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unit;

    @NotNull(message = "Đơn giá không được để trống")
    private BigDecimal price;

    private String category; // DRINK, EQUIPMENT, REFEREE

    private String description;

    private Boolean isActive;
}
