package com.fpms.service;

import com.fpms.dto.response.PitchSlotResponse;

import java.time.LocalDate;
import java.util.List;

public interface PitchSlotService {
    List<PitchSlotResponse> getSlotsByDate(LocalDate date);
    PitchSlotResponse getSlotById(Long id);
    List<PitchSlotResponse> getAvailableSlots(LocalDate date);
}
