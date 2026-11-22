package com.fpms.service.impl;

import com.fpms.dto.response.TimeSlotResponse;
import com.fpms.entity.TimeSlot;
import com.fpms.repository.TimeSlotRepository;
import com.fpms.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;

    @Override
    public List<TimeSlotResponse> getAllTimeSlots() {
        List<TimeSlot> slots = timeSlotRepository.findAll();
        return slots.stream()
                .map(TimeSlotResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public TimeSlotResponse getTimeSlotById(Long id) {
        TimeSlot slot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ với ID: " + id));
        return TimeSlotResponse.fromEntity(slot);
    }
}
