package ro.infoiasi.cpa.jocarbore.validators;

import java.util.regex.Pattern;

public class SchoolValidator extends AbstractValidator {
	
	private final static String SCHOOL_PATTERN = "^[a-zA-ZȘșȚțăĂîÎâÂ 0-9_.-]{3,50}$";
	
	public SchoolValidator()
	{
		pattern = Pattern.compile(SCHOOL_PATTERN);
	}
}
