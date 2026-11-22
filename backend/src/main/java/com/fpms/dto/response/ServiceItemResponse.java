package com.fpms.dto.response;

import com.fpms.entity.ServiceItem;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceItemResponse {
    private Long id;
    private String name;
    private String unit;
    private BigDecimal price;
    private String category;
    private boolean isActive;
    private String description;

    public static ServiceItemResponse fromEntity(ServiceItem item) {
        if (item == null) return null;
        return ServiceItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .unit(item.getUnit())
                .price(item.getPrice())
                .category(item.getCategory())
                .isActive(item.isActive())
                .description(item.getDescription())
                .build();
    }
}
