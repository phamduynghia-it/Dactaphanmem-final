package com.fpms.service.impl;

import com.fpms.dto.response.PaymentTransactionResponse;
import com.fpms.entity.PaymentTransaction;
import com.fpms.repository.PaymentTransactionRepository;
import com.fpms.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public List<PaymentTransactionResponse> getAllTransactions() {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findAll();
        return transactions.stream()
                .map(PaymentTransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentTransactionResponse getTransactionById(Long id) {
        PaymentTransaction tx = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch với ID: " + id));
        return PaymentTransactionResponse.fromEntity(tx);
    }

    @Override
    public List<PaymentTransactionResponse> getTransactionsByBookingId(Long bookingId) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByBookingId(bookingId);
        return transactions.stream()
                .map(PaymentTransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
