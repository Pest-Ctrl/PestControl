package com.pestcontrol.backend;
import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Value("${nextauth.secret}")
	private String nextAuthSecret;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
		.csrf(csrf -> csrf.disable())
		.authorizeHttpRequests(authz -> authz
			.requestMatchers(HttpMethod.DELETE, "/api/users/**").authenticated()
			.requestMatchers("/", "/error", "/api/github/**", "/api/login", "/api/**").permitAll()
			.anyRequest().authenticated()
		)
		.oauth2ResourceServer(oauth2 -> oauth2.jwt(org.springframework.security.config.Customizer.withDefaults()));
			
		return http.build();
	}

	@Bean
	public JwtDecoder jwtDecoder() {
		SecretKey secretKey = new SecretKeySpec(nextAuthSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
		return NimbusJwtDecoder.withSecretKey(secretKey).build();
	}
}
