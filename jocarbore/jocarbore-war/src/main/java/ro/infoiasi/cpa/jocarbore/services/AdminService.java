package ro.infoiasi.cpa.jocarbore.services;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.model.Sentence;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Text;

public class AdminService extends AbstractService {
	private static AdminService Me;
	private static final String SENTENCE_TAG_NAME = "sentence";
	
	private AdminService()
	{
		
	}
	public static AdminService getInstance(){
		if(null == Me)
		{
			Me = new AdminService();
		}
		return Me;
	}
	
	public int importDocument(Document doc)
	{
		Entity lastEntity = getLast(Utils.GAME_LEVEL_ENTITY, "value");
		Long lastLevel = 0L;
		if(null != lastEntity)
		{
			lastLevel = (Long) lastEntity.getProperty("value");
		}
		NodeList sentenceNodes = doc.getElementsByTagName(SENTENCE_TAG_NAME);
		int numEntries = sentenceNodes.getLength();
		for(int i = 0; i < numEntries; i++)
		{
			
			Node sentenceNode = sentenceNodes.item(i);
			Sentence sentence = Sentence.fromNode(sentenceNode);
			Text data = new Text(sentence.toString());
			Entity level = new Entity(Utils.GAME_LEVEL_ENTITY);
			level.setProperty("value", lastLevel+i);
			level.setProperty("data", data);
			update(level);
		}
		return numEntries;
	}
}
