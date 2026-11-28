package com.fpms.service;

import com.fpms.dto.request.ServiceOrderRequest;
import com.fpms.dto.response.BookingServiceItemResponse;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service chuyên quản lý chi tiết dịch vụ đi kèm của đơn đặt sân (bảng booking_services).
 */
public interface BookingServiceItemService {

    /**
     * Hàm update 1: Đồng bộ/cập nhật toàn bộ danh sách dịch vụ đi kèm của một Booking.
     * Tự động cập nhật lại totalServiceAmount và totalAmount của Booking.
     */
    BigDecimal updateBookingServices(Long bookingId, List<ServiceOrderRequest> services);

    /**
     * Hàm update 2: Cập nhật số lượng của một dịch vụ cụ thể trong Booking
     * (quantity <= 0 sẽ xóa dịch vụ đó khỏi đơn, > 0 sẽ cập nhật hoặc thêm mới).
     */
    BookingServiceItemResponse updateSingleBookingService(Long bookingId, Long serviceId, Integer quantity);
}
