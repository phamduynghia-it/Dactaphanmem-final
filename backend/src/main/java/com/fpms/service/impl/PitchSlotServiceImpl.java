package com.fpms.service.impl;

import com.fpms.dto.response.PitchSlotResponse;
import com.fpms.entity.Pitch;
import com.fpms.entity.PitchSlot;
import com.fpms.entity.PriceMatrix;
import com.fpms.entity.TimeSlot;
import com.fpms.enums.PitchSlotStatus;
import com.fpms.repository.*;
import com.fpms.service.PitchSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PitchSlotServiceImpl implements PitchSlotService {

    private final PitchSlotRepository pitchSlotRepository;
    private final PitchRepository pitchRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PriceMatrixRepository priceMatrixRepository;
    private final HolidayRepository holidayRepository;

    @Override
    public List<PitchSlotResponse> getSlotsByDate(LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        List<PitchSlot> slots = pitchSlotRepository.findByDateslot(queryDate);
        return slots.stream()
                .map(PitchSlotResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PitchSlotResponse getSlotById(Long id) {
        PitchSlot slot = pitchSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca đá với ID: " + id));
        return PitchSlotResponse.fromEntity(slot);
    }

    @Override
    public List<PitchSlotResponse> getAvailableSlots(LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        List<PitchSlot> slots = pitchSlotRepository.findAvailableSlotsByDate(queryDate);
        return slots.stream()
                .map(PitchSlotResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int generateSlots(LocalDate startDate, LocalDate endDate) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now();
        LocalDate end = (endDate != null) ? endDate : start.plusDays(30);

        List<Pitch> pitches = pitchRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());
        List<TimeSlot> timeSlots = timeSlotRepository.findAll().stream()
                .filter(TimeSlot::isActive)
                .collect(Collectors.toList());

        int count = 0;
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            for (Pitch pitch : pitches) {
                for (TimeSlot timeSlot : timeSlots) {
                    BigDecimal price = determineSlotPrice(pitch, timeSlot, curr);

                    Optional<PitchSlot> existingOpt = pitchSlotRepository
                            .findByPitchAndTimeSlotAndDate(pitch.getId(), timeSlot.getId(), curr);

                    if (existingOpt.isPresent()) {
                        PitchSlot existing = existingOpt.get();
                        // Nếu slot còn trống (AVAILABLE) thì đồng bộ lại giá mới nhất từ price matrix
                        if (existing.isAvailable() || PitchSlotStatus.AVAILABLE.name().equalsIgnoreCase(existing.getStatus())) {
                            existing.setPrice(price);
                            pitchSlotRepository.save(existing);
                        }
                    } else {
                        PitchSlot newSlot = PitchSlot.builder()
                                .pitch(pitch)
                                .timeSlot(timeSlot)
                                .dateslot(curr)
                                .status(PitchSlotStatus.AVAILABLE.name())
                                .price(price)
                                .build();
                        pitchSlotRepository.save(newSlot);
                        count++;
                    }
                }
            }
            curr = curr.plusDays(1);
        }
        return count;
    }

    private BigDecimal determineSlotPrice(Pitch pitch, TimeSlot timeSlot, LocalDate date) {
        Long pitchTypeId = pitch.getPitchType() != null ? pitch.getPitchType().getId() : 1L;
        boolean isPeak = timeSlot.isPeakHour();

        // 1. Xác định DayType (HOLIDAY, WEEKEND, WEEKDAY)
        String dayType = "WEEKDAY";
        if (holidayRepository.findByHolidayDate(date).isPresent()) {
            dayType = "HOLIDAY";
        } else {
            DayOfWeek dow = date.getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                dayType = "WEEKEND";
            }
        }

        // 2. Tìm giá chính xác từ PriceMatrix
        Optional<PriceMatrix> exactPm = priceMatrixRepository.findByPitchTypeAndDayTypeAndPeak(pitchTypeId, dayType, isPeak);
        if (exactPm.isPresent()) {
            return exactPm.get().getPrice();
        }

        // Fallback 1: Nếu là HOLIDAY mà chưa cấu hình giá riêng, fallback sang WEEKEND
        if ("HOLIDAY".equals(dayType)) {
            Optional<PriceMatrix> weekendPm = priceMatrixRepository.findByPitchTypeAndDayTypeAndPeak(pitchTypeId, "WEEKEND", isPeak);
            if (weekendPm.isPresent()) {
                return weekendPm.get().getPrice();
            }
        }

        // Fallback 2: Fallback sang WEEKDAY
        Optional<PriceMatrix> weekdayPm = priceMatrixRepository.findByPitchTypeAndDayTypeAndPeak(pitchTypeId, "WEEKDAY", isPeak);
        if (weekdayPm.isPresent()) {
            return weekdayPm.get().getPrice();
        }

        // Fallback 3: Giá an toàn dự phòng
        BigDecimal fallbackPrice = isPeak ? new BigDecimal("350000") : new BigDecimal("250000");
        if (pitch.getName() != null && pitch.getName().contains("7")) {
            fallbackPrice = fallbackPrice.add(new BigDecimal("150000"));
        }
        return fallbackPrice;
    }
}
