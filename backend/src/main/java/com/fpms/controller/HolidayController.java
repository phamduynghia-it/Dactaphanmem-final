package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.HolidayResponse;
import com.fpms.service.HolidayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/holidays")
@RequiredArgsConstructor
@Tag(name = "Ngày Lễ (Holidays)", description = "APIs tra cứu danh mục ngày lễ áp dụng phụ thu đặc biệt")
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    @Operation(summary = "Lấy danh sách các ngày lễ trong hệ thống (chỉ xem)")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getAllHolidays() {
        List<HolidayResponse> responses = holidayService.getAllHolidays();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ngày lễ thành công", responses));
    }
}
