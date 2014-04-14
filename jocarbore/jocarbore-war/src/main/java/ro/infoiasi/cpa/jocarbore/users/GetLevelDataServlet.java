package ro.infoiasi.cpa.jocarbore.users;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.admin.ImportSentencesServlet;
import ro.infoiasi.cpa.jocarbore.model.Sentence;
import ro.infoiasi.cpa.jocarbore.services.GameUserProfileService;

import com.google.appengine.api.users.User;

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
		ServletInputStream is = req.getInputStream();
		BufferedReader br = new BufferedReader( new InputStreamReader(is) );
		String jsonStr, line = br.readLine();
		jsonStr = line;
		
		
		while((line = br.readLine()) != null)
		{
			jsonStr += line;
		}
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
		Sentence sentence = null;
//		Sentence previousSentence = null;
		try {
			sentence = GameUserProfileService.getInstance().getSentenceByLevel(level);
//			if(level > 0)
//			{
//				previousSentence = GameUserProfileService.getInstance().getSentenceByLevel(level-1);
//			}
			if(null == sentence)
			{
				resp.sendError(404);
				return;
			}
		} catch (JSONException e) {
			e.printStackTrace();
			resp.sendError(500);
			return;
		}
		resp.setContentType(Utils.JSON_CONTENT_TYPE);
		resp.setCharacterEncoding(Utils.UTF8);
		
		String responseJSON = "{\"points\":\""+points+"\",";
		responseJSON += "\"level\":\""+level+"\",";
//		if(null != previousSentence)
//		{
//			responseJSON += "\"previousSentence\":"+previousSentence.toUserCompleteString()+",";
//		}
		PrintWriter pw = resp.getWriter();
		String sentenceStr = sentence.toUserString(false);
		responseJSON += "\"sentence\":"+sentenceStr+"}";
		log.info("Sentence processed: " + responseJSON);
		pw.print(responseJSON);
		pw.flush();
	}
}
