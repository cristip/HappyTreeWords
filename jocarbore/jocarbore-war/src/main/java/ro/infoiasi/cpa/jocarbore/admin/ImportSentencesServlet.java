/**
 * 
 */
package ro.infoiasi.cpa.jocarbore.admin;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
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
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		try{
			List<FileItem> items = new ServletFileUpload(new DiskFileItemFactory()).parseRequest(req);
			 for (FileItem item : items) {
				if (item.isFormField()) {
				    // Process regular form field (input type="text|radio|checkbox|etc", select, etc).
				    //String fieldname = item.getFieldName();
				    //String fieldvalue = item.getString();
					//we dont care about these here...
				    continue;
				} else {
				    // Process form file field (input type="file").
				    //String fieldname = item.getFieldName();
				    //String filename = FilenameUtils.getName(item.getName());
				    InputStream filecontent = item.getInputStream();
				    Document doc = Utils.readXml(filecontent);
				    doc.normalizeDocument();
				    int numEntries = adminService.importDocument(doc);
				    resp.setContentType(Utils.JSON_CONTENT_TYPE);
				    PrintWriter printer = resp.getWriter();
					printer.print("{\"result\":\"200 OK\", \"status\":\"File Imported:" + numEntries + "\"}");
					printer.flush();
				}
			 }
			 return;
		}catch(FileUploadException e){
			e.printStackTrace();
			//resp.sendError(500);
		}catch(Exception e){
			//resp.sendError(500);
			e.printStackTrace();
		}
		resp.sendError(500);
	}

}
