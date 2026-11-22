package com.fpms.dto.response;

import com.fpms.entity.PaymentTransaction;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionResponse {
    private Long id;
    private String transactionCode;
    private String paymentMethodCode;
    private Long bookingId;
    private String bookingCode;
    private String paymentType;
    private BigDecimal amount;
    private String status;

    public static PaymentTransactionResponse fromEntity(PaymentTransaction tx) {
        if (tx == null) return null;
        return PaymentTransactionResponse.builder()
                .id(tx.getId())
                .transactionCode(tx.getTransactionCode())
                .bookingId(tx.getBooking() != null ? tx.getBooking().getId() : null)
                .bookingCode(tx.getBooking() != null ? tx.getBooking().getBookingCode() : null)
                .amount(tx.getAmount())
                .paymentType(tx.getPaymentType())
                .status(tx.getStatus())
                .build();
    }
}
