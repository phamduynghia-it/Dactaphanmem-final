package com.fpms.dto.response;

import com.fpms.entity.BookingServiceItem;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingServiceItemResponse {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String unit;
    private String category;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    public static BookingServiceItemResponse fromEntity(BookingServiceItem item) {
        if (item == null) return null;
        return BookingServiceItemResponse.builder()
                .id(item.getId())
                .serviceId(item.getService() != null ? item.getService().getId() : null)
                .serviceName(item.getService() != null ? item.getService().getName() : null)
                .unit(item.getService() != null ? item.getService().getUnit() : null)
                .category(item.getService() != null ? item.getService().getCategory() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
