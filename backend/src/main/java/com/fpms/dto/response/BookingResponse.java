package com.fpms.dto.response;

import com.fpms.entity.Booking;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    
    // Thông tin slot sân
    private Long pitchSlotId;
    private String pitchName;
    private LocalDate dateslot;
    private LocalTime startTime;
    private LocalTime endTime;

    // Thông tin khách hàng
    private Long customerId;
    private String customerName;
    private String guestName;
    private String guestPhone;

    // Thông tin tài chính
    private BigDecimal totalPitchAmount;
    private BigDecimal totalServiceAmount;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private String bookingType;
    private String status;
    private String customerNote;

    // Chi tiết dịch vụ đi kèm
    @Builder.Default
    private List<BookingServiceItemResponse> services = new ArrayList<>();

    public static BookingResponse fromEntity(Booking booking) {
        if (booking == null) return null;

        String pitchName = null;
        LocalDate dateslot = null;
        LocalTime startTime = null;
        LocalTime endTime = null;

        if (booking.getPitchSlot() != null) {
            pitchName = booking.getPitchSlot().getPitch() != null ? booking.getPitchSlot().getPitch().getName() : null;
            dateslot = booking.getPitchSlot().getDateslot();
            if (booking.getPitchSlot().getTimeSlot() != null) {
                startTime = booking.getPitchSlot().getTimeSlot().getStartTime();
                endTime = booking.getPitchSlot().getTimeSlot().getEndTime();
            }
        }

        List<BookingServiceItemResponse> serviceResponses = new ArrayList<>();
        if (booking.getServices() != null) {
            serviceResponses = booking.getServices().stream()
                    .map(BookingServiceItemResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .pitchSlotId(booking.getPitchSlot() != null ? booking.getPitchSlot().getId() : null)
                .pitchName(pitchName)
                .dateslot(dateslot)
                .startTime(startTime)
                .endTime(endTime)
                .customerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
                .customerName(booking.getCustomer() != null ? booking.getCustomer().getFullName() : null)
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .totalPitchAmount(booking.getTotalPitchAmount())
                .totalServiceAmount(booking.getTotalServiceAmount())
                .totalAmount(booking.getTotalAmount())
                .depositAmount(booking.getDepositAmount())
                .bookingType(booking.getBookingType())
                .status(booking.getStatus())
                .customerNote(booking.getCustomerNote())
                .services(serviceResponses)
                .build();
    }
}
