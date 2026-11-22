package com.fpms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCreateRequest {

    @NotNull(message = "Mã ca đá (pitchSlotId) không được để trống")
    private Long pitchSlotId;

    private Long customerId;
    private String guestName;
    private String guestPhone;
    private String bookingType;
    private String customerNote;

    private List<ServiceOrderRequest> services;
}
