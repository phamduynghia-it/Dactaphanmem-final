package com.fpms.service;

import com.fpms.dto.response.PriceMatrixResponse;
import java.util.List;

public interface PriceMatrixService {
    List<PriceMatrixResponse> getAllPriceMatrices();
    PriceMatrixResponse getPriceMatrixById(Long id);
    List<PriceMatrixResponse> getByPitchTypeId(Long pitchTypeId);
}
