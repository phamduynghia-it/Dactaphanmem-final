package com.fpms.service;

import com.fpms.dto.request.ServiceItemRequest;
import com.fpms.dto.response.ServiceItemResponse;

import java.util.List;

public interface ServiceItemService {
    List<ServiceItemResponse> getAllServices(boolean activeOnly);
    ServiceItemResponse getServiceById(Long id);
    ServiceItemResponse createService(ServiceItemRequest request);
    ServiceItemResponse updateService(Long id, ServiceItemRequest request);
    void deleteService(Long id);
}
