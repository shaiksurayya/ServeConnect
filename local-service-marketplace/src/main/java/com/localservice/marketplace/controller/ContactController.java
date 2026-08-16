package com.localservice.marketplace.controller;

import com.localservice.marketplace.dto.request.ContactRequestDTO;
import com.localservice.marketplace.entity.ContactMessage;
import com.localservice.marketplace.repository.ContactMessageRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Validated
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;

    @PostMapping
    public ResponseEntity<String> submitContactForm(@Valid @RequestBody ContactRequestDTO request) {
        ContactMessage contactMessage = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();
        
        contactMessageRepository.save(contactMessage);
        
        return ResponseEntity.ok("Contact message sent successfully.");
    }
}
