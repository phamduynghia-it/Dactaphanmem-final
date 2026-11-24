package com.fpms.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

/**
 * Trạng thái của một Đơn đặt sân (Booking).
 * Quản lý vòng đời giao dịch từ lúc đặt cọc, nhận sân cho đến khi hoàn tất thanh toán.
 */
@Getter
public enum BookingStatus {

    PENDING_PAYMENT("Chờ thanh toán cọc"),
    CONFIRMED("Đã xác nhận"),
    CHECKED_IN("Đã nhận sân / Đang đá"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy"),
    NO_SHOW("Khách không đến");

    private final String description;

    BookingStatus(String description) {
        this.description = description;
    }

    public boolean isPendingPayment() {
        return this == PENDING_PAYMENT;
    }

    public boolean isConfirmed() {
        return this == CONFIRMED;
    }

    public boolean isCheckedIn() {
        return this == CHECKED_IN;
    }

    public boolean isCompleted() {
        return this == COMPLETED;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }

    public boolean isNoShow() {
        return this == NO_SHOW;
    }

    /**
     * Kiểm tra xem đơn có được phép hủy hay không.
     * Chỉ cho phép hủy khi đang chờ thanh toán hoặc đã xác nhận (trước giờ thi đấu).
     */
    public boolean isCancellable() {
        return this == PENDING_PAYMENT || this == CONFIRMED;
    }

    /**
     * Kiểm tra xem đơn đã ở trạng thái kết thúc chu trình nghiệp vụ hay chưa.
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == NO_SHOW;
    }

    @JsonCreator
    public static BookingStatus from(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (BookingStatus status : values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown BookingStatus: " + value);
    }
}
