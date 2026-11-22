package com.fpms.controller;

import com.fpms.entity.ServiceItem;
import com.fpms.repository.ServiceItemRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@Tag(name = "Service Controller", description = "APIs danh mục dịch vụ tiện ích")
public class ServiceItemController {

    private final ServiceItemRepository serviceItemRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách các dịch vụ đang mở bán")
    public ResponseEntity<List<ServiceItem>> getActiveServices() {
        return ResponseEntity.ok(serviceItemRepository.findByIsActiveTrue());
    }
}
