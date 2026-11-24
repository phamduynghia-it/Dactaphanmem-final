package com.fpms.service;

import com.fpms.dto.request.PaymentTransactionCreateRequest;
import com.fpms.dto.response.PaymentTransactionResponse;
import com.fpms.enums.PaymentStatus;
import com.fpms.enums.PaymentType;

import java.util.List;

public interface PaymentTransactionService {
    List<PaymentTransactionResponse> getAllTransactions();
    PaymentTransactionResponse getTransactionById(Long id);
    List<PaymentTransactionResponse> getTransactionsByBookingId(Long bookingId);
    PaymentTransactionResponse createTransaction(PaymentTransactionCreateRequest request);
    void updateBookingTransactionStatus(Long bookingId, PaymentType type, PaymentStatus status);
}
