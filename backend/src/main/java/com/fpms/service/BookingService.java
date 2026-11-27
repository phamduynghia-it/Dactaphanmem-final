package com.fpms.service;

import com.fpms.dto.request.AdminBookingCreateRequest;
import com.fpms.dto.request.BookingConfirmDepositRequest;
import com.fpms.dto.request.BookingCreateRequest;
import com.fpms.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {
    List<BookingResponse> getAllBookings();
    BookingResponse getBookingById(Long id);
    BookingResponse getBookingByCode(String bookingCode);
    BookingResponse createBooking(BookingCreateRequest request);
    BookingResponse createAdminBooking(AdminBookingCreateRequest request);
    BookingResponse confirmPaymentSuccess(Long bookingId, BookingConfirmDepositRequest request);
    BookingResponse cancelBookingPayment(Long bookingId);
}
