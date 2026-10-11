package com.mediqueue.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // 256-bit fixed secret for secure HMAC-SHA256 demo signing
    private static final String SECRET_STRING = "MediQueueSecretKeyForDikshaHospitalPatientSecurityToken2026SecureKey!";
    private final Key key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    // 24 hours validity
    private static final long JWT_TOKEN_VALIDITY = 24 * 60 * 60 * 1000L;

    public String generateToken(Long userId, String username, String role, String fullName, String uhid, String phone) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("fullName", fullName);
        if (uhid != null) claims.put("uhid", uhid);
        if (phone != null) claims.put("phone", phone);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> (String) claims.get("role"));
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> {
            Object id = claims.get("userId");
            if (id instanceof Number) {
                return ((Number) id).longValue();
            }
            return null;
        });
    }

    public String extractFullName(String token) {
        return extractClaim(token, claims -> (String) claims.get("fullName"));
    }

    public String extractUhid(String token) {
        return extractClaim(token, claims -> (String) claims.get("uhid"));
    }

    public String extractPhone(String token) {
        return extractClaim(token, claims -> (String) claims.get("phone"));
    }

    public Boolean isTokenExpired(String token) {
        final Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
