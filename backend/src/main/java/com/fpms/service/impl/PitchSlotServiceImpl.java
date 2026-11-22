package com.fpms.service.impl;

import com.fpms.dto.response.PitchSlotResponse;
import com.fpms.entity.PitchSlot;
import com.fpms.repository.PitchSlotRepository;
import com.fpms.service.PitchSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PitchSlotServiceImpl implements PitchSlotService {

    private final PitchSlotRepository pitchSlotRepository;

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
}
