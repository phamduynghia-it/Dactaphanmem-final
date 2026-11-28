package com.fpms.repository;

import com.fpms.entity.BookingServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingServiceItemRepository extends JpaRepository<BookingServiceItem, Long> {
    List<BookingServiceItem> findByBookingId(Long bookingId);
    Optional<BookingServiceItem> findByBookingIdAndServiceId(Long bookingId, Long serviceId);
    void deleteByBookingId(Long bookingId);
}
