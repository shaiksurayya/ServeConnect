// package com.localservice.marketplace.service.impl;

// import com.localservice.marketplace.dto.request.LoginRequestDTO;
// import com.localservice.marketplace.dto.request.RegisterRequestDTO;
// import com.localservice.marketplace.dto.response.AuthResponseDTO;
// import com.localservice.marketplace.entity.User;
// import com.localservice.marketplace.enums.Role;
// import com.localservice.marketplace.repository.UserRepository;
// import com.localservice.marketplace.security.JwtService;
// import com.localservice.marketplace.service.AuthService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;
// import com.localservice.marketplace.entity.ProviderProfile;
// import com.localservice.marketplace.repository.ProviderProfileRepository;

// @Service
// @RequiredArgsConstructor
// public class AuthServiceImpl implements AuthService {

//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;
//     private final JwtService jwtService;
//     private final ProviderProfileRepository providerProfileRepository;

//     @Override
//     public AuthResponseDTO register(RegisterRequestDTO request) {

//         if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//             throw new RuntimeException("Email already exists.");
//         }

//         if (request.getRole() == Role.ADMIN) {
//             throw new RuntimeException("Admin registration is not allowed.");
//         }

//         User user = User.builder()
//                 .name(request.getName())
//                 .email(request.getEmail())
//                 .password(passwordEncoder.encode(request.getPassword()))
//                 .phone(request.getPhone())
//                 .address(request.getAddress())
//                 .role(request.getRole())
//                 .build();
//                 System.out.println("PHONE = " + request.getPhone());
// System.out.println("LENGTH = " + request.getPhone().length());

//         User savedUser = userRepository.save(user);

//         UserDetails userDetails = buildUserDetails(savedUser);
//         String token = jwtService.generateToken(userDetails);

//         return AuthResponseDTO.builder()
//                 .token(token)
//                 .userId(savedUser.getUserId())
//                 .name(savedUser.getName())
//                 .email(savedUser.getEmail())
//                 .role(savedUser.getRole())
//                 .build();
//     }

//   @Override
// public AuthResponseDTO login(LoginRequestDTO request) {

//     User user = userRepository.findByEmail(request.getEmail())
//             .orElseThrow(() -> new RuntimeException("Email not found."));

//     if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//         throw new RuntimeException("Invalid password.");
//     }

//     UserDetails userDetails = buildUserDetails(user);
//     String token = jwtService.generateToken(userDetails);

//     Long providerId = null;

//     if (user.getRole() == Role.PROVIDER) {

//         ProviderProfile provider = providerProfileRepository
//                 .findByUser_UserId(user.getUserId())
//                 .orElseThrow(() -> new RuntimeException(
//                         "Provider profile not found for user id: " + user.getUserId()
//                 ));

//         providerId = provider.getProviderId();
//     }

//     return AuthResponseDTO.builder()
//             .token(token)
//             .userId(user.getUserId())
//             .providerId(providerId)
//             .name(user.getName())
//             .email(user.getEmail())
//             .role(user.getRole())
//             .build();
// }


//     private UserDetails buildUserDetails(User user) {
//         return org.springframework.security.core.userdetails.User.builder()
//                 .username(user.getEmail())
//                 .password(user.getPassword())
//                 .authorities(user.getRole().name())
//                 .build();
//     }
// }



package com.localservice.marketplace.service.impl;

import com.localservice.marketplace.dto.request.LoginRequestDTO;
import com.localservice.marketplace.dto.request.RegisterRequestDTO;
import com.localservice.marketplace.dto.response.AuthResponseDTO;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.enums.Role;
import com.localservice.marketplace.repository.UserRepository;
import com.localservice.marketplace.security.JwtService;
import com.localservice.marketplace.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists.");
        }

        if (request.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin registration is not allowed.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(request.getRole())
                .build();
                System.out.println("PHONE = " + request.getPhone());
System.out.println("LENGTH = " + request.getPhone().length());

        User savedUser = userRepository.save(user);

        UserDetails userDetails = buildUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .token(token)
                .userId(savedUser.getUserId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password.");
        }

        UserDetails userDetails = buildUserDetails(user);
        String token = jwtService.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();
    }
}