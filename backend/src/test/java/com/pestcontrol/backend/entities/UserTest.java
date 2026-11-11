package com.pestcontrol.backend.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import com.pestcontrol.backend.exceptions.InvalidRoleException;

class UserTest
{
    @ParameterizedTest
    @ValueSource(strings = {"Developer", "developer", "DEVELOPER"})
    @DisplayName("fromString parses valid role case-insensitively")
    void testFromStringValidRole(String roleStr)
	{
        assertEquals(User.UserRole.Developer, User.fromString(roleStr));
    }

    @ParameterizedTest
    @CsvSource({
        "qaengineer, QAEngineer",
        "RepoImporter, RepoImporter",
        "ADMIN, Admin"
    })
    @DisplayName("fromString parses all UserRole enum values")
    void testFromStringAllRoles(String input, User.UserRole expected)
	{
        assertEquals(expected, User.fromString(input));
    }

    @Test
    @DisplayName("fromString throws InvalidRoleException for invalid role name")
    void testFromStringInvalidRole()
	{
        InvalidRoleException exception = assertThrows(InvalidRoleException.class, () -> User.fromString("SuperAdmin"));
		assertEquals("Invalid Role Mentioned!", exception.getMessage());
    }

    @Test
    @DisplayName("Verify User defaults and getters/setters")
    void testUserDefaultsAndAccessors()
	{
        User user = new User();
        assertEquals(User.UserRole.Developer, user.getRole());

        UUID userId = UUID.randomUUID();
        LocalDateTime createdAt = LocalDateTime.now();
        user.setUserId(userId);
        user.setUsername("Admin User");
        user.setEmail("admin@gmail.com");
        user.setPassHash("$2a$10$hash");
        user.setGhOAuth("ghu_token");
        user.setRole(User.UserRole.Admin);
        user.setCreatedAt(createdAt);

        assertEquals(userId, user.getUserId());
        assertEquals("Admin User", user.getUsername());
        assertEquals("admin@gmail.com", user.getEmail());
        assertEquals("$2a$10$hash", user.getPassHash());
        assertEquals("ghu_token", user.getGhOAuth());
        assertEquals(User.UserRole.Admin, user.getRole());
        assertEquals(createdAt, user.getCreatedAt());
    }
}