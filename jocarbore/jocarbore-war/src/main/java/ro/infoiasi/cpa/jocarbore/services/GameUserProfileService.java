package ro.infoiasi.cpa.jocarbore.services;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.admin.ImportSentencesServlet;
import ro.infoiasi.cpa.jocarbore.exceptions.UserBannedException;
import ro.infoiasi.cpa.jocarbore.model.Sentence;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.User;

public final class GameUserProfileService extends AbstractService {
	private static GameUserProfileService Me;
	private static final Logger log = Logger.getLogger(ImportSentencesServlet.class.getName());
	private static final String ID_FIELD_NAME = "id";
	private static final String DEPREL_FIELD_NAME = "deprel";
	private static final String HEAD_FIELD_NAME = "head";
	private static final String SOURCE_FIELD_NAME = "source";
	private static final String DESTINATION_FIELD_NAME = "destination";
	private static final String LEVEL_FIELD_NAME = "level";
	private static final String POINTS_FIELD_NAME = "points";
	public static final String CONNECTIONS_JSON_FIELD_NAME = "connections";
	private static final String WORDS_JSON_FIELD_NAME = "words";
	
	private GameUserProfileService()
	{
		
	}
	public static GameUserProfileService getInstance(){
		if(null == Me)
		{
			Me = new GameUserProfileService();
		}
		return Me;
	}
	public Map<String, String> getUserProfile() throws UserBannedException
	{
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			return null;
		}
		String userEmail = user.getEmail();
		
		Entity userEntity = getSingle(Utils.USER_ENTITY, Utils.EMAIL_FIELD_NAME , userEmail);
		Map<String, String> profileMap = new HashMap<String, String>();
		profileMap.put(Utils.EMAIL_FIELD_NAME, userEmail);
		Date time = new Date();
		
