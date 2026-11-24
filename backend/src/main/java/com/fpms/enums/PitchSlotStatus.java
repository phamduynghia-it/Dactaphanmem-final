package com.fpms.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

/**
 * Trạng thái của một Ca đá (PitchSlot) trên sân.
 * Phản ánh tình trạng khả dụng vật lý của sân tại khung giờ cụ thể.
 */
@Getter
public enum PitchSlotStatus {

    AVAILABLE("Trống / Sẵn sàng"),
    HOLDING("Đang giữ chỗ"),
    BOOKED("Đã đặt"),
    MAINTENANCE("Bảo trì"),
    CLOSED("Khóa ca");

    private final String description;

    PitchSlotStatus(String description) {
        this.description = description;
    }

    /**
     * Ca đá có thể nhận đặt sân hay không.
     */
    public boolean isAvailable() {
        return this == AVAILABLE;
    }

    /**
     * Ca đá đã có khách đặt và xác nhận.
     */
    public boolean isBooked() {
        return this == BOOKED;
    }

    /**
     * Ca đá đang được giữ chỗ tạm thời (chờ thanh toán cọc).
     */
    public boolean isHolding() {
        return this == HOLDING;
    }

    /**
     * Ca đá không thể sử dụng do bảo trì hoặc chủ sân chủ động khóa.
     */
    public boolean isUnavailable() {
        return this == MAINTENANCE || this == CLOSED;
    }

    @JsonCreator
    public static PitchSlotStatus from(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (PitchSlotStatus status : values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown PitchSlotStatus: " + value);
    }
}
