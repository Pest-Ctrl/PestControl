package com.pestcontrol.backend.exceptions;

public class InvalidIssueStatusException extends RuntimeException
{
	public InvalidIssueStatusException(String message)
	{
		super(message);
	}
}
