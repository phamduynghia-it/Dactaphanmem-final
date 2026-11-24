package com.fpms.service.impl;

import com.fpms.dto.request.PaymentTransactionCreateRequest;
import com.fpms.dto.response.PaymentTransactionResponse;
import com.fpms.entity.Booking;
import com.fpms.entity.PaymentMethod;
import com.fpms.entity.PaymentTransaction;
import com.fpms.enums.PaymentStatus;
import com.fpms.enums.PaymentType;
import com.fpms.repository.BookingRepository;
import com.fpms.repository.PaymentMethodRepository;
import com.fpms.repository.PaymentTransactionRepository;
import com.fpms.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BookingRepository bookingRepository;
    private final PaymentMethodRepository paymentMethodRepository;

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

    @Override
    @Transactional
    public PaymentTransactionResponse createTransaction(PaymentTransactionCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu tạo giao dịch không được để trống");
        }

        // 1. Tìm Booking liên kết
        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId()).orElse(null);
        }
        if (booking == null && request.getBookingCode() != null && !request.getBookingCode().isBlank()) {
            booking = bookingRepository.findByBookingCode(request.getBookingCode().trim()).orElse(null);
        }
        if (booking == null) {
            throw new RuntimeException("Không tìm thấy đơn đặt sân liên kết (ID: " + request.getBookingId() + ")");
        }

        // 2. Tìm Phương thức thanh toán
        PaymentMethod paymentMethod = null;
        if (request.getPaymentMethodId() != null) {
            paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId()).orElse(null);
        }
        if (paymentMethod == null && request.getPaymentMethodCode() != null && !request.getPaymentMethodCode().isBlank()) {
            paymentMethod = paymentMethodRepository.findByCode(request.getPaymentMethodCode().trim().toUpperCase()).orElse(null);
        }
        if (paymentMethod == null) {
            // Mặc định chọn VNPAY hoặc phương thức đầu tiên có trong DB
            paymentMethod = paymentMethodRepository.findByCode("VNPAY")
                    .orElseGet(() -> paymentMethodRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("Chưa có phương thức thanh toán nào trong hệ thống!")));
        }

        // 3. Chuẩn hóa mã giao dịch
        String txCode = request.getTransactionCode();
        if (txCode == null || txCode.trim().isEmpty()) {
            txCode = "TXN" + System.currentTimeMillis();
        }

        // 4. Số tiền thanh toán
        BigDecimal amount = request.getAmount();
        if (amount == null) {
            amount = booking.getDepositAmount() != null && booking.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                    ? booking.getDepositAmount()
                    : booking.getTotalAmount();
        }

        // 5. Khởi tạo và lưu PaymentTransaction
        PaymentTransaction tx = PaymentTransaction.builder()
                .transactionCode(txCode)
                .booking(booking)
                .paymentMethod(paymentMethod)
                .paymentType(request.getPaymentType() != null ? request.getPaymentType() : PaymentType.DEPOSIT.name())
                .amount(amount)
                .status(request.getStatus() != null ? request.getStatus() : PaymentStatus.PENDING.name())
                .build();

        PaymentTransaction saved = paymentTransactionRepository.save(tx);
        return PaymentTransactionResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void updateBookingTransactionStatus(Long bookingId, PaymentType type, PaymentStatus status) {
        if (bookingId == null || status == null) return;
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByBookingId(bookingId);
        for (PaymentTransaction tx : transactions) {
            boolean matchesType = (type == null) || (type.name().equalsIgnoreCase(tx.getPaymentType()));
            if (matchesType) {
                tx.setStatus(status.name());
                paymentTransactionRepository.save(tx);
            }
        }
    }
}
