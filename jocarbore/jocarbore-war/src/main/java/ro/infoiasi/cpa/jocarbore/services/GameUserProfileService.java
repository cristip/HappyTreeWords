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

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.users.User;

public final class GameUserProfileService extends AbstractService {
	private static GameUserProfileService Me;
	private static final Logger log = Logger.getLogger(ImportSentencesServlet.class.getName());
	
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
		
		Entity userEntity = getSingle(Utils.USER_ENTITY, "email" , userEmail);
		Map<String, String> profileMap = new HashMap<String, String>();
		profileMap.put("email", userEmail);
		Date time = new Date();
		
		if(null == userEntity)
		{
			userEntity = new Entity(Utils.USER_ENTITY);
			userEntity.setProperty("email", userEmail);
			userEntity.setProperty("level", 0);
			profileMap.put("level", "0");
			userEntity.setProperty("points", 0);
			profileMap.put("points", "0");
			userEntity.setProperty("active", true);
			userEntity.setProperty("joinDate",  time);
		}
		else
		{
			if(!(Boolean)userEntity.getProperty("active"))
			{
				throw new UserBannedException("not active");
			}
			profileMap.put("level", userEntity.getProperty("level").toString());
			profileMap.put("points", userEntity.getProperty("points").toString());
		}
		userEntity.setProperty("lastplaydate", time);
		update(userEntity);
		//startGameSession(user);
		return profileMap;
		
	}
	
	public void startGameSession(User user)
	{
		Entity gameSession = new Entity(Utils.GAME_SESSION_ENTITY);
		gameSession.setProperty("email", user.getEmail());
		gameSession.setProperty("date", new Date());
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
		
		Entity userEntity = getSingle(Utils.USER_ENTITY, "email" , userEmail);
		int currentPoints = ((Long)userEntity.getProperty("points")).intValue();
		currentPoints -= points;
		userEntity.setProperty("points", currentPoints);
		update(userEntity);
	}
	public int getUserPoints(User user) {
		Entity userEntity = getSingle(Utils.USER_ENTITY, "email" , user.getEmail());
		Long points = (Long) userEntity.getProperty("points");
		if(null == points)
		{
			return 0;
		}
		return points.intValue();
	}
		
	public int validateUserSentence(JSONObject json, int level, User user) throws JSONException {
		JSONArray connections = json.getJSONArray("connections");
		Sentence sentence = getSentenceByLevel(level);
		int points = 0;
		for(int i = 0; i < connections.length(); i++)
		{
			JSONObject connection = connections.getJSONObject(i);
			if(isConnectionInWords(connection, sentence.getWords()))
			{
				points += 30;
			}else
			{
				points -= 30;
			}
		}
		Entity userEntity = getSingle(Utils.USER_ENTITY, "email" , user.getEmail());
		int currentPoints = ((Long) userEntity.getProperty("points")).intValue();
		currentPoints += points;
		userEntity.setProperty("points", currentPoints);
		if(points > 0)
		{
			userEntity.setProperty("level", level+1);
		}
		update(userEntity);
		return points;
	}
	/*
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
			if( word.get("head").equals(connection.getString("source")) && word.get("id").equals(connection.getString("destination")))
			{
				return true;
			}
		}
		return false;
	}

}
