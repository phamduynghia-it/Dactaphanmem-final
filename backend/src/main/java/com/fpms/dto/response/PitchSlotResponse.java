package com.fpms.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fpms.entity.PitchSlot;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchSlotResponse {
    private Long id;
    private Long pitchId;
    private String pitchName;
    private String pitchTypeName;
    private Long timeSlotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate dateslot;
    private LocalDate slotDate; // Alias
    private BigDecimal price;
    private String status;
    @JsonProperty("peakHour")
    private boolean peakHour;

    @JsonProperty("isPeakHour")
    public boolean isPeakHour() {
        return this.peakHour;
    }

    private LocalDateTime holdExpiresAt;

    public static PitchSlotResponse fromEntity(PitchSlot slot) {
        if (slot == null) return null;

        String pitchName = slot.getPitch() != null ? slot.getPitch().getName() : null;
        String pitchTypeName = (slot.getPitch() != null && slot.getPitch().getPitchType() != null)
                ? slot.getPitch().getPitchType().getName() : null;

        LocalTime startTime = slot.getTimeSlot() != null ? slot.getTimeSlot().getStartTime() : null;
        LocalTime endTime = slot.getTimeSlot() != null ? slot.getTimeSlot().getEndTime() : null;
        boolean isPeak = slot.getTimeSlot() != null && slot.getTimeSlot().isPeakHour();

        return PitchSlotResponse.builder()
                .id(slot.getId())
                .pitchId(slot.getPitch() != null ? slot.getPitch().getId() : null)
                .pitchName(pitchName)
                .pitchTypeName(pitchTypeName)
                .timeSlotId(slot.getTimeSlot() != null ? slot.getTimeSlot().getId() : null)
                .startTime(startTime)
                .endTime(endTime)
                .dateslot(slot.getDateslot())
                .slotDate(slot.getDateslot())
                .price(slot.getPrice())
                .status(slot.getStatus())
                .peakHour(isPeak)
                .holdExpiresAt(slot.getHoldExpiresAt())
                .build();
    }
}
