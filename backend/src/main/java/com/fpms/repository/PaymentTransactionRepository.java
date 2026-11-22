package com.fpms.repository;

import com.fpms.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.booking.id = :bookingId")
    List<PaymentTransaction> findByBookingId(@Param("bookingId") Long bookingId);
}
