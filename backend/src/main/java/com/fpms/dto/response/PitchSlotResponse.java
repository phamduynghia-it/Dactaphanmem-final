package com.fpms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private Long timeSlotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate slotDate;
    private BigDecimal price;
    private String status;
    private boolean peakHour;
}
