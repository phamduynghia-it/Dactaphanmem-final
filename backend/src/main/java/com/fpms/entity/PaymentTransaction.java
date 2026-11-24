package com.fpms.entity;

import com.fpms.enums.PaymentStatus;
import com.fpms.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payment_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", nullable = false, unique = true, length = 100)
    private String transactionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", nullable = false)
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "payment_type", nullable = false, length = 50)
    private String paymentType; // DEPOSIT, FULL, REMAINING, REFUND

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, SUCCESS, FAILED

    // === DOMAIN HELPER METHODS ===
    public PaymentType getPaymentTypeEnum() {
        return PaymentType.from(this.paymentType);
    }

    public void setPaymentTypeEnum(PaymentType type) {
        this.paymentType = type != null ? type.name() : PaymentType.DEPOSIT.name();
    }

    public PaymentStatus getPaymentStatusEnum() {
        return PaymentStatus.from(this.status);
    }

    public void setPaymentStatusEnum(PaymentStatus paymentStatus) {
        this.status = paymentStatus != null ? paymentStatus.name() : PaymentStatus.PENDING.name();
    }
}
