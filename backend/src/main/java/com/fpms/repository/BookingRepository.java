package com.fpms.repository;

import com.fpms.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);

    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId")
    List<Booking> findByCustomerId(@Param("customerId") Long customerId);

    boolean existsByPitchSlotIdAndStatusNot(Long pitchSlotId, String status);
}
