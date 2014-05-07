package ro.infoiasi.cpa.jocarbore.admin;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class NightlyReportServlet extends HttpServlet {
	
	private static final Logger log = Logger.getLogger(NightlyReportServlet.class.getName());
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		log.info("starting cron job");
		
		log.info("end cron job");
	}
}
