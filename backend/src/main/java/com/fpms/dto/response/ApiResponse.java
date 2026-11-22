package com.fpms.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

/**
 * Cấu trúc chuẩn hóa dữ liệu trả về duy nhất cho toàn bộ hệ thống API (FPMS)
 *
 * @param <T> Kiểu dữ liệu của payload trả về
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private int status = 200;

    @Builder.Default
    private boolean success = true;

    private String message;

    private T data;

    @Builder.Default
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp = LocalDateTime.now();

    // ==========================================
    // CÁC HÀM TIỆN ÍCH KHỞI TẠO NHANH (STATIC FACTORY)
    // ==========================================

    /**
     * Thành công với dữ liệu mặc định (HTTP 200)
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message("Thao tác thành công")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Thành công kèm thông điệp tùy chỉnh (HTTP 200)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Tạo mới thành công (HTTP 201 Created)
     */
    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.CREATED.value())
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Thông báo lỗi tùy biến mã trạng thái
     */
    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .success(false)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Thông báo lỗi theo HttpStatus
     */
    public static <T> ApiResponse<T> error(HttpStatus status, String message) {
        return error(status.value(), message);
    }

    /**
     * Lỗi 400 Bad Request
     */
    public static <T> ApiResponse<T> badRequest(String message) {
        return error(HttpStatus.BAD_REQUEST, message);
    }

    /**
     * Lỗi 404 Not Found
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return error(HttpStatus.NOT_FOUND, message);
    }

    /**
     * Lỗi 500 Internal Server Error
     */
    public static <T> ApiResponse<T> internalError(String message) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
}
