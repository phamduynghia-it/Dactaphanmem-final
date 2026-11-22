package com.fpms.service;

import com.fpms.dto.response.PaymentTransactionResponse;

import java.util.List;

public interface PaymentTransactionService {
    List<PaymentTransactionResponse> getAllTransactions();
    PaymentTransactionResponse getTransactionById(Long id);
    List<PaymentTransactionResponse> getTransactionsByBookingId(Long bookingId);
}
