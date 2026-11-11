package com.pestcontrol.backend;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.util.ReflectionTestUtils;

class SecurityConfigTest {

    private static final String TEST_SECRET = "3EpCkprHdtrGZb4kmklMEi02sybb+oMJZnTedZ24TRs=";

    private SecurityConfig securityConfig;
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        securityConfig = new SecurityConfig();
        ReflectionTestUtils.setField(securityConfig, "nextAuthSecret", TEST_SECRET);
        jwtDecoder = securityConfig.jwtDecoder();
    }

    @Test
    @DisplayName("SecurityConfig declares Spring security configuration and @Bean methods")
    void testSecurityAnnotationsAndBeans() throws NoSuchMethodException {
        assertNotNull(SecurityConfig.class.getAnnotation(Configuration.class));
        assertNotNull(SecurityConfig.class.getAnnotation(EnableWebSecurity.class));
        assertNotNull(SecurityConfig.class.getMethod("jwtDecoder").getAnnotation(Bean.class));
    }

    @Test
    @DisplayName("jwtDecoder validates and decodes HS256 JWT signed with configured nextauth.secret")
    void testJwtDecoderValidToken() throws Exception {
        long now = Instant.now().getEpochSecond();
        String payloadJson = String.format(
                "{\"sub\":\"user-123\",\"email\":\"admin@gmail.com\",\"role\":\"Admin\",\"iat\":%d,\"exp\":%d}",
                now, now + 3600);
        String token = signHs256Jwt(payloadJson, TEST_SECRET);

        Jwt jwt = jwtDecoder.decode(token);

        assertNotNull(jwt);
        assertEquals("user-123", jwt.getSubject());
        assertEquals("admin@gmail.com", jwt.getClaimAsString("email"));
        assertEquals("Admin", jwt.getClaimAsString("role"));
    }

    @Test
    @DisplayName("jwtDecoder rejects token signed with wrong secret")
    void testJwtDecoderRejectsWrongSecret() throws Exception {
        long now = Instant.now().getEpochSecond();
        String payloadJson = String.format("{\"sub\":\"user-123\",\"iat\":%d,\"exp\":%d}", now, now + 3600);
        String token = signHs256Jwt(payloadJson, "different-secret-that-must-fail-verification-1234");

        assertThrows(JwtException.class, () -> jwtDecoder.decode(token));
    }

    @Test
    @DisplayName("jwtDecoder rejects expired JWT")
    void testJwtDecoderRejectsExpiredToken() throws Exception {
        long past = Instant.now().getEpochSecond() - 3600;
        String payloadJson = String.format("{\"sub\":\"user-123\",\"iat\":%d,\"exp\":%d}", past - 60, past);
        String token = signHs256Jwt(payloadJson, TEST_SECRET);

        assertThrows(JwtException.class, () -> jwtDecoder.decode(token));
    }

    @Test
    @DisplayName("jwtDecoder rejects malformed token")
    void testJwtDecoderRejectsMalformedToken() {
        assertThrows(JwtException.class, () -> jwtDecoder.decode("not.a.valid-jwt"));
    }

    private static String signHs256Jwt(String payloadJson, String secret) throws Exception {
        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        String header = encoder.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = encoder.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signingInput = header + "." + payload;

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = encoder.encodeToString(mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8)));

        return signingInput + "." + signature;
    }
}

