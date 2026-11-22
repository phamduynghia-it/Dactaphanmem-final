package com.fpms.repository;

import com.fpms.entity.PitchSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PitchSlotRepository extends JpaRepository<PitchSlot, Long> {

    List<PitchSlot> findBySlotDate(LocalDate slotDate);

    @Query("SELECT s FROM PitchSlot s WHERE s.slotDate = :date AND s.status = 'AVAILABLE'")
    List<PitchSlot> findAvailableSlotsByDate(@Param("date") LocalDate date);

    List<PitchSlot> findByPitchIdAndSlotDate(Long pitchId, LocalDate slotDate);
}
