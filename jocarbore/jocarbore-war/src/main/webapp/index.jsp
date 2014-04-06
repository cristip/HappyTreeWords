<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Arbore Sintactic</title>
<%
	UserService userService = UserServiceFactory.getUserService();
	User user = userService.getCurrentUser();
	if (user != null) {
    	pageContext.setAttribute("user", user);
%>
	<link rel="stylesheet" type="text/css" href="css/screen.css">
	<link href='http://fonts.googleapis.com/css?family=Hammersmith+One&subset=latin-ext' rel='stylesheet' type='text/css'>
	<script src="http://code.createjs.com/createjs-2013.12.12.min.js" type="text/javascript"></script>
	<script src="http://code.jquery.com/jquery-2.1.0.min.js" type="text/javascript"></script>

	<script src="js/dummyserver.js"></script>
	<script src="js/game.js"></script>
	
	<script>
	var stage;
	var update = false;
	var board;
	var boardGrid;
	/** masoara in mod diferit fata de IE sau WebKit) boolean */
	var is_firefox;
	function init () {
	  is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	  //simulez un preloader...
		//setTimeout(newGame, 1000)
	  $("#startGameBtn").click(newGame);
	}
	</script>
</head>
<body onload="init();">
<a href="#nextLevel" class="myButton" id="nextLevelBtn" title="Click pentru a merge la nivelul urmator">Nivelul Urmator</a>
  <div id="gameBox">
    <div id="gameStats">
      <div class="leftAlign">
        <p id="user">${fn:escapeXml(user.nickname)}, Nivelul 15<br/><span id="points">2134</span> puncte</p>
      </div>
      <div class="rightAlign">
        
        <p><a href="#showHelp" id="helpBtn">Ajutor, ce trebuie să fac acum?</a><br/><a id="dprelBtn" href="#showHint">Arată parți vorbire (-150 puncte)</a></p>
      </div>
      <div class="centerAlign">
        <h2 id="sentenceText">Hai să incepem</h2>

      </div>
    </div>
    <div id="startGame">
        <ol>
          <li><a href="#tutorial">Vezi tutorial</a></li>
          <li><a href="#startJoc" id="startGameBtn">Să jucăm</a></li>
          <li><a href="#clasament">Vezi clasamentul</a></li>
          <li><a href="#despre">Despre această aplicație</a></li>
        </ol>
    </div>
    <canvas id="gameCanvas" width="1050" height="650">
      Browserul dvs nu este suportat. Recomandam Chrome, Firefox sau Internet Explorer 11.
    </canvas>
  </div>
  <div class="modalDialog">&nbsp;
      <div id="firstHelpTip" title="Apasă pentru a închide">
        <p>Plasează toate cuvintele ca să obții arborele dorit!</p>
        <p><img src="assets/images/hint_plasare.png" alt="cuvinte plasate"/><br/>Continuă</p>
      </div>
      <div id="secondHelpTip" title="Apasă pentru a închide">
        <p>Conectează cuvintele respectînd ordinea sintactică!</p>
        <p><img src="assets/images/hint_conectare.png" alt="cuvinte conectate"/><br/>Dublu click pe un cuvant pentru a-l conecta</p>
      </div>
  </div>
<%
	}else
	{
%>
</head>
<body>
	 <h1>Bună! Pentru a juca trebuie să te <a href="<%= userService.createLoginURL(request.getRequestURI()) %>">înregistrezi</a></h1>
	 <p>Aplicația foloseste Google pentru autentificare.</p>
<%
	}
%>
</body>
</html>