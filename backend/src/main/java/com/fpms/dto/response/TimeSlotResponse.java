package com.fpms.dto.response;

import com.fpms.entity.TimeSlot;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlotResponse {
    private Long id;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isPeakHour;
    private boolean isActive;

    public static TimeSlotResponse fromEntity(TimeSlot slot) {
        if (slot == null) return null;
        return TimeSlotResponse.builder()
                .id(slot.getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isPeakHour(slot.isPeakHour())
                .isActive(slot.isActive())
                .build();
    }
}
