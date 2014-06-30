package ro.infoiasi.cpa.jocarbore.validators;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AbstractValidator implements IValidator {
	
	protected Pattern pattern;
	
	/* (non-Javadoc)
	 * @see ro.infoiasi.cpa.jocarbore.validators.IValidator#validate(java.lang.String)
	 */
	public boolean validate(final String value) {
		Matcher matcher = pattern.matcher(value);
		return matcher.matches();
	}

}
