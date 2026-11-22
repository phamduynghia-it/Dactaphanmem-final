package com.fpms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "price_matrices", uniqueConstraints = {
    @UniqueConstraint(name = "uk_price_matrices", columnNames = {"is_peak_hour", "pitch_type_id", "day_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceMatrix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_peak_hour", nullable = false)
    @Builder.Default
    private boolean isPeakHour = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitch_type_id", nullable = false)
    private PitchType pitchType;

    @Column(name = "day_type", nullable = false, length = 20)
    private String dayType; // WEEKDAY, WEEKEND, HOLIDAY

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
}
