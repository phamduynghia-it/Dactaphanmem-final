package com.fpms.service;

import com.fpms.dto.response.TimeSlotResponse;

import java.util.List;

public interface TimeSlotService {
    List<TimeSlotResponse> getAllTimeSlots();
    TimeSlotResponse getTimeSlotById(Long id);
}
