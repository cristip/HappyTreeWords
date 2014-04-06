package ro.infoiasi.cpa.jocarbore.services;

import java.util.List;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery.TooManyResultsException;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;

public abstract class AbstractService {
	protected void update(Entity entity)
	{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(entity);
	}
	protected Entity getSingle(String key, String propertyName, String value) throws TooManyResultsException
	{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Filter filter = new Query.FilterPredicate(propertyName, FilterOperator.EQUAL, value);
		Query query = new Query(key).setFilter(filter);
		Entity entity = datastore.prepare(query).asSingleEntity();
		return entity;
	}
	protected Entity getLast(String key, String propertyName)
	{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query query = new Query(key).addSort(propertyName, SortDirection.DESCENDING);
		List<Entity> entities = datastore.prepare(query).asList(FetchOptions.Builder.withLimit(1));
		if(entities.isEmpty())
		{
			return null;
		}
		return entities.get(0);
	}
	protected List<Entity> getAll(String key, int limit)
	{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query query = new Query(key);
		List<Entity> entities = datastore.prepare(query).asList(FetchOptions.Builder.withLimit(limit));
		return entities;
	}
}
