package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.PitchSlotResponse;
import com.fpms.service.PitchSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pitch-slots")
@RequiredArgsConstructor
@Tag(name = "1. Quản lý Ca Đá (Pitch Slots)", description = "APIs tra cứu và quản lý lịch ca đá theo ngày")
public class PitchSlotController {

    private final PitchSlotService pitchSlotService;

    @GetMapping
    @Operation(summary = "Lấy danh sách ca đá theo ngày (mặc định hôm nay)")
    public ResponseEntity<ApiResponse<List<PitchSlotResponse>>> getSlotsByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<PitchSlotResponse> responses = pitchSlotService.getSlotsByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ca đá thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết một ca đá theo ID")
    public ResponseEntity<ApiResponse<PitchSlotResponse>> getSlotById(@PathVariable Long id) {
        PitchSlotResponse response = pitchSlotService.getSlotById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin ca đá thành công", response));
    }

    @GetMapping("/available")
    @Operation(summary = "Lấy danh sách các ca đá còn trống theo ngày")
    public ResponseEntity<ApiResponse<List<PitchSlotResponse>>> getAvailableSlots(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<PitchSlotResponse> responses = pitchSlotService.getAvailableSlots(date);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ca đá còn trống thành công", responses));
    }

    @PostMapping("/generate")
    @Operation(summary = "Tự động sinh lịch ca đá cho N ngày tới theo ma trận giá")
    public ResponseEntity<ApiResponse<String>> generateSlots(
            @RequestParam(defaultValue = "30") int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(days);
        int generatedCount = pitchSlotService.generateSlots(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Đã sinh/cập nhật thành công ca đá từ ngày %s đến %s (tổng cộng %d ca mới được tạo)", startDate, endDate, generatedCount),
                null));
    }
}
