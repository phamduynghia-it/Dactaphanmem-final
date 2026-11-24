package com.fpms.entity;

import com.fpms.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitch_slot_id", nullable = false)
    private PitchSlot pitchSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;

    @Column(name = "guest_phone", nullable = false, length = 20)
    private String guestPhone;

    @Column(name = "deposit_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Column(name = "booking_type", nullable = false, length = 50)
    @Builder.Default
    private String bookingType = "ONLINE"; // ONLINE, DIRECT, TOURNAMENT

    @Column(name = "total_pitch_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalPitchAmount = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING_PAYMENT"; // PENDING_PAYMENT, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "total_service_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalServiceAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingServiceItem> services = new ArrayList<>();

    // Backward compatibility helper
    @Transient
    public Long getCustomerId() {
        return this.customer != null ? this.customer.getId() : null;
    }

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

    public void updateStatus(BookingStatus newStatus) {
        if (newStatus != null) {
            this.status = newStatus.name();
        }
    }

    public BookingStatus getBookingStatus() {
        return BookingStatus.from(this.status);
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.status = bookingStatus != null ? bookingStatus.name() : BookingStatus.PENDING_PAYMENT.name();
    }
}
