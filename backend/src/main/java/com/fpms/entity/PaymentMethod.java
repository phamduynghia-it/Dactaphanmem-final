package com.fpms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_method")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // VNPAY, MOMO, ZALOPAY, CASH, BANK_TRANSFER

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "is_maintenance", nullable = false)
    @Builder.Default
    private boolean isMaintenance = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;
}
