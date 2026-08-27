package com.localservice.marketplace.dto.response;

import com.localservice.marketplace.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Role role;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;
}