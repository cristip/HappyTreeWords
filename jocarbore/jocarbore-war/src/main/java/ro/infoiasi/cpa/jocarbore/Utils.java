package ro.infoiasi.cpa.jocarbore;

import java.util.Map;

import org.json.JSONObject;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class Utils {
	public static final String JSON_CONTENT_TYPE = "application/json";
	public static User getCurrentUser()
	{
		UserService userService = UserServiceFactory.getUserService();
		return userService.getCurrentUser();
	}
	public static String jsonFromMap(Map<String, String> map)
	{
		return new JSONObject(map).toString();
	}
}
