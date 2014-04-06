package ro.infoiasi.cpa.jocarbore.services;

import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import ro.infoiasi.cpa.jocarbore.model.Sentence;

import com.google.appengine.api.datastore.Entity;

public class AdminService extends AbstractService {
	private static AdminService Me;
	private static final String SENTENCE_TAG_NAME = "sentence";
	private static final String GAME_LEVEL_ENTITY = "GameLevel";
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
		Entity lastEntity = getLast(GAME_LEVEL_ENTITY, "value");
		int lastLevel = 0;
		if(null != lastEntity)
		{
			lastLevel = (Integer) lastEntity.getProperty("value");
		}
		NodeList sentenceNodes = doc.getElementsByTagName(SENTENCE_TAG_NAME);
		int numEntries = sentenceNodes.getLength();
		for(int i = 0; i < numEntries; i++)
		{
			Entity level = new Entity("GameLevel");
			level.setProperty("value", lastLevel+i);
			Node sentenceNode = sentenceNodes.item(i);
			Sentence sentence = Sentence.fromNode(sentenceNode);
			level.setProperty("data", sentence.toString());
			update(level);
		}
		return numEntries;
	}
}