		if(null == userEntity)
		{
			userEntity = new Entity(Utils.USER_ENTITY);
			userEntity.setProperty(Utils.EMAIL_FIELD_NAME, userEmail);
			userEntity.setProperty(LEVEL_FIELD_NAME, 0);
			profileMap.put(LEVEL_FIELD_NAME, "0");
			userEntity.setProperty(POINTS_FIELD_NAME, 0);
			profileMap.put(POINTS_FIELD_NAME, "0");
			userEntity.setProperty("active", true);
			userEntity.setProperty("joinDate",  time);
			userEntity.setProperty(Utils.USERNAME_FIELD_NAME, Utils.getRandomUserName());
		}
		else
		{
			if(!(Boolean)userEntity.getProperty("active"))
			{
				throw new UserBannedException("not active");
			}
			profileMap.put(LEVEL_FIELD_NAME, userEntity.getProperty(LEVEL_FIELD_NAME).toString());
			profileMap.put(POINTS_FIELD_NAME, userEntity.getProperty(POINTS_FIELD_NAME).toString());
		}
		userEntity.setProperty("lastplaydate", time);
		update(userEntity);
		return profileMap;
		
	}
	
	public void recordGameSession(User user, int level, int points, String connections, String screenData)
	{
		Entity gameSession = new Entity(Utils.GAME_SESSION_ENTITY);
		gameSession.setProperty(Utils.EMAIL_FIELD_NAME, user.getEmail());
		gameSession.setProperty("date", new Date());
		gameSession.setProperty("level", level);
		gameSession.setProperty("connectionsJSON", connections);
		gameSession.setProperty("screenData", screenData);
		gameSession.setProperty("points", points);
		update(gameSession);
	}
	
	public Sentence getSentenceByLevel(int level) throws JSONException
	{
		Entity sentence = getSingle(Utils.GAME_LEVEL_ENTITY, "value", level);
		if(null == sentence)
		{
			return null;
		}
		Text words = (Text) sentence.getProperty("data");
		String strSentence = words.getValue();
		log.info("found sentence: " + strSentence);
		return Sentence.fromJSONArray(strSentence);
	}
	public void removeUserPoints(int points) {
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			return;
		}
		String userEmail = user.getEmail();
		
		Entity userEntity = getSingle(Utils.USER_ENTITY, Utils.EMAIL_FIELD_NAME, userEmail);
		int currentPoints = ((Long)userEntity.getProperty(POINTS_FIELD_NAME)).intValue();
		currentPoints -= points;
		userEntity.setProperty(POINTS_FIELD_NAME, currentPoints);
		update(userEntity);
	}
	public int getUserPoints(User user) {
		Entity userEntity = getSingle(Utils.USER_ENTITY, Utils.EMAIL_FIELD_NAME , user.getEmail());
		Long points = (Long) userEntity.getProperty(POINTS_FIELD_NAME);
		if(null == points)
		{
			return 0;
		}
		return points.intValue();
	}
		
	public int validateUserSentence(JSONObject json, int level, User user) throws JSONException {
		JSONArray connections = json.getJSONArray(CONNECTIONS_JSON_FIELD_NAME);
		//JSONArray words = json.getJSONArray(WORDS_JSON_FIELD_NAME);
		Sentence sentence = getSentenceByLevel(level);
		int points = 0;
		List<Map<String, String>> sentenceWords = sentence.getWords();
		
//		for(int i = 0; i < words.length(); i++)
//		{
//			JSONObject word = words.getJSONObject(i);
//			if(isDeprel(word, sentenceWords))
//			{
//				points += 30;
//			}else
//			{
//				points -= 30;
//			}
//		}
		
		for(int i = 0; i < connections.length(); i++)
		{
			JSONObject connection = connections.getJSONObject(i);
			if(isConnectionInWords(connection, sentenceWords))
			{
				points += 30;
			}else
			{
				points -= 30;
			}
			if(isDeprel(connection, sentenceWords))
			{
				points += 30;
			}else
			{
				points -= 30;
			}
		}
		Entity userEntity = getSingle(Utils.USER_ENTITY, Utils.EMAIL_FIELD_NAME , user.getEmail());
		int currentPoints = ((Long) userEntity.getProperty(POINTS_FIELD_NAME)).intValue();
		currentPoints += points;
		userEntity.setProperty(POINTS_FIELD_NAME, currentPoints);
		if(points > 0)
		{
			userEntity.setProperty(LEVEL_FIELD_NAME, level+1);
		}
		update(userEntity);
		return points;
	}
	/**
	 * 
	 * @param word {id:int,deprel:string}
	 * @param sentenceWords 
	 * @return
	 * @throws JSONException 
	 */
	private boolean isDeprel(JSONObject connection,
			List<Map<String, String>> sentenceWords) throws JSONException {
		
		for(Map<String, String> word:sentenceWords){
			if(word.get(ID_FIELD_NAME).equals(connection.getString(DESTINATION_FIELD_NAME)))
			{
				if(word.containsKey(DEPREL_FIELD_NAME))
				{
					if(word.get(DEPREL_FIELD_NAME).equals(connection.getString(DEPREL_FIELD_NAME)))
					{
						return true;
					}
				}else
				{
					if(connection.getString(DEPREL_FIELD_NAME).isEmpty())
					{
						return true;
					}
				}
				return false;
			}
		}
		return false;
	}
	/**
	 * connections:
	 * [{source:n, destination:m}...
	 * sentence:
	 * [{id:i, head:j}...
	 * must check if head == source and id == destination
	 */
	private Boolean isConnectionInWords(JSONObject connection, List<Map<String, String>> words) throws JSONException
	{
		for(Map<String, String> word:words)
		{
			if( word.get(HEAD_FIELD_NAME).equals(connection.getString(SOURCE_FIELD_NAME)) && word.get(ID_FIELD_NAME).equals(connection.getString(DESTINATION_FIELD_NAME)))
			{
				return true;
			}
		}
		return false;
	}
	public List<Entity> getTopPlayers() {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query query = new Query(Utils.USER_ENTITY).addSort("points", SortDirection.DESCENDING);
		List<Entity> users = datastore.prepare(query).asList(FetchOptions.Builder.withLimit(100));
		
				
		return users;
	}

}
