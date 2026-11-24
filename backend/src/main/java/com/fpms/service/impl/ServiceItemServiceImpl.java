package com.fpms.service.impl;

import com.fpms.dto.request.ServiceItemRequest;
import com.fpms.dto.request.ServiceItemUpdateRequest;
import com.fpms.dto.response.ServiceItemResponse;
import com.fpms.entity.ServiceItem;
import com.fpms.repository.ServiceItemRepository;
import com.fpms.service.ServiceItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceItemServiceImpl implements ServiceItemService {

    private final ServiceItemRepository serviceItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ServiceItemResponse> getAllServices(boolean activeOnly) {
        List<ServiceItem> items = activeOnly 
                ? serviceItemRepository.findByIsActiveTrue() 
                : serviceItemRepository.findAll();
        return items.stream()
                .map(ServiceItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceItemResponse getServiceById(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));
        return ServiceItemResponse.fromEntity(item);
    }

    @Override
    public ServiceItemResponse createService(ServiceItemRequest request) {
        ServiceItem item = ServiceItem.builder()
                .name(request.getName().trim())
                .unit(request.getUnit().trim())
                .price(request.getPrice())
                .category(request.getCategory() != null ? request.getCategory() : "DRINK")
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        ServiceItem saved = serviceItemRepository.save(item);
        return ServiceItemResponse.fromEntity(saved);
    }

    @Override
    public ServiceItemResponse updateService(Long id, ServiceItemUpdateRequest request) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        item.setName(request.getName().trim());
        item.setUnit(request.getUnit().trim());
        item.setPrice(request.getPrice());
        if (request.getCategory() != null) {
            item.setCategory(request.getCategory());
        }
        item.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            item.setActive(request.getIsActive());
        }

        ServiceItem updated = serviceItemRepository.save(item);
        return ServiceItemResponse.fromEntity(updated);
    }

    @Override
    public ServiceItemResponse toggleServiceStatus(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        item.setActive(!item.isActive());
        ServiceItem updated = serviceItemRepository.save(item);
        return ServiceItemResponse.fromEntity(updated);
    }

    @Override
    public ServiceItemResponse setServiceActiveStatus(Long id, boolean active) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        item.setActive(active);
        ServiceItem updated = serviceItemRepository.save(item);
        return ServiceItemResponse.fromEntity(updated);
    }

    @Override
    public void deleteService(Long id) {
        if (!serviceItemRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy dịch vụ với ID: " + id);
        }
        serviceItemRepository.deleteById(id);
    }
}
