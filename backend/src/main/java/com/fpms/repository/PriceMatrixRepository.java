package com.fpms.repository;

import com.fpms.entity.PriceMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceMatrixRepository extends JpaRepository<PriceMatrix, Long> {
    @Query("SELECT pm FROM PriceMatrix pm WHERE pm.pitchType.id = :pitchTypeId")
    List<PriceMatrix> findByPitchTypeId(@Param("pitchTypeId") Long pitchTypeId);

    @Query("SELECT pm FROM PriceMatrix pm WHERE pm.pitchType.id = :pitchTypeId AND UPPER(pm.dayType) = UPPER(:dayType) AND pm.isPeakHour = :isPeakHour")
    Optional<PriceMatrix> findByPitchTypeAndDayTypeAndPeak(
            @Param("pitchTypeId") Long pitchTypeId, 
            @Param("dayType") String dayType, 
            @Param("isPeakHour") boolean isPeakHour);
}
