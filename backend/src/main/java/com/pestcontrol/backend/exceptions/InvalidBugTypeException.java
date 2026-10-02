package com.pestcontrol.backend.exceptions;

public class InvalidBugTypeException extends RuntimeException
{
	public InvalidBugTypeException(String message)
	{
		super(message);
	}
}
