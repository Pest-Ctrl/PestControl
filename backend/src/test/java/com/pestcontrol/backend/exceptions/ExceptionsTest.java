package com.pestcontrol.backend.exceptions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ExceptionsTest
{
    @Test
    @DisplayName("InvalidBugTypeException stores message and extends RuntimeException")
    void testInvalidBugTypeException()
	{
        String msg = "Invalid Bug Type Mentioned!";
        InvalidBugTypeException ex = new InvalidBugTypeException(msg);

        assertEquals(msg, ex.getMessage());
        assertTrue(RuntimeException.class.isInstance(ex));
    }

    @Test
    @DisplayName("InvalidIssueStatusException stores message and extends RuntimeException")
    void testInvalidIssueStatusException()
	{
        String msg = "Invalid Issue Status Mentioned!";
        InvalidIssueStatusException ex = new InvalidIssueStatusException(msg);

        assertEquals(msg, ex.getMessage());
        assertTrue(RuntimeException.class.isInstance(ex));
    }

    @Test
    @DisplayName("InvalidRoleException stores message and extends RuntimeException")
    void testInvalidRoleException()
	{
        String msg = "Invalid Role Mentioned!";
        InvalidRoleException ex = new InvalidRoleException(msg);

        assertEquals(msg, ex.getMessage());
        assertTrue(RuntimeException.class.isInstance(ex));
    }

    @Test
    @DisplayName("InvalidSeverityStatusException stores message and extends RuntimeException")
    void testInvalidSeverityStatusException()
	{
        String msg = "Invalid Severity Status Mentioned!";
        InvalidSeverityStatusException ex = new InvalidSeverityStatusException(msg);

        assertEquals(msg, ex.getMessage());
        assertTrue(RuntimeException.class.isInstance(ex));
    }
}