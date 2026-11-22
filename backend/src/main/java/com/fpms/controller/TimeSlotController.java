package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.TimeSlotResponse;
import com.fpms.service.TimeSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/time-slots")
@RequiredArgsConstructor
@Tag(name = "7. Khung giờ (Time Slots)", description = "APIs danh mục các ca đá cố định trong ngày và giờ cao điểm")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các khung giờ ca đá")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getAllTimeSlots() {
        List<TimeSlotResponse> responses = timeSlotService.getAllTimeSlots();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khung giờ thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết khung giờ theo ID")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> getTimeSlotById(@PathVariable Long id) {
        TimeSlotResponse response = timeSlotService.getTimeSlotById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin khung giờ thành công", response));
    }
}
