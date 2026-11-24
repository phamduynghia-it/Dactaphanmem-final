package com.fpms.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isActive")
    private boolean isActive;

    private String description;

    @JsonProperty("isActive")
    public boolean isActive() {
        return this.isActive;
    }

    @JsonProperty("active")
    public boolean getActive() {
        return this.isActive;
    }

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
