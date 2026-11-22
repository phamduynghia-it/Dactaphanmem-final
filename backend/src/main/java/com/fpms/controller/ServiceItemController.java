package com.fpms.controller;

import com.fpms.dto.request.ServiceItemRequest;
import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.ServiceItemResponse;
import com.fpms.service.ServiceItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@Tag(name = "3. Quản lý Dịch vụ (Services)", description = "APIs CRUD danh mục nước uống, dụng cụ thi đấu và tiện ích")
public class ServiceItemController {

    private final ServiceItemService serviceItemService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các dịch vụ tiện ích")
    public ResponseEntity<ApiResponse<List<ServiceItemResponse>>> getAllServices(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<ServiceItemResponse> responses = serviceItemService.getAllServices(activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục dịch vụ thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết dịch vụ tiện ích theo ID")
    public ResponseEntity<ApiResponse<ServiceItemResponse>> getServiceById(@PathVariable Long id) {
        ServiceItemResponse response = serviceItemService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết dịch vụ thành công", response));
    }

    @PostMapping
    @Operation(summary = "Thêm mới một dịch vụ tiện ích")
    public ResponseEntity<ApiResponse<ServiceItemResponse>> createService(@Valid @RequestBody ServiceItemRequest request) {
        ServiceItemResponse response = serviceItemService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Thêm mới dịch vụ thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin dịch vụ theo ID")
    public ResponseEntity<ApiResponse<ServiceItemResponse>> updateService(
            @PathVariable Long id, 
            @Valid @RequestBody ServiceItemRequest request) {
        ServiceItemResponse response = serviceItemService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ thành công", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa dịch vụ tiện ích theo ID")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceItemService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa dịch vụ thành công", null));
    }
}
