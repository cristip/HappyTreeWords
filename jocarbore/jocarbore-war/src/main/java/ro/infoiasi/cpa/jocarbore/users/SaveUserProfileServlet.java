/**
 * 
 */
package ro.infoiasi.cpa.jocarbore.users;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.services.GameUserProfileService;
import ro.infoiasi.cpa.jocarbore.validators.SchoolValidator;
import ro.infoiasi.cpa.jocarbore.validators.UserNameValidator;

import com.google.appengine.api.users.User;
import com.google.appengine.repackaged.org.apache.commons.httpclient.HttpException;

/**
 * @author Cparasca
 *
 */
public class SaveUserProfileServlet extends HttpServlet {
	
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			resp.sendError(401);
			return;
		}
		req.setCharacterEncoding(Utils.UTF8);
		ServletInputStream is = req.getInputStream();
		
		BufferedReader br = new BufferedReader( new InputStreamReader(is) );
		String jsonStr, line = br.readLine();
		jsonStr = line;
		
		
		while((line = br.readLine()) != null)
		{
			jsonStr += line;
		}
		JSONObject json = null;
		try{
			json = new JSONObject(jsonStr);
			String nick = json.getString("nick");
			String school = json.getString("school");
			if(null == nick || null == school || !(new UserNameValidator().validate(nick)) || !(new SchoolValidator().validate(school)))
			{
				resp.sendError(400);
				return;
			}
			Map<String, String> profileMap = GameUserProfileService.getInstance().getProfileMap();
			profileMap.put(Utils.EMAIL_FIELD_NAME, user.getEmail());
			profileMap.put(Utils.USERNAME_FIELD_NAME, nick);
			profileMap.put(Utils.SCHOOL_FIELD_NAME, school);
			GameUserProfileService.getInstance().updateUserProfile(profileMap);
			
		}catch(Exception e)
		{
			resp.sendError(400);
			return;
		}
		resp.setContentType(Utils.JSON_CONTENT_TYPE);
		resp.setCharacterEncoding(Utils.UTF8);
		
		String responseJSON = "{\"status\":\"ok\"}";
		PrintWriter pw = resp.getWriter();
		pw.print(responseJSON);
		pw.flush();
		
		
	}
}
