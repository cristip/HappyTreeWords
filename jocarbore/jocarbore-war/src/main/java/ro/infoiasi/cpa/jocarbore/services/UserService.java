package ro.infoiasi.cpa.jocarbore.services;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import ro.infoiasi.cpa.jocarbore.Utils;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.users.User;

public final class UserService {
	private static UserService Me;
	private UserService()
	{
		
	}
	public static UserService getInstance(){
		if(null == Me)
		{
			Me = new UserService();
		}
		return Me;
	}
	
	public String getUserProfile()
	{
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			return null;
		}
		String userEmail = user.getNickname();
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Filter filter = new Query.FilterPredicate("email", FilterOperator.EQUAL, userEmail);
		Query usersQuery = new Query("User").setFilter(filter);
		Entity userDetails = datastore.prepare(usersQuery).asSingleEntity();
		Map<String, String> profileMap = new HashMap<String, String>();
		profileMap.put("user", userEmail);
		if(null == userDetails)
		{
			
			profileMap.put("level", "0");
			profileMap.put("points", "0");
			setUserProfile(profileMap);
		}
		else
		{
			profileMap.put("level", userDetails.getProperty("level").toString());
			profileMap.put("points", userDetails.getProperty("points").toString());
		}
		return Utils.jsonFromMap(profileMap);
		
	}
	public void setUserProfile(Map<String, String> profileMap)
	{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Entity user = new Entity("User");
		Iterator<Entry<String, String>> iterator = profileMap.entrySet().iterator();
		while(iterator.hasNext())
		{
			Entry<String, String> item = iterator.next();
			user.setProperty(item.getKey(), item.getValue());
			iterator.remove();
		}
		datastore.put(user);		
	}

}
