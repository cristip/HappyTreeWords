/**
 * 
 */
package ro.infoiasi.cpa.jocarbore.admin;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.w3c.dom.Document;

import ro.infoiasi.cpa.jocarbore.Utils;
import ro.infoiasi.cpa.jocarbore.services.AdminService;

/**
 * @author Cparasca
 *
 */
public class ImportSentencesServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = -4873885606270493492L;
	private AdminService adminService = AdminService.getInstance();
	 private static final Logger log = Logger.getLogger(ImportSentencesServlet.class.getName());

//	private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		log.info("starting file import...");
		try{
			String xmlStr = req.getParameter("file");
		    Document doc = Utils.readXml(xmlStr);
		    doc.normalizeDocument();
		    int numEntries = adminService.importDocument(doc);
		    resp.setContentType(Utils.JSON_CONTENT_TYPE);
		    PrintWriter printer = resp.getWriter();
			printer.print("{\"result\":\"200 OK\", \"status\":\"File Imported:" + numEntries + "\"}");
			printer.flush();
			log.info("file imported...");
		}catch(Exception e){
			PrintWriter pw = resp.getWriter();
			e.printStackTrace(pw);
			pw.flush();
			log.severe(e.toString());
		}
	}

}
