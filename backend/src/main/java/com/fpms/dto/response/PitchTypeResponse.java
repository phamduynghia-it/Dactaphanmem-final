package com.fpms.dto.response;

import com.fpms.entity.PitchType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchTypeResponse {
    private Long id;
    private String name;
    private Integer playerCapacity;
    private String description;

    public static PitchTypeResponse fromEntity(PitchType pt) {
        if (pt == null) return null;
        return PitchTypeResponse.builder()
                .id(pt.getId())
                .name(pt.getName())
                .playerCapacity(pt.getPlayerCapacity())
                .description(pt.getDescription())
                .build();
    }
}
