/**
 * 
 */
package ro.infoiasi.cpa.jocarbore.exceptions;

/**
 * @author Cparasca
 *
 */
public class UserBannedException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1727022536328295394L;

	/**
	 * 
	 */
	public UserBannedException() {
	}

	/**
	 * @param message
	 */
	public UserBannedException(String message) {
		super(message);
	}

	/**
	 * @param cause
	 */
	public UserBannedException(Throwable cause) {
		super(cause);
	}

	/**
	 * @param message
	 * @param cause
	 */
	public UserBannedException(String message, Throwable cause) {
		super(message, cause);
	}

	/**
	 * @param message
	 * @param cause
	 * @param enableSuppression
	 * @param writableStackTrace
	 */
	public UserBannedException(String message, Throwable cause,
			boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
	}

}
