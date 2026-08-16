package com.localservice.marketplace.controller;

import com.localservice.marketplace.dto.request.ServiceRequestDTO;
import com.localservice.marketplace.dto.response.ServiceResponseDTO;
import com.localservice.marketplace.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Validated
public class ServiceController {

    private final ServiceService serviceService;

    @PostMapping("/provider")
    public ResponseEntity<ServiceResponseDTO> createService(@Valid @RequestBody ServiceRequestDTO request, org.springframework.security.core.Authentication authentication) {
        ServiceResponseDTO response = serviceService.createService(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> getAllServices() {
        List<ServiceResponseDTO> responses = serviceService.getAllServices();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{serviceId}")
    public ResponseEntity<ServiceResponseDTO> getServiceById(@PathVariable Long serviceId) {
        ServiceResponseDTO response = serviceService.getServiceById(serviceId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/provider/{serviceId}")
    public ResponseEntity<ServiceResponseDTO> updateService(@PathVariable Long serviceId,
                                                              @Valid @RequestBody ServiceRequestDTO request, org.springframework.security.core.Authentication authentication) {
        ServiceResponseDTO response = serviceService.updateService(serviceId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/provider/{serviceId}")
    public ResponseEntity<String> deleteService(@PathVariable Long serviceId, org.springframework.security.core.Authentication authentication) {
        serviceService.deleteService(serviceId, authentication.getName());
        return ResponseEntity.ok("Service deleted successfully.");
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ServiceResponseDTO>> getServicesByCategory(@PathVariable Long categoryId) {
        List<ServiceResponseDTO> responses = serviceService.getServicesByCategory(categoryId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/provider")
    public ResponseEntity<List<ServiceResponseDTO>> getMyServices(org.springframework.security.core.Authentication authentication) {
        List<ServiceResponseDTO> responses = serviceService.getMyServices(authentication.getName());
        return ResponseEntity.ok(responses);
    }
}