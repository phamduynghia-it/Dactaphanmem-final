package com.fpms.dto.response;

import com.fpms.entity.PaymentTransaction;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionResponse {
    private Long id;
    private String transactionCode;
    private String paymentMethodCode;
    private String bookingCode;
    private BigDecimal amount;
    private String paymentType;
    private String status;
    private LocalDateTime createdAt;

    public static PaymentTransactionResponse fromEntity(PaymentTransaction tx) {
        if (tx == null) return null;
        return PaymentTransactionResponse.builder()
                .id(tx.getId())
                .transactionCode(tx.getTransactionCode())
                .paymentMethodCode(tx.getPaymentMethod() != null ? tx.getPaymentMethod().getCode() : null)
                .bookingCode(tx.getBooking() != null ? tx.getBooking().getBookingCode() : null)
                .amount(tx.getAmount())
                .paymentType(tx.getPaymentType())
                .status(tx.getStatus())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
