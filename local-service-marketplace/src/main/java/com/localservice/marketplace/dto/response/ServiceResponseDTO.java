package com.localservice.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceResponseDTO {

    private Long serviceId;

    private Long providerId;

    private String providerName;

    private Long categoryId;

    private String categoryName;

    private String title;

    private String description;

    private BigDecimal price;

    private Integer duration;

    private Boolean availability;

    private LocalTime workingStartTime;

    private LocalTime workingEndTime;

    private LocalDateTime createdAt;
}