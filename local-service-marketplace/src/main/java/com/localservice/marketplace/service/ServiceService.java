package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.request.ServiceRequestDTO;
import com.localservice.marketplace.dto.response.ServiceResponseDTO;

import java.util.List;

public interface ServiceService {

    ServiceResponseDTO createService(ServiceRequestDTO request, String providerEmail);

    List<ServiceResponseDTO> getAllServices();

    ServiceResponseDTO getServiceById(Long serviceId);

    ServiceResponseDTO updateService(Long serviceId, ServiceRequestDTO request, String providerEmail);

    void deleteService(Long serviceId, String providerEmail);

    List<ServiceResponseDTO> getServicesByCategory(Long categoryId);

    List<ServiceResponseDTO> getMyServices(String providerEmail);
}