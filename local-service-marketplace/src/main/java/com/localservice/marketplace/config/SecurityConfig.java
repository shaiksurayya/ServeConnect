package com.localservice.marketplace.config;

import com.localservice.marketplace.security.CustomUserDetailsService;
import com.localservice.marketplace.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/contact/**"
                        ).permitAll()

                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/bookings/*/messages/**", "/api/bookings/*/messages").authenticated()

                        // Public GET endpoints
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/services/**",
                                "/api/categories/**",
                                "/api/reviews/**",
                                "/api/providers/**"
                        ).permitAll()

                        // Customer endpoints
                        .requestMatchers("/api/customer/**")
                        .hasAuthority("CUSTOMER")

                        // Provider endpoints
                        .requestMatchers("/api/provider/**")
                        .hasAuthority("PROVIDER")

                        /*
                         * Provider booking operations.
                         *
                         * These are explicitly protected for providers.
                         */
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/bookings/provider/**"
                        )
                        .hasAuthority("PROVIDER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/bookings/*/reject"
                        )
                        .hasAuthority("PROVIDER")

                        // Customer booking creation
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/bookings/customer"
                        )
                        .hasAnyAuthority("CUSTOMER", "PROVIDER")

                        // Customer booking reschedule/cancel/deletion
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/bookings/customer/**"
                        )
                        .hasAuthority("CUSTOMER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/bookings/customer/**"
                        )
                        .hasAuthority("CUSTOMER")

                        // Provider service operations
                        .requestMatchers(
                                "/api/services/provider/**"
                        )
                        .hasAuthority("PROVIDER")

                        // Provider booking list
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/bookings/provider"
                        )
                        .hasAuthority("PROVIDER")

                        // Customer booking list
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/bookings/customer"
                        )
                        .hasAnyAuthority("CUSTOMER","PROVIDER")


                        // Everything else requires authentication
                        .anyRequest()
                        .authenticated()
                )

                .userDetailsService(customUserDetailsService)

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}