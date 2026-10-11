package com.mediqueue.core;

import com.mediqueue.core.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"UNAUTHORIZED\",\"message\":\"Authentication required. Please sign in to access this hospital resource.\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"FORBIDDEN\",\"message\":\"Access denied by Role-Based Access Control (RBAC).\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // H2 database console (demo environment)
                .requestMatchers("/h2-console/**").permitAll()

                // Public Information & Discovery APIs
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/departments/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/doctors/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/facilities/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/queue/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/queue/estimate").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/payments/demo").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/kiosk/**").permitAll()

                // Staff / Doctor Queue Operating Endpoints
                .requestMatchers("/api/queue/*/call").hasAnyRole("RECEPTIONIST", "STAFF", "DOCTOR", "ADMIN")
                .requestMatchers("/api/queue/*/complete").hasAnyRole("RECEPTIONIST", "STAFF", "DOCTOR", "ADMIN")
                .requestMatchers("/api/queue/*/skip").hasAnyRole("RECEPTIONIST", "STAFF", "DOCTOR", "ADMIN")

                // Administrator Portal Endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Dedicated Patient Portal Endpoints
                .requestMatchers("/api/patient/me/**").hasRole("PATIENT")
                .requestMatchers("/api/patient/tokens/**").hasRole("PATIENT")
                .requestMatchers("/api/patient/queue/**").hasRole("PATIENT")

                // Fallback: any other patient endpoints require patient role
                .requestMatchers("/api/patient/**").hasRole("PATIENT")

                // Default
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
