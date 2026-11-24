package com.fpms.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

/**
 * Trạng thái của giao dịch thanh toán: Chờ xử lý (PENDING), Thành công (SUCCESS), Thất bại (FAILED).
 */
@Getter
public enum PaymentStatus {

    PENDING("Chờ xử lý"),
    SUCCESS("Thành công"),
    FAILED("Thất bại");

    private final String description;

    PaymentStatus(String description) {
        this.description = description;
    }

    public boolean isPending() {
        return this == PENDING;
    }

    public boolean isSuccess() {
        return this == SUCCESS;
    }

    public boolean isFailed() {
        return this == FAILED;
    }

    @JsonCreator
    public static PaymentStatus from(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (PaymentStatus status : values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown PaymentStatus: " + value);
    }
}
