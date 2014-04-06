package ro.infoiasi.cpa.jocarbore.users;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ro.infoiasi.cpa.jocarbore.Utils;

import com.google.appengine.api.users.User;


public class GetUserProfileServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 520735051974116706L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		User user = Utils.getCurrentUser();
		if(null == user)
		{
			resp.sendError(401);
			return;
		}
		String userLevel = null;
		String userPoints = null;
		
		
		PrintWriter out = resp.getWriter();
		resp.setContentType(Utils.JSON_CONTENT_TYPE);
		
		Map<String, String> responseMap = new HashMap<String, String>();
		responseMap.put("user", user.getNickname());
		responseMap.put("level", userLevel);
		responseMap.put("points", userPoints);
		
		out.print(Utils.jsonFromMap(responseMap));
		out.flush();
	}

}
