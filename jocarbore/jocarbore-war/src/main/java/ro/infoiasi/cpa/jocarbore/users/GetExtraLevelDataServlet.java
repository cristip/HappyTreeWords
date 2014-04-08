package ro.infoiasi.cpa.jocarbore.users;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.model.Sentence;
import ro.infoiasi.cpa.jocarbore.services.GameUserProfileService;

public class GetExtraLevelDataServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -9177108747424456378L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		if(null == Utils.getCurrentUser())
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
		Sentence sentence;
		try {
			sentence = GameUserProfileService.getInstance().getSentenceByLevel(Integer.parseInt(levelStr));
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
		GameUserProfileService.getInstance().removeUserPoints(150);
		resp.setContentType(Utils.JSON_CONTENT_TYPE);
		PrintWriter pw = resp.getWriter();
		pw.print(sentence.toUserString(true));
		pw.flush();
	}
}
