package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.PitchTypeResponse;
import com.fpms.service.PitchTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pitch-types")
@RequiredArgsConstructor
@Tag(name = "Loại Sân (Pitch Types)", description = "APIs danh mục loại sân bóng (sân 5, 7, 11)")
public class PitchTypeController {

    private final PitchTypeService pitchTypeService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các loại sân bóng")
    public ResponseEntity<ApiResponse<List<PitchTypeResponse>>> getAllPitchTypes() {
        List<PitchTypeResponse> responses = pitchTypeService.getAllPitchTypes();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách loại sân thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết loại sân theo ID")
    public ResponseEntity<ApiResponse<PitchTypeResponse>> getPitchTypeById(@PathVariable Long id) {
        PitchTypeResponse response = pitchTypeService.getPitchTypeById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin loại sân thành công", response));
    }
}
