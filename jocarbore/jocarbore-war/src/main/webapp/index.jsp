<%@page import="ro.infoiasi.cpa.jocarbore.Utils"%>
<%@page import="java.util.Map"%>
<%@page import="ro.infoiasi.cpa.jocarbore.services.GameUserProfileService"%>
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
	<link rel="stylesheet" type="text/css" href="css/screen.css">
<%
	UserService userService = UserServiceFactory.getUserService();
	User user = userService.getCurrentUser();
	if (user != null) {
    	pageContext.setAttribute("user", user);
    	Map<String, String> userProfileMap = GameUserProfileService.getInstance().getUserProfile();
    	Boolean hasPlayedBefore = Integer.parseInt( userProfileMap.get("level")) == 0 && Integer.parseInt( userProfileMap.get("points")) == 0;
    	pageContext.setAttribute("userProfile", Utils.jsonFromMap(userProfileMap));
    	
%>
	<script src="http://code.createjs.com/createjs-2013.12.12.min.js" type="text/javascript"></script>
	<script src="http://code.jquery.com/jquery-2.1.0.min.js" type="text/javascript"></script>
	<script src="js/game.js"></script>
	<script>
	var stage;
	var update = false;
	var board;
	var boardGrid;
	/** integ nivelul curent, incepand cu 0 pentru primul nivel */
	var _currentLevel = 0;
	var initialUserProfile = ${userProfile};
	/** masoara in mod diferit fata de IE sau WebKit) boolean */
	var is_firefox;
	function init () {
	  is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	  $("#startGameBtn").click(newGame);
	  _currentLevel = parseInt(initialUserProfile.level);
	  $("#gameLevel").text(_currentLevel+1);
	  $("#points").text(initialUserProfile.points);
	  
	}
	</script>
</head>
<body onload="init();">
  <div id="gameBox">
    <div id="gameStats">
      <div class="leftAlign">
        <p id="user">${fn:escapeXml(user.nickname)}, Nivelul <span id="gameLevel">15</span><br/><span id="points">2134</span> puncte</p>
      </div>
      <div class="rightAlign">
        
        <p><a href="#showHelp" id="helpBtn">Ajutor, ce trebuie să fac acum?</a></p>
      </div>
      <div class="centerAlign">
        <h2 id="sentenceText">Hai să incepem</h2>
      </div>
      <div id="buttonsContainer">
	      <a class="myButton" id="back2SetupLevelBtn" title="Click pentru a reveni la pozitionare">Inapoi la pozitionare</a>
	      <a class="myButton" id="deleteAllConnectionsBtn" title="Sterge toate conexiunile existente">Sterge toate conexiunile</a>
	      <a class="myButton" id="nextLevelBtn" title="Click pentru a merge la nivelul urmator">Nivelul Urmator</a>
	      <a class="myButton" id="next2ConnectionsBtn" title="Click pentru a intra in modul conexiuni">Conexiuni</a>
      </div>
    </div>
    <div id="startGame">
        <ol>
          <li><a href="#tutorial">Vezi tutorial</a></li>
          <%
          if(hasPlayedBefore)
          {
          %>
          <li><a href="#startJoc" id="startGameBtn">Să jucăm</a></li>
          <%
          }else
          {
          %>
          <li><a href="#startJoc" id="startGameBtn">Să jucăm în continuare</a></li>
	      	  <%
	      		if(Integer.parseInt( userProfileMap.get("level")) < 5)
	      		{
	      	  %>
      	  <li><a href="#resetJoc">Începe de la primul nivel</a></li>
          <%
          		}
          }
          %>
          <li><a href="#clasament">Vezi clasamentul</a></li>
          <li><a href="#despre">Despre această aplicație</a></li>
        </ol>
    </div>
    <canvas id="gameCanvas" width="1050" height="650">
      Browserul dvs nu este suportat. Recomandam Chrome, Firefox sau Internet Explorer 11.
    </canvas>
  </div>
  <div class="modalDialog">
      <div id="firstHelpTip" title="Apasă pentru a închide">
        <p>Plasează toate cuvintele ca să obții arborele dorit!</p>
        <p><img src="assets/images/hint_plasare.png" alt="cuvinte plasate"/><br/>Continuă</p>
      </div>
      <div id="secondHelpTip" title="Apasă pentru a închide">
        <p>Conectează cuvintele respectînd ordinea sintactică!</p>
        <p><img src="assets/images/hint_conectare.png" alt="cuvinte conectate"/><br/>Dublu click pe un cuvant pentru a-l conecta</p>
      </div>
      <div id="deleteDialog" title="Apasă pentru a închide">
        <p>Vrei sa stergi aceasta conexiune?</p>
        <a class="myButton" id="deleteConnectionBtn">Sterge</a>&nbsp;&nbsp;<a class="myButton" id="cancelDeleteConnectionBtn">Anulează</a>
      </div>
      <div id="samelevelDialog" title="Apasă pentru a închide">
        <p>Nu ai obtinut suficient puncte pentru a trece la nivelul urmator. Mai încearcă!</p>
      </div>
      <div id="validationDialog" title="Apasă pentru a închide">
        <p><span id="validationDialogError">&nbsp;</span><br/>Continuă</p>
      </div>
      <div id="partiProp" title="Alege partea de propozitie">
      		<p>Alege partea de propziție potrivită pentru cuvântul selectat:</p>
      		<h2 id="partiPropWord">&nbsp;</h2>
      		<div id="radios">
					<label class="myButton" for="sbj" title="Subiect"><input id="sbj" type="radio" name="partProp">Subiect (sbj.)</label>
					<label class="myButton" for="pred" title="Predicat"><input id="pred" type="radio" name="partProp">Predicat (pred.)</label>
					<label class="myButton" for="cd" title="Complement Direct"><input id="cd" type="radio" name="partProp">Complement Direct (c.d.)</label>
					<label class="myButton" for="punct" title="Semn de Punctuație"><input id="punct" type="radio" name="partProp">Semn de Punctuație (punct.)</label>
					<label class="myButton" for="neg" title="Particulă de Negație"><input id="neg" type="radio" name="partProp">Particulă de Negație (neg.)</label>
					<label class="myButton" for="aux" title="Auxiliar"><input id="aux" type="radio" name="partProp">Auxiliar (aux).</label>
					<label class="myButton" for="prep" title="Relație Prepoziționala"><input id="prep" type="radio" name="partProp">Relație Prepoziționala (prep.)</label>
					<label class="myButton" for="aadj" title="Atribut Adjectival"><input id="aadj" type="radio" name="partProp">Atribut Adjectival (a.adj.)</label>
					<label class="myButton" for="det" title="Relatie Comparativă"><input id="det" type="radio" name="partProp">Relatie Comparativă (det.)</label>
					<label class="myButton" for="ci"  title="Complement Indirect"><input id="ci" type="radio" name="partProp">Complement Indirect (c.i.)</label>
					<label class="myButton" for="asubst" title="Atribut Substantival"><input id="asubst" type="radio" name="partProp">Atribut Substantival (a.subst.)</label>
					<label class="myButton" for="subord" title="Subord"><input id="subord" type="radio" name="partProp">Subordonare (subord.)</label>
					<label class="myButton" for="refl" title="Reflexiv"><input id="refl" type="radio" name="partProp">Reflexiv (refl.)</label>
					<label class="myButton" for="npred" title="Nume Predicativ"><input id="npred" type="radio" name="partProp">Nume Predicativ (n.pred.)</label>
					<label class="myButton" for="ccl" title="Complement Circumstanțial de Loc"><input id="ccl" type="radio" name="partProp">Complement Circumstanțial de Loc (c.c.l.)</label>
					<label class="myButton" for="coord" title="Coordonare"><input id="coord" type="radio" name="partProp">Coordonare (coord.)</label>
					<label class="myButton" for="cct" title="Complement Circumstanțial de Timp"><input id="cct" type="radio" name="partProp">Complement Circumstanțial de Timp (c.c.t.)</label>
					<label class="myButton" for="part" title="Particulă"><input id="part" type="radio" name="partProp">Particulă (part.)</label>
					<label class="myButton" for="ccm" title="Complement Circumstantial de Mod"><input id="ccm" type="radio" name="partProp">Complement Circumstantial de Mod (c.c.m.)</label>
					<label class="myButton" for="cccz" title="Complement Circumstantial de Caz"><input id="cccz" type="radio" name="partProp">Complement Circumstantial de Caz (c.c.cz.)</label>
					<label class="myButton" for="ccscop" title="Complement Circumstantial de Scop"><input id="ccscop" type="radio" name="partProp">Complement Circumstantial de Scop (c.c.scop.)</label>
					<label class="myButton" for="cccons" title="Complement Circumstantial Consecutiv"><input id="cccons" type="radio" name="partProp">Complement Circumstantial Consecutiv (c.c.cons.)</label>
					<label class="myButton" for="ccconc" title="Complement Circumstantial Concesiv"><input id="ccconc" type="radio" name="partProp">Complement Circumstantial Concesiv (c.c.conc.)</label>
					<label class="myButton" for="cccond" title="Complement Circumstantial Conditional"><input id="cccond" type="radio" name="partProp">Complement Circumstantial Conditional (c.c.cond.)</label>
			</div>
			<a class="myButton" id="cancelPartiProp">Anulează</a>
      </div>
  </div>
<%
	}else
	{
%>
</head>
<body>
	 <h1>Bună! Pentru a juca trebuie să te <a class="underlined" href="<%= userService.createLoginURL(request.getRequestURI()) %>">înregistrezi</a></h1>
	 <p>Aplicația foloseste Google pentru autentificare.</p>
<%
	}
%>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-42440476-2', 'jocarbore.appspot.com');
  ga('send', 'pageview');

</script>
</body>
</html>