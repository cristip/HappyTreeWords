<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Import propozitii</title>

</head>
<body>
<%
UserService userService = UserServiceFactory.getUserService();
User user = userService.getCurrentUser();
if (user == null || !userService.isUserAdmin()) {
%>
<h1>Autentifica-te <a href="<%= userService.createLoginURL(request.getRequestURI()) %>">aici</a></h1>!
<%
}
else
{
%>
<form action="import" method="post" enctype="multipart/form-data">
	<label for="file">Fișier: <input type="file" name="file" id="file"/></label>
	<input type="submit" name="submit" value="Importă"/>
</form>
<%
}
%>
</body>
</html>