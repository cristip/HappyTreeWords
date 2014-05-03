package ro.infoiasi.cpa.jocarbore.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class Sentence implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = -4712860992370443094L;
	private int level;
	private List<Map<String, String>> words;
	private static final String SEPARATOR_IN = "|CPAR|";
	private static final String SEPARATOR_OUT = "\\|CPAR\\|";
	
	public Sentence()
	{
		words = new ArrayList<Map<String, String>>();
	}
	/**
	 * @return the level
	 */
	public int getLevel() {
		return level;
	}
	/**
	 * @param level the level to set
	 */
	public void setLevel(int level) {
		this.level = level;
	}
	/**
	 * @return the words
	 */
	public List<Map<String, String>> getWords() {
		return words;
	}
	public static Sentence fromJSONArray(String jsonStringArray) throws JSONException
	{
		Sentence sentence = new Sentence();
		String[] jsonArray = jsonStringArray.split(SEPARATOR_OUT);
		for(int i = 0; i < jsonArray.length; i++)
		{
			Map<String, String> wordMap = new HashMap<String, String>();
			JSONObject jsonObj = new JSONObject( jsonArray[i]);
			
			@SuppressWarnings("unchecked")
			Iterator<String> iterator = jsonObj.keys();
			while (iterator.hasNext()) {
				String key = (String) iterator.next();
				String value = jsonObj.getString(key);
				wordMap.put(key, value);
			}
			sentence.words.add(wordMap);
		}
		return sentence;
	}
	public static Sentence fromNode(Node node)
	{
		node.normalize();
		Sentence sentence = new Sentence();
		NodeList wordNodes = node.getChildNodes();
		int numWords = wordNodes.getLength();
		
		for(int i = 0; i < numWords; i++)
		{
			Node wordNode = wordNodes.item(i);
			short nodeType = wordNode.getNodeType();
			if(nodeType != Node.ELEMENT_NODE)
			{
				continue;
			}
			NamedNodeMap wordAttributes = wordNode.getAttributes();
			int numWordAttributes = wordAttributes.getLength();
			Map<String, String> wordAttributesMap = new HashMap<String, String>();
			for(int j = 0; j < numWordAttributes; j++)
			{
				Node wordAttribute = wordAttributes.item(j);
				wordAttributesMap.put(wordAttribute.getNodeName(), wordAttribute.getNodeValue());
			}
			sentence.getWords().add(wordAttributesMap);
			
		}
		return sentence;
	}
	@Override
	public String toString()
	{
		StringBuilder sbStr = new StringBuilder();
		int index = 0;
		for(Map<String, String> word : getWords()){
			JSONObject json = new JSONObject(word);
			if (index > 0){
	            sbStr.append(SEPARATOR_IN);
			}
			sbStr.append(json.toString());
			index++;
		}
		
		return sbStr.toString();
	}
	public String toUserCompleteString()
	{
		StringBuffer sb = new StringBuffer();
		for(int i = 0; i < getWords().size(); i++)
		{
			if(i > 0)
			{
				sb.append(",");
			}
			JSONObject json = new JSONObject(getWords().get(i));
			sb.append(json.toString());
		}
		return "["+sb.toString()+"]";
	}
	public String toUserString(Boolean hasDprel) {
		StringBuffer sb = new StringBuffer();
		for(int i = 0; i < getWords().size(); i++)
		{
			if(i > 0)
			{
				sb.append(",");
			}
			JSONObject json = new JSONObject(getWords().get(i));
			if(!hasDprel){
				json.remove("deprel");
				json.remove("head");
				json.remove("chunk");
			}
			sb.append(json.toString());
		}
		return "["+sb.toString()+"]";
	}
}
