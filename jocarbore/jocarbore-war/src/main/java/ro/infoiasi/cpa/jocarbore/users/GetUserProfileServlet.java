package ro.infoiasi.cpa.jocarbore.users;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.exceptions.UserBannedException;
import ro.infoiasi.cpa.jocarbore.services.UserService;




public class GetUserProfileServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 520735051974116706L;
	private UserService userService = UserService.getInstance();

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		try{
			String userDetails = userService.getUserProfile();
			if(null == userDetails)
			{
				resp.sendError(401);
				return;
			}
			PrintWriter out = resp.getWriter();
			resp.setContentType(Utils.JSON_CONTENT_TYPE);
			out.print(userDetails);
			out.flush();
		}catch (UserBannedException e)
		{
			resp.sendError(401);
		}
	}

}
