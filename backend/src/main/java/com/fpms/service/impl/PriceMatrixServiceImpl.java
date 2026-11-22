package com.fpms.service.impl;

import com.fpms.dto.response.PriceMatrixResponse;
import com.fpms.entity.PriceMatrix;
import com.fpms.repository.PriceMatrixRepository;
import com.fpms.service.PriceMatrixService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PriceMatrixServiceImpl implements PriceMatrixService {

    private final PriceMatrixRepository priceMatrixRepository;

    @Override
    public List<PriceMatrixResponse> getAllPriceMatrices() {
        return priceMatrixRepository.findAll().stream()
                .map(PriceMatrixResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PriceMatrixResponse getPriceMatrixById(Long id) {
        PriceMatrix pm = priceMatrixRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quy định giá với ID: " + id));
        return PriceMatrixResponse.fromEntity(pm);
    }

    @Override
    public List<PriceMatrixResponse> getByPitchTypeId(Long pitchTypeId) {
        return priceMatrixRepository.findByPitchTypeId(pitchTypeId).stream()
                .map(PriceMatrixResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
