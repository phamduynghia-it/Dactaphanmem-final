package com.fpms.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long pitchSlotId;
    private String pitchName;
    private String startTime;
    private String endTime;
    private String guestName;
    private String guestPhone;
    private BigDecimal totalPitchAmount;
    private BigDecimal totalServiceAmount;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private String status;
    private LocalDateTime createdAt;
}
