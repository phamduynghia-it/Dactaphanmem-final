package com.fpms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pitch_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PitchType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "player_capacity", nullable = false)
    private Integer playerCapacity;

    @Column(name = "description", length = 255)
    private String description;
}
