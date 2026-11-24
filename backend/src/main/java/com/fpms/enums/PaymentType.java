package com.fpms.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

/**
 * Loại hình giao dịch thanh toán: Đặt cọc (DEPOSIT), Thanh toán nốt (REMAINING), Hoàn tiền (REFUND), Thanh toán toàn bộ (FULL).
 */
@Getter
public enum PaymentType {

    DEPOSIT("Đặt cọc"),
    REMAINING("Thanh toán nốt"),
    REFUND("Hoàn tiền"),
    FULL("Thanh toán toàn bộ");

    private final String description;

    PaymentType(String description) {
        this.description = description;
    }

    public boolean isDeposit() {
        return this == DEPOSIT;
    }

    public boolean isRemaining() {
        return this == REMAINING;
    }

    public boolean isRefund() {
        return this == REFUND;
    }

    public boolean isFull() {
        return this == FULL;
    }

    @JsonCreator
    public static PaymentType from(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (PaymentType type : values()) {
            if (type.name().equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown PaymentType: " + value);
    }
}
