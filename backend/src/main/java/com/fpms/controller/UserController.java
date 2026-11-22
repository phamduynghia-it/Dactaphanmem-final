package com.fpms.controller;

import com.fpms.dto.response.ApiResponse;
import com.fpms.dto.response.UserResponse;
import com.fpms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "5. Người dùng (Users)", description = "APIs quản lý tài khoản khách hàng, nhân viên và phân quyền")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả người dùng trong hệ thống")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> responses = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết người dùng theo ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", response));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Tra cứu tài khoản theo email")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Tìm thấy thông tin người dùng", response));
    }
}
