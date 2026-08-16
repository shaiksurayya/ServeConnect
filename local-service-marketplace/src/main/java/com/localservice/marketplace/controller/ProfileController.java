package com.localservice.marketplace.controller;

import com.localservice.marketplace.entity.ProviderProfile;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.repository.ProviderProfileRepository;
import com.localservice.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;

    @GetMapping("/customer/profile")
    public ResponseEntity<Map<String, Object>> getCustomerProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Map<String, Object> map = new HashMap<>();
        map.put("name", user.getName());
        map.put("phone", user.getPhone());
        map.put("address", user.getAddress());
        map.put("email", user.getEmail());
        return ResponseEntity.ok(map);
    }

    @PutMapping("/customer/profile")
    public ResponseEntity<String> updateCustomerProfile(@RequestBody Map<String, String> request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        user.setName(request.getOrDefault("name", user.getName()));
        user.setPhone(request.getOrDefault("phone", user.getPhone()));
        user.setAddress(request.getOrDefault("address", user.getAddress()));
        userRepository.save(user);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @GetMapping("/provider/profile")
    public ResponseEntity<Map<String, Object>> getProviderProfile(Authentication auth) {
        ProviderProfile profile = providerProfileRepository.findByUser_Email(auth.getName())
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        Map<String, Object> map = new HashMap<>();
        map.put("name", profile.getUser().getName());
        map.put("email", profile.getUser().getEmail());
        map.put("phone", profile.getUser().getPhone());
        map.put("address", profile.getUser().getAddress());
        map.put("experience", profile.getExperience());
        map.put("description", profile.getDescription());
        return ResponseEntity.ok(map);
    }

    @PutMapping("/provider/profile")
    public ResponseEntity<String> updateProviderProfile(@RequestBody Map<String, String> request, Authentication auth) {
        ProviderProfile profile = providerProfileRepository.findByUser_Email(auth.getName())
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        
        User user = profile.getUser();
        user.setName(request.getOrDefault("name", user.getName()));
        user.setPhone(request.getOrDefault("phone", user.getPhone()));
        user.setAddress(request.getOrDefault("address", user.getAddress()));
        userRepository.save(user);

        profile.setExperience(request.containsKey("experience") ? Integer.parseInt(request.get("experience")) : profile.getExperience());
        profile.setDescription(request.getOrDefault("description", profile.getDescription()));
        providerProfileRepository.save(profile);

        return ResponseEntity.ok("Profile updated successfully");
    }
}
