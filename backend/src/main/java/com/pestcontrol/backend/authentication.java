package com.pestcontrol.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Map;
import java.util.List;

@RestController
public class authentication {

    private final JdbcTemplate jdbcTemplate;

    // Spring Boot will automatically inject the database connection here
    public authentication(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/api/login")
    public ResponseEntity<String> authenticateUser(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        if (username == null) {
            return ResponseEntity.badRequest().body("Username is required.");
        }
        if (password == null) {
            return ResponseEntity.badRequest().body("Password is required.");
        }

        try {
            String sql = "SELECT password FROM users WHERE username = ?";
            List<String> passwords = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("password"), username);

            if (!passwords.isEmpty()) {
                String hashedPassword = passwords.get(0);
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                if (encoder.matches(password, hashedPassword)) {
                    return ResponseEntity.ok("Login successful!");
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during login.");
        }
    }

    @PostMapping("/api/register")
    public ResponseEntity<String> registerUser(@RequestBody Map<String, String> registerData) {
        String username = registerData.get("username");
        String password = registerData.get("password");

        if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }

        try {
            // Check if user already exists
            String checkSql = "SELECT count(*) FROM users WHERE username = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, username);

            if (count != null && count > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists.");
            }

            // Hash the password
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String hashedPassword = encoder.encode(password);

            // Insert new user
            String insertSql = "INSERT INTO users (username, password) VALUES (?, ?)";
            jdbcTemplate.update(insertSql, username, hashedPassword);

            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during registration: " + e.getMessage());
        }
    }
}
