package com.fpms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitch_slot_id", nullable = false, unique = true)
    private PitchSlot pitchSlot;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "guest_name", length = 100)
    private String guestName;

    @Column(name = "guest_phone", length = 20)
    private String guestPhone;

    @Column(name = "total_pitch_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalPitchAmount = BigDecimal.ZERO;

    @Column(name = "total_service_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalServiceAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "deposit_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Column(name = "booking_type", nullable = false, length = 50)
    @Builder.Default
    private String bookingType = "ONLINE"; // ONLINE, DIRECT, TOURNAMENT

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING_PAYMENT"; // PENDING_PAYMENT, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "customer_note")
    private String customerNote;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingServiceItem> services = new ArrayList<>();

    // === DOMAIN LOGIC METHODS ===
    public BigDecimal calculateTotalAmount() {
        BigDecimal pitch = (totalPitchAmount != null) ? totalPitchAmount : BigDecimal.ZERO;
        BigDecimal service = (totalServiceAmount != null) ? totalServiceAmount : BigDecimal.ZERO;
        this.totalAmount = pitch.add(service);
        return this.totalAmount;
    }

    public BigDecimal calculateRemainingAmount() {
        BigDecimal deposit = (depositAmount != null) ? depositAmount : BigDecimal.ZERO;
        return calculateTotalAmount().subtract(deposit);
    }

    public void updateStatus(String newStatus) {
        this.status = newStatus;
    }
}
