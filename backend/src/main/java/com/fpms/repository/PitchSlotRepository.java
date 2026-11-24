package com.fpms.repository;

import com.fpms.entity.PitchSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PitchSlotRepository extends JpaRepository<PitchSlot, Long> {

    List<PitchSlot> findByDateslot(LocalDate dateslot);

    default List<PitchSlot> findBySlotDate(LocalDate slotDate) {
        return findByDateslot(slotDate);
    }

    @Query("SELECT s FROM PitchSlot s WHERE s.dateslot = :date AND s.status = 'AVAILABLE'")
    List<PitchSlot> findAvailableSlotsByDate(@Param("date") LocalDate date);

    List<PitchSlot> findByPitchIdAndDateslot(Long pitchId, LocalDate dateslot);

    @Query("SELECT ps FROM PitchSlot ps WHERE ps.pitch.id = :pitchId AND ps.timeSlot.id = :timeSlotId AND ps.dateslot = :dateslot")
    Optional<PitchSlot> findByPitchAndTimeSlotAndDate(
            @Param("pitchId") Long pitchId,
            @Param("timeSlotId") Long timeSlotId,
            @Param("dateslot") LocalDate dateslot);
}
