package com.fpms.dto.response;

import com.fpms.entity.Pitch;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchResponse {
    private Long id;
    private String name;
    private Long pitchTypeId;
    private String pitchTypeName;
    private Integer playerCapacity;
    private String status;
    private String description;

    public static PitchResponse fromEntity(Pitch pitch) {
        if (pitch == null) return null;
        return PitchResponse.builder()
                .id(pitch.getId())
                .name(pitch.getName())
                .pitchTypeId(pitch.getPitchType() != null ? pitch.getPitchType().getId() : null)
                .pitchTypeName(pitch.getPitchType() != null ? pitch.getPitchType().getName() : null)
                .playerCapacity(pitch.getPitchType() != null ? pitch.getPitchType().getPlayerCapacity() : null)
                .status(pitch.getStatus())
                .description(pitch.getDescription())
                .build();
    }
}
