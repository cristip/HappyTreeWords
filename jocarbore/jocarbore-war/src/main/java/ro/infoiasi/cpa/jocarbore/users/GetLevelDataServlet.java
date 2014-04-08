package ro.infoiasi.cpa.jocarbore.users;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.appengine.api.users.User;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.admin.ImportSentencesServlet;
import ro.infoiasi.cpa.jocarbore.model.Sentence;
import ro.infoiasi.cpa.jocarbore.services.GameUserProfileService;

public class GetLevelDataServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 8958361878455643037L;
	private static final Logger log = Logger.getLogger(ImportSentencesServlet.class.getName());

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			resp.sendError(401);
			return;
		}
		String levelStr = req.getParameter("level");
		if(null == levelStr)
		{
			resp.sendError(400);
			return;
		}
		
		int level = Integer.parseInt(levelStr);
		sendLevelResponse(resp, level, user);
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			resp.sendError(401);
			return;
		}
		ServletInputStream is = req.getInputStream();
		String levelStr = req.getParameter("level");
		
		
		if(null == levelStr)
		{
			resp.sendError(400);
			return;
		}
		int level = Integer.parseInt(levelStr);
		
		BufferedReader br = new BufferedReader( new InputStreamReader(is) );
		String jsonStr, line = br.readLine();
		jsonStr = line;
		
		
		while((line = br.readLine()) != null)
		{
			jsonStr += line;
		}
		JSONObject json = null;
		try {
			log.info("trying to parse the level string: " + jsonStr);
			json = new JSONObject(jsonStr);
			
			int pointsGained = GameUserProfileService.getInstance().validateUserSentence(json, level, user);
			if(pointsGained > 0)
			{
				level ++;
			}
			
		} catch (JSONException e) {
			log.severe(e.toString());
			resp.sendError(400);
			return;
		}
		sendLevelResponse(resp, level, user);
		
		
	}
	private void sendLevelResponse(HttpServletResponse resp, int level, User user) throws IOException
	{
		int points = GameUserProfileService.getInstance().getUserPoints(user);
		
		String sentenceStr = GameUserProfileService.getInstance().getSentenceByLevel(level);
		if(null == sentenceStr)
		{
			resp.sendError(404);
			return;
		}
		Sentence sentence;
		try {
			sentence = Sentence.fromJSONArray(sentenceStr);
		} catch (JSONException e) {
			e.printStackTrace();
			resp.sendError(500);
			return;
		}
		resp.setContentType(Utils.JSON_CONTENT_TYPE);
		resp.setCharacterEncoding("utf-8");
		
		String responseJSON = "{\"points\":\""+points+"\",";
		responseJSON += "\"level\":\""+level+"\",";
		PrintWriter pw = resp.getWriter();
		sentenceStr = sentence.toUserString(false);
		responseJSON += "\"sentence\":"+sentenceStr+"}";
		log.info("Sentence processed: " + responseJSON);
		pw.print(responseJSON);
		pw.flush();
	}
}
