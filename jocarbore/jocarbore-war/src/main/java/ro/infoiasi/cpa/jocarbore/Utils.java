package ro.infoiasi.cpa.jocarbore;

import java.io.IOException;
import java.io.StringReader;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.json.JSONObject;
import org.w3c.dom.Document;
import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class Utils {
	public static final String JSON_CONTENT_TYPE 	= "application/json";
	public static final String GAME_LEVEL_ENTITY 	= "GameLevel";
	public static final String USER_ENTITY 			= "User";
	public static final String GAME_SESSION_ENTITY	= "GameSession";
	public static final String EMAIL_FIELD_NAME		= "email";
	public static final String USERNAME_FIELD_NAME	= "name";
	public static final String SCHOOL_FIELD_NAME 	= "scoala";
	public static final String UTF8					= "utf-8";
	
	public static User getCurrentUser()
	{
		UserService userService = UserServiceFactory.getUserService();
		return userService.getCurrentUser();
	}
	public static String jsonFromMap(Map<String, String> map)
	{
		return new JSONObject(map).toString();
	}
	public static Document readXml(String xmlStr) throws SAXException, IOException,
		ParserConfigurationException {
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		
		dbf.setValidating(false);
		dbf.setIgnoringComments(true);
		dbf.setIgnoringElementContentWhitespace(true);
		dbf.setNamespaceAware(true);
		// dbf.setCoalescing(true);
		// dbf.setExpandEntityReferences(true);
		
		DocumentBuilder db = null;
		db = dbf.newDocumentBuilder();
		db.setEntityResolver(new NullResolver());
		
		// db.setErrorHandler( new MyErrorHandler());
		InputSource is = new InputSource(new StringReader(xmlStr));
		return db.parse(is);
	}
	public static String getRandomUserName() {
		
		return null;
	}
}
class NullResolver implements EntityResolver {
  public InputSource resolveEntity(String publicId, String systemId) throws SAXException,
      IOException {
    return new InputSource(new StringReader(""));
  }
}