package ro.infoiasi.cpa.jocarbore.users;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.google.appengine.api.datastore.Entity;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.services.GameUserProfileService;

public class TopPlayersServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1864075074976125903L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		GameUserProfileService service = GameUserProfileService.getInstance();
		List<Entity> users = service.getTopPlayers();
		
		StringBuffer sb = new StringBuffer();
		sb.append("{\"users\":[");
		int index = 0;
		for(Entity user: users){
			if(index > 0)
			{
				sb.append(",");
			}
			sb.append("{\"email\":\"");
			sb.append(user.getProperty("email"));
			sb.append("\",");
			sb.append("\"loc\":\"");
			sb.append(index+1);
			sb.append("\",");
			sb.append("\"puncte\":\"");
			sb.append(user.getProperty("points"));
			sb.append("\",");
			sb.append("\"nivel\":\"");
			sb.append(user.getProperty("level"));
			sb.append("\"}");
		}
		sb.append("]}");
		
		
		resp.setContentType(Utils.JSON_CONTENT_TYPE);
		resp.setCharacterEncoding(Utils.UTF8);
		PrintWriter printer = resp.getWriter();
		printer.print(sb.toString());;
		printer.flush();
	}
}
