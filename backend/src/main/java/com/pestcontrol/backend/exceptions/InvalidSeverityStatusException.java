package com.pestcontrol.backend.exceptions;

public class InvalidSeverityStatusException extends RuntimeException
{
	public InvalidSeverityStatusException(String message)
	{
		super(message);
	}
}
