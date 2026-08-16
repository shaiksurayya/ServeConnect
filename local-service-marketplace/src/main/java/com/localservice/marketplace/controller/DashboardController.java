package com.localservice.marketplace.controller;

import com.localservice.marketplace.dto.response.CustomerDashboardResponse;
import com.localservice.marketplace.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/customer")
    public CustomerDashboardResponse getCustomerDashboard(org.springframework.security.core.Authentication authentication) {
        return dashboardService.getCustomerDashboard(authentication.getName());
    }

    @GetMapping("/provider")
    public com.localservice.marketplace.dto.response.ProviderDashboardResponse getProviderDashboard(org.springframework.security.core.Authentication authentication) {
        return dashboardService.getProviderDashboard(authentication.getName());
    }
}