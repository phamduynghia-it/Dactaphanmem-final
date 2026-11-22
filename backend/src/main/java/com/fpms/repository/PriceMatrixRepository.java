package com.fpms.repository;

import com.fpms.entity.PriceMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceMatrixRepository extends JpaRepository<PriceMatrix, Long> {
    @Query("SELECT pm FROM PriceMatrix pm WHERE pm.pitchType.id = :pitchTypeId")
    List<PriceMatrix> findByPitchTypeId(@Param("pitchTypeId") Long pitchTypeId);
}
