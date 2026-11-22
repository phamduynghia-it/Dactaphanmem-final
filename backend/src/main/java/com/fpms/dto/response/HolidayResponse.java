package com.fpms.dto.response;

import com.fpms.entity.Holiday;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayResponse {
    private Long id;
    private LocalDate holidayDate;
    private String holidayName;
    private String description;

    public static HolidayResponse fromEntity(Holiday h) {
        if (h == null) return null;
        return HolidayResponse.builder()
                .id(h.getId())
                .holidayDate(h.getHolidayDate())
                .holidayName(h.getHolidayName())
                .description(h.getDescription())
                .build();
    }
}
