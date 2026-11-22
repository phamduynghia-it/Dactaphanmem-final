package com.fpms.service;

import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {
    List<BookingResponse> getAllBookings();
    BookingResponse getBookingById(Long id);
    BookingResponse getBookingByCode(String bookingCode);
    BookingResponse createBooking(BookingCreateRequest request);
    void confirmPaymentSuccess(Long bookingId);
}
