package ro.infoiasi.cpa.jocarbore.services;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.admin.ImportSentencesServlet;
import ro.infoiasi.cpa.jocarbore.exceptions.UserBannedException;

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
	public String getUserProfile() throws UserBannedException
	{
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			return null;
		}
		String userEmail = user.getNickname();
		
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
		return Utils.jsonFromMap(profileMap);
		
	}
	public String getSentenceByLevel(int level)
	{
		Entity sentence = getSingle(Utils.GAME_LEVEL_ENTITY, "value", level);
		if(null == sentence)
		{
			return null;
		}
		Text words = (Text) sentence.getProperty("data");
		String strSentence = words.getValue();
		log.info("found sentence: " + strSentence);
		return strSentence;
	}
	public void removeUserPoints(int points) {
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			return;
		}
		String userEmail = user.getNickname();
		
		Entity userEntity = getSingle(Utils.USER_ENTITY, "email" , userEmail);
		int currentPoints = Integer.parseInt((String)userEntity.getProperty("points"));
		currentPoints -= points;
		userEntity.setProperty("points", currentPoints);
		update(userEntity);
	}

}
