package com.fpms.service;

import com.fpms.dto.response.PitchResponse;

import java.util.List;

public interface PitchService {
    List<PitchResponse> getAllPitches();
    PitchResponse getPitchById(Long id);
}
