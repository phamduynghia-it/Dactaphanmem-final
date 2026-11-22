package com.fpms.service;

import com.fpms.dto.response.PitchTypeResponse;
import java.util.List;

public interface PitchTypeService {
    List<PitchTypeResponse> getAllPitchTypes();
    PitchTypeResponse getPitchTypeById(Long id);
}
