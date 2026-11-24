package com.fpms.entity;

import com.fpms.enums.PitchSlotStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pitch_slots", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pitch_slot_date", columnNames = {"pitch_id", "timeslot_id", "dateslot"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitch_id", nullable = false)
    private Pitch pitch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timeslot_id", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "dateslot", nullable = false)
    private LocalDate dateslot;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, HOLDING, BOOKED, MAINTENANCE, CLOSED

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "hold_expires_at")
    private LocalDateTime holdExpiresAt;

    // Backward-compatibility getter & setter for existing code
    @Transient
    public LocalDate getSlotDate() {
        return this.dateslot;
    }

    public void setSlotDate(LocalDate slotDate) {
        this.dateslot = slotDate;
    }

    // === DOMAIN METHODS ===
    public PitchSlotStatus getSlotStatus() {
        return PitchSlotStatus.from(this.status);
    }

    public void setSlotStatus(PitchSlotStatus slotStatus) {
        this.status = slotStatus != null ? slotStatus.name() : PitchSlotStatus.AVAILABLE.name();
    }

    public boolean isAvailable() {
        if (PitchSlotStatus.AVAILABLE.name().equalsIgnoreCase(this.status)) {
            return true;
        }
        // Nếu đang HOLDING nhưng đã quá hạn giữ chỗ thì tự động cho phép đặt lại
        if (PitchSlotStatus.HOLDING.name().equalsIgnoreCase(this.status) && holdExpiresAt != null && LocalDateTime.now().isAfter(holdExpiresAt)) {
            return true;
        }
        return false;
    }

    public void holdSlot(int expireMinutes) {
        this.status = PitchSlotStatus.HOLDING.name();
        this.holdExpiresAt = LocalDateTime.now().plusMinutes(expireMinutes);
    }

    public void releaseSlot() {
        this.status = PitchSlotStatus.AVAILABLE.name();
        this.holdExpiresAt = null;
    }

    public void bookSlot() {
        this.status = PitchSlotStatus.BOOKED.name();
        this.holdExpiresAt = null;
    }
}
