// package com.localservice.marketplace.dto.response;

// import com.localservice.marketplace.enums.Role;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class AuthResponseDTO {

//     private String token;

//     @Builder.Default
//     private String tokenType = "Bearer";

//     private Long userId;

//     private Long providerId;

//     private String name;

//     private String email;

//     private Role role;
// }




package com.localservice.marketplace.dto.response;

import com.localservice.marketplace.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long userId;

    private String name;

    private String email;

    private Role role;
}