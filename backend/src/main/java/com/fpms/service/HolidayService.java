package com.fpms.service;

import com.fpms.dto.response.HolidayResponse;
import java.util.List;

public interface HolidayService {
    List<HolidayResponse> getAllHolidays();
}
