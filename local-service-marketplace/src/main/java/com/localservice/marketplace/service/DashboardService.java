package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.response.CustomerDashboardResponse;
import com.localservice.marketplace.dto.response.ProviderDashboardResponse;

public interface DashboardService {
    CustomerDashboardResponse getCustomerDashboard(String customerEmail);
    ProviderDashboardResponse getProviderDashboard(String providerEmail);
}