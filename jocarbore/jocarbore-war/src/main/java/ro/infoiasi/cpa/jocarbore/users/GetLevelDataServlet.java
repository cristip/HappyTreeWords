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

public class GetLevelDataServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 8958361878455643037L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String levelStr = req.getParameter("level");
		if(null == levelStr)
		{
			resp.sendError(400);
			return;
		}
		String sentenceStr = GameUserProfileService.getInstance().getSentenceByLevel(Integer.parseInt(levelStr));
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
		PrintWriter pw = resp.getWriter();
		pw.print(sentence.toUserString(false));
		pw.flush();
	}
}
