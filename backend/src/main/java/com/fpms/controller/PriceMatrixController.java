package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.PriceMatrixResponse;
import com.fpms.service.PriceMatrixService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/price-matrices")
@RequiredArgsConstructor
@Tag(name = "8. Bảng giá sân (Price Matrices)", description = "APIs ma trận quy định giá theo loại sân và loại ngày")
public class PriceMatrixController {

    private final PriceMatrixService priceMatrixService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các quy định trong bảng giá sân")
    public ResponseEntity<ApiResponse<List<PriceMatrixResponse>>> getAllPriceMatrices() {
        List<PriceMatrixResponse> responses = priceMatrixService.getAllPriceMatrices();
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng giá sân thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết bảng giá sân theo ID")
    public ResponseEntity<ApiResponse<PriceMatrixResponse>> getPriceMatrixById(@PathVariable Long id) {
        PriceMatrixResponse response = priceMatrixService.getPriceMatrixById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin bảng giá thành công", response));
    }

    @GetMapping("/pitch-type/{pitchTypeId}")
    @Operation(summary = "Lấy bảng giá áp dụng cho một loại sân cụ thể (sân 5, sân 7...)")
    public ResponseEntity<ApiResponse<List<PriceMatrixResponse>>> getByPitchTypeId(@PathVariable Long pitchTypeId) {
        List<PriceMatrixResponse> responses = priceMatrixService.getByPitchTypeId(pitchTypeId);
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng giá theo loại sân thành công", responses));
    }
}
