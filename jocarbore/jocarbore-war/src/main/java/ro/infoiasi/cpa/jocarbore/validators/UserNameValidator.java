/**
 * 
 */
package ro.infoiasi.cpa.jocarbore.validators;

import java.util.regex.Pattern;

/**
 * @author Cparasca
 *
 */
public class UserNameValidator extends AbstractValidator {
	
	private final static String USERNAME_PATTERN = "^[a-zA-Z0-9_.]{3,25}$";
	
	public UserNameValidator()
	{
		pattern = Pattern.compile(USERNAME_PATTERN);
	}
	
	

}
