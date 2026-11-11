package com.pestcontrol.backend.entities;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.pestcontrol.backend.exceptions.InvalidBugTypeException;
import com.pestcontrol.backend.exceptions.InvalidIssueStatusException;
import com.pestcontrol.backend.exceptions.InvalidSeverityStatusException;

class IssueTest
{
    @ParameterizedTest
    @CsvSource({
        "open, Open",
        "inProgress, InProgress",
        "UNDERREVIEW, UnderReview",
        "ReSolved, Resolved",
        "cLosEd, Closed",
        "rEOPened, Reopened"
    })
    @DisplayName("fromStringIssueStatus parses status case-insensitively")
    void testFromStringIssueStatus(String input, Issue.IssueStatus expected)
	{
        assertEquals(expected, Issue.fromStringIssueStatus(input));
    }

    @Test
    @DisplayName("fromStringIssueStatus throws exception on invalid status")
    void testFromStringIssueStatusInvalid()
	{
        InvalidIssueStatusException exception = assertThrows(InvalidIssueStatusException.class, () -> Issue.fromStringIssueStatus("Archived"));
		assertEquals("Invalid Issue Status Mentioned!", exception.getMessage());
	}

    @Test
    @DisplayName("fromStringSeverityStatus parses correctly and rejects invalid values")
    void testFromStringSeverityStatus()
	{
        assertEquals(Issue.SeverityStatus.Critical, Issue.fromStringSeverityStatus("critical"));
        InvalidSeverityStatusException exception = assertThrows(InvalidSeverityStatusException.class, () -> Issue.fromStringSeverityStatus("Urgent"));
		assertEquals("Invalid Severity Status Mentioned!", exception.getMessage());
    }

    @Test
    @DisplayName("fromStringBugTypes handles regular types and typo fallback 'Compatiblity'")
    void testFromStringBugTypes()
	{
        assertEquals(Issue.BugTypes.UI, Issue.fromStringBugTypes("UI"));
        assertEquals(Issue.BugTypes.Compatibility, Issue.fromStringBugTypes("Compatibility"));
        assertEquals(Issue.BugTypes.Compatibility, Issue.fromStringBugTypes("Compatiblity"));
        InvalidBugTypeException exception = assertThrows(InvalidBugTypeException.class, () -> Issue.fromStringBugTypes("UnknownType"));
		assertEquals("Invalid Bug Type Mentioned!", exception.getMessage());
	}
}