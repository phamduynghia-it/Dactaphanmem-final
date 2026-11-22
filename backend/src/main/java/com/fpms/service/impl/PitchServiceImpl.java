package com.fpms.service.impl;

import com.fpms.dto.response.PitchResponse;
import com.fpms.entity.Pitch;
import com.fpms.repository.PitchRepository;
import com.fpms.service.PitchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PitchServiceImpl implements PitchService {

    private final PitchRepository pitchRepository;

    @Override
    public List<PitchResponse> getAllPitches() {
        List<Pitch> pitches = pitchRepository.findAll();
        return pitches.stream()
                .map(PitchResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PitchResponse getPitchById(Long id) {
        Pitch pitch = pitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân bóng với ID: " + id));
        return PitchResponse.fromEntity(pitch);
    }
}
