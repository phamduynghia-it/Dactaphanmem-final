package com.fpms.service.impl;

import com.fpms.dto.request.ServiceOrderRequest;
import com.fpms.dto.response.BookingServiceItemResponse;
import com.fpms.entity.Booking;
import com.fpms.entity.BookingServiceItem;
import com.fpms.entity.ServiceItem;
import com.fpms.enums.BookingStatus;
import com.fpms.repository.BookingRepository;
import com.fpms.repository.BookingServiceItemRepository;
import com.fpms.repository.ServiceItemRepository;
import com.fpms.service.BookingServiceItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingServiceItemServiceImpl implements BookingServiceItemService {

    private final BookingServiceItemRepository bookingServiceItemRepository;
    private final BookingRepository bookingRepository;
    private final ServiceItemRepository serviceItemRepository;

    private Booking getEditableBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn đặt sân không tồn tại: " + bookingId));

        BookingStatus status = BookingStatus.from(booking.getStatus());
        if (status != BookingStatus.CONFIRMED && status != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Chỉ được phép chỉnh sửa dịch vụ khi đơn đang ở trạng thái CONFIRMED hoặc CHECKED_IN!");
        }
        return booking;
    }

    @Override
    @Transactional
    public BigDecimal updateBookingServices(Long bookingId, List<ServiceOrderRequest> services) {
        Booking booking = getEditableBooking(bookingId);

        // Gom số lượng theo serviceId (tránh trùng lặp serviceId trong request)
        Map<Long, Integer> requestedQuantities = new HashMap<>();
        if (services != null) {
            for (ServiceOrderRequest req : services) {
                if (req.getServiceId() == null || req.getQuantity() == null || req.getQuantity() <= 0) {
                    continue;
                }
                requestedQuantities.merge(req.getServiceId(), req.getQuantity(), Integer::sum);
            }
        }

        // Lấy danh sách dịch vụ hiện có trong bảng booking_services
        List<BookingServiceItem> existingItems = bookingServiceItemRepository.findByBookingId(bookingId);
        Map<Long, BookingServiceItem> existingMap = new HashMap<>();
        for (BookingServiceItem item : existingItems) {
            if (item.getService() != null) {
                existingMap.put(item.getService().getId(), item);
            }
        }

        // 1. Xóa các dịch vụ không còn trong danh sách mới
        for (BookingServiceItem existing : existingItems) {
            Long sId = existing.getService() != null ? existing.getService().getId() : null;
            if (sId == null || !requestedQuantities.containsKey(sId)) {
                booking.getServices().remove(existing);
                bookingServiceItemRepository.delete(existing);
            }
        }

        // 2. Cập nhật số lượng hoặc thêm mới các dịch vụ được yêu cầu
        BigDecimal totalServiceAmount = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : requestedQuantities.entrySet()) {
            Long serviceId = entry.getKey();
            Integer newQty = entry.getValue();

            BookingServiceItem existing = existingMap.get(serviceId);
            if (existing != null) {
                existing.updateQuantity(newQty);
                bookingServiceItemRepository.save(existing);
                totalServiceAmount = totalServiceAmount.add(existing.getTotalPrice());
            } else {
                ServiceItem sItem = serviceItemRepository.findById(serviceId)
                        .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại: " + serviceId));
                BigDecimal itemTotal = sItem.getPrice().multiply(BigDecimal.valueOf(newQty));

                BookingServiceItem newItem = BookingServiceItem.builder()
                        .booking(booking)
                        .service(sItem)
                        .quantity(newQty)
                        .unitPrice(sItem.getPrice())
                        .totalPrice(itemTotal)
                        .build();
                bookingServiceItemRepository.save(newItem);
                booking.getServices().add(newItem);
                totalServiceAmount = totalServiceAmount.add(itemTotal);
            }
        }

        // 3. Cập nhật lại tổng tiền dịch vụ và tổng tiền đơn
        booking.setTotalServiceAmount(totalServiceAmount);
        booking.calculateTotalAmount();
        bookingRepository.save(booking);

        return totalServiceAmount;
    }

    @Override
    @Transactional
    public BookingServiceItemResponse updateSingleBookingService(Long bookingId, Long serviceId, Integer quantity) {
        Booking booking = getEditableBooking(bookingId);
        if (serviceId == null) {
            throw new RuntimeException("Mã dịch vụ (serviceId) không được để trống");
        }

        BookingServiceItem existing = bookingServiceItemRepository
                .findByBookingIdAndServiceId(bookingId, serviceId)
                .orElse(null);

        BookingServiceItemResponse response = null;

        if (quantity == null || quantity <= 0) {
            if (existing != null) {
                booking.getServices().remove(existing);
                bookingServiceItemRepository.delete(existing);
            }
        } else if (existing != null) {
            existing.updateQuantity(quantity);
            BookingServiceItem savedItem = bookingServiceItemRepository.save(existing);
            response = BookingServiceItemResponse.fromEntity(savedItem);
        } else {
            ServiceItem sItem = serviceItemRepository.findById(serviceId)
                    .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại: " + serviceId));
            BigDecimal itemTotal = sItem.getPrice().multiply(BigDecimal.valueOf(quantity));

            BookingServiceItem newItem = BookingServiceItem.builder()
                    .booking(booking)
                    .service(sItem)
                    .quantity(quantity)
                    .unitPrice(sItem.getPrice())
                    .totalPrice(itemTotal)
                    .build();
            BookingServiceItem savedItem = bookingServiceItemRepository.save(newItem);
            booking.getServices().add(savedItem);
            response = BookingServiceItemResponse.fromEntity(savedItem);
        }

        // Tính lại tổng tiền dịch vụ của toàn bộ đơn
        List<BookingServiceItem> currentItems = bookingServiceItemRepository.findByBookingId(bookingId);
        BigDecimal totalServiceAmount = currentItems.stream()
                .map(BookingServiceItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        booking.setTotalServiceAmount(totalServiceAmount);
        booking.calculateTotalAmount();
        bookingRepository.save(booking);

        return response;
    }
}
