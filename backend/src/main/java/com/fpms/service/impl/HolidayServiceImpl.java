package com.fpms.service.impl;

import com.fpms.dto.response.HolidayResponse;
import com.fpms.repository.HolidayRepository;
import com.fpms.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HolidayServiceImpl implements HolidayService {

    private final HolidayRepository holidayRepository;

    @Override
    public List<HolidayResponse> getAllHolidays() {
        return holidayRepository.findAll(Sort.by(Sort.Direction.ASC, "holidayDate")).stream()
                .map(HolidayResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
