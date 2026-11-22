package com.fpms.controller;

import com.fpms.dto.response.PitchSlotResponse;
import com.fpms.entity.PitchSlot;
import com.fpms.repository.PitchSlotRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pitch-slots")
@RequiredArgsConstructor
@Tag(name = "Pitch Slot Controller", description = "APIs tra cứu lịch ca đá theo ngày")
public class PitchSlotController {

    private final PitchSlotRepository pitchSlotRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách ca đá theo ngày (mặc định là hôm nay)")
    public ResponseEntity<List<PitchSlotResponse>> getSlotsByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        List<PitchSlot> slots = pitchSlotRepository.findBySlotDate(queryDate);

        List<PitchSlotResponse> responses = slots.stream().map(slot -> PitchSlotResponse.builder()
                .id(slot.getId())
                .pitchId(slot.getPitch() != null ? slot.getPitch().getId() : null)
                .pitchName(slot.getPitch() != null ? slot.getPitch().getName() : "Sân bóng")
                .timeSlotId(slot.getTimeSlot() != null ? slot.getTimeSlot().getId() : null)
                .startTime(slot.getTimeSlot() != null ? slot.getTimeSlot().getStartTime() : null)
                .endTime(slot.getTimeSlot() != null ? slot.getTimeSlot().getEndTime() : null)
                .slotDate(slot.getSlotDate())
                .price(slot.getPrice())
                .status(slot.getStatus())
                .peakHour(slot.getTimeSlot() != null && slot.getTimeSlot().isPeakHour())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
}
