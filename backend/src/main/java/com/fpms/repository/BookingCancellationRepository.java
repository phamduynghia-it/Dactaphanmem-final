package com.fpms.repository;

import com.fpms.entity.BookingCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingCancellationRepository extends JpaRepository<BookingCancellation, Long> {
    @Query("SELECT bc FROM BookingCancellation bc WHERE bc.booking.id = :bookingId")
    Optional<BookingCancellation> findByBookingId(@Param("bookingId") Long bookingId);
}
