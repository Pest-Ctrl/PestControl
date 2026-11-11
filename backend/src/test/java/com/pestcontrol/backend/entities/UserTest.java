package com.pestcontrol.backend.entities;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
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

    @Test
    @DisplayName("fromString throws InvalidRoleException for invalid role name")
    void testFromStringInvalidRole()
	{
        InvalidRoleException exception = assertThrows(InvalidRoleException.class, () -> User.fromString("SuperAdmin"));
		assertEquals("Invalid Role Mentioned!", exception.getMessage());
    }
}