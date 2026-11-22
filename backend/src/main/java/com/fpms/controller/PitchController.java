package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.PitchResponse;
import com.fpms.service.PitchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pitches")
@RequiredArgsConstructor
@Tag(name = "6. Quản lý Sân (Pitches)", description = "APIs danh mục các sân bóng đá mini và thông tin sân")
public class PitchController {

    private final PitchService pitchService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các sân bóng")
    public ResponseEntity<ApiResponse<List<PitchResponse>>> getAllPitches() {
        List<PitchResponse> responses = pitchService.getAllPitches();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sân bóng thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết sân bóng theo ID")
    public ResponseEntity<ApiResponse<PitchResponse>> getPitchById(@PathVariable Long id) {
        PitchResponse response = pitchService.getPitchById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sân bóng thành công", response));
    }
}
