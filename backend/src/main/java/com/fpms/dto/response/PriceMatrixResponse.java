package com.fpms.dto.response;

import com.fpms.entity.PriceMatrix;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceMatrixResponse {
    private Long id;
    private boolean isPeakHour;
    private Long pitchTypeId;
    private String pitchTypeName;
    private String dayType;
    private BigDecimal price;

    public static PriceMatrixResponse fromEntity(PriceMatrix pm) {
        if (pm == null) return null;
        return PriceMatrixResponse.builder()
                .id(pm.getId())
                .isPeakHour(pm.isPeakHour())
                .pitchTypeId(pm.getPitchType() != null ? pm.getPitchType().getId() : null)
                .pitchTypeName(pm.getPitchType() != null ? pm.getPitchType().getName() : null)
                .dayType(pm.getDayType())
                .price(pm.getPrice())
                .build();
    }
}
