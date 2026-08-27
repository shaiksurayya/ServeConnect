// package com.localservice.marketplace.dto.response;

// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// import java.math.BigDecimal;
// import java.time.LocalDateTime;

// @Getter
// @Setter
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class ProviderProfileResponseDTO {

//     private Long providerId;
//     private Long userId;
//     private String userName;
//     private Integer experience;
//     private String description;
//     private Boolean isVerified;
//     private BigDecimal avgRating;
//     private LocalDateTime createdAt;
// }



package com.localservice.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderProfileResponseDTO {

    private Long providerId;

    private Long userId;

    private String userName;
    private String userEmail;
    private String userPhone;
    private String userAddress;
    private Boolean isActive;

    private Integer experience;

    private String description;

    private Boolean isVerified;

    private BigDecimal avgRating;

    private LocalDateTime createdAt;
}