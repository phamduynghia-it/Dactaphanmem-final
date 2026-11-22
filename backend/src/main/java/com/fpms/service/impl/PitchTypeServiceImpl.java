package com.fpms.service.impl;

import com.fpms.dto.response.PitchTypeResponse;
import com.fpms.entity.PitchType;
import com.fpms.repository.PitchTypeRepository;
import com.fpms.service.PitchTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PitchTypeServiceImpl implements PitchTypeService {

    private final PitchTypeRepository pitchTypeRepository;

    @Override
    public List<PitchTypeResponse> getAllPitchTypes() {
        return pitchTypeRepository.findAll().stream()
                .map(PitchTypeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PitchTypeResponse getPitchTypeById(Long id) {
        PitchType pt = pitchTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại sân với ID: " + id));
        return PitchTypeResponse.fromEntity(pt);
    }
}
