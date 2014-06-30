//Jocul de Arobore sintactic
//mailto:cristian.parascan@info.uaic.ro
var BOARD_Y = 50;
var MIN_WORD_WIDTH = 70;
var PARTI_PROPOZITIE_NECOMPLETATE = "Nu ai completat cu toate partile de propozitie.<br/><br/>Click pe o conexiune ca să selectezi parțile de propoziție!<br/>";
var CUVINTE_NECONECTATE = "Nu ai conectat toate cuvintele.<br/><br/>Click pe un Predicat ca să îl unești cu o parte de propoziție subordonată și completează cu partea de propoziție!<br/>";

/**
 * lista ce contine elemente de tip conexiune
 */
var _currentConnections = [];
/**
 * referinta catre conexiunea curenta
 */
var _currentConnection = null;
/**
 * numarul de nivele jucate
 */
var _levelsPlayed = 0;
/**
 * referinta catre cuvantul curent
 */
var _currentWordUI = null;
/**
 * related to the connection action
 * is connection while the mouse is pressed 
 */
var _isConnecting = false;
/**
 * related to the application state
 * true daca este in modul de conexiuni
 */
var _isDrawPaths = false;
/**
 * Array de word{
 *	id:int,
 *	text:string,
 *	head:string,
 *	lemma:string,
 *	postag:string,
 *	dprel:string,
 *	parent:word,
 *	kids:word[],
 *  isPunctuation:bool
 *}
 */
var currentProcessedSentence;

/**
 * wordUI care au fost plasate deja pe board;
 */
var boardDroppedWords;

/**
 * Stage, referinta la elementul Stage din canvas
 */
var stage;
/**
 * flag, boolean true daca e nevoie sa se faca update la canvas
 */
var update = false;
/**
 * Container, referinta catre locul unde se plaseaza cuvintele WordUI
 */
var board;
/**
 * imaginea de fundal
 */
var treeBg;
/**
 * @deprecated
 * referinta catre un grid
 */
var boardGrid;
/** integ nivelul curent, incepand cu 0 pentru primul nivel */
var _currentLevel = 0;

/** masoara in mod diferit fata de IE sau WebKit) boolean */
var is_firefox;
/**
 * initializeaza aplicatia
 */
function init () {
	is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	$("#startGameBtn").click(newGame);
	_currentLevel = parseInt(initialUserProfile.level);
	$("#gameLevel").text(_currentLevel+1);
	$("#points").text(initialUserProfile.points);
	$("#myProfile").click(openMyProfile);
	$("#cancelPartiProp").click(function()
	{
		for(var i = 0; i < _currentConnections.length; i++)
		{
			if(_currentConnections[i] == _currentConnection)
			{
				_currentConnections.splice(i, 1);
				break;
			}
		}
		_currentConnection.cleanUp();
		stage.update();
		$("#partiProp").hide();
		$(".modalDialog").hide();
	});
	$("#deleteAllConfirmConnectionBtn").click(deleteAllConnections);
	$("#cancelDeleteAllConnectionBtn").click(function(){
		$("#deleteAllDialog").hide();
		$(".modalDialog").hide();
	});
	$("#radios>label").click(function(evt){
		var str = String(this.lastChild.nodeValue);
		if(!_currentConnection)
		{
			return;
		}
		_currentConnection.setPartePropozitie(str.substring(str.lastIndexOf("(")+1, str.lastIndexOf(")")));
		_currentConnection = null;
		stage.update();
		$("#partiProp").hide();
		$(".modalDialog").hide();
	});
	$( window ).resize(windowResizeHandler);
	
	$("#clasamentBtn").click(showClasament);
	$("#clasamentContainer>.myButton").click(goToHome);
	$("#myProfieContainer>.myButton").click(saveMyProfile);
}

function trimmSpaces(value)
{
	if(!value)
	{
		return null;
	}
	return value.split(" ").join("");
}

function saveMyProfile()
{
	var nick = $("#nicknameTextInput").val();
	var school = $("#schoolTextInput").val();

	if(nick == oldNick && school == oldSchool)
	{
		goToHome();
		return;
	}
	
	
	if(!trimmSpaces(nick))
	{
		displayValidationError("Numele de utilizator lipseste");
		return;
	}
	var nick_validation =  nick.match(/^[a-zA-Z0-9_.]{3,25}$/);
	if(!nick_validation || nick_validation[0] != nick)
	{
		displayValidationError("Numele de utilizator trebuie sa contina doar caractere alfanumerice sau punct");
		return;
	}
	
	if(!trimmSpaces(school))
	{
		school = "fără școală";
	}else
	{
		if(school.match(/^[a-zA-ZȘșȚțăĂîÎâÂ 0-9_.-]{3,50}$/)[0] != school){
			displayValidationError("Numele de utilizator trebuie sa contina doar caractere alfanumerice, punct sau cratimă");
			return;
		}
		
		$.ajax({
			contentType:"application/x-www-form-urlencoded; charset=UTF-80",
			url:"myprofile",
			type:"POST",
			data:"{\"nick\":\"" + nick + "\", \"school\":\"" + school + "\"}"
		}).done(function(){
			displayValidationError("Profilul a fost salvat!");
			$("#myProfile").text(nick);
		});
	}
	
	
	
	goToHome();
}

function windowResizeHandler()
{
	var cvs = document.getElementById("gameCanvas");
	var ctx = cvs.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight - 120;
	treeBg.x = window.innerWidth/2 - 525;
	stage.update();
}

/**
 * se afiseaza clasamentul
 */
function showClasament()
{
	$("#sentenceText").text("Top Jucatori");
	$("#startGame").hide();
	$("#clasamentContainer").show();
	$.ajax("topjucatori").done(onTopLoaded);
}
/**
 * se ascunde clasamentul
 */
function goToHome()
{
	$("#sentenceText").text("Hai să începem!");
	$("#startGame").show();
	$("#clasamentContainer").hide();
	$("#myProfieContainer").hide();
}
/**
 * incepe un nou joc
 */
function newGame()
{
	$("#startGame").hide();
	$('#gameContainer').show();
	$('#helpBtn').show();
	$('#helpBtn').click(function(){
		var message = "";
		if(boardDroppedWords.length != currentProcessedSentence.length)
		{
			message = "Plasează toate cuvintele pe scena.<br/>Trage de cuvânt cu mouse-ul și eliberează cuvântul sub linia gri.<br/><br/><br/>";
		}else
		if(!_isDrawPaths)
		{
			message = "Aranjeaza cuvintele sub forma arborelui sintactic si cand esti multumit intra in modul conexiuni: click pe butonul conexiuni.<br/>Cuvintele subordonate trebuie să se afle ca poziție sub relația lor: De exemplu un subiect se află sub un predicat<br/>";
		}
		else if(!haveAllConnectedWords())
		{
			message = "Conecteaza toate cuvintele: click pe părinte și cu mouse apăsat, mută mouse pe cuvantul subordonat și eliberează.<br/> De exemplu săgeata pleacă dinspre predicat spre Subiect iar relația este de Subiect<br/><br/>";
		}
		else
		{
			message = "Apasa butonul \"Nivelul Urmator\" pentru a trece la nivelul urmator.<br/><br/><br/>";
		}
		displayValidationError(message);
	});
	var cvs = document.getElementById("gameCanvas");
	var ctx = cvs.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight - 120;
	stage = new createjs.Stage("gameCanvas");
	createjs.Touch.enable(stage);
  	board = new createjs.Container();
  	board.y = BOARD_Y;
  	drawTree();
  	stage.addChild(board);
  	loadData(_currentLevel);
  	createjs.Ticker.addEventListener("tick", tick);
}
/**
 * event handler, s-a incarcat raspunsul cu topul jucatorilor
 * @param result
 */
function onTopLoaded(result)
{
	var htmlStr = "";
	for(var i = 0; i < result.users.length; i++)
	{
		htmlStr += "<tr>";
		htmlStr += "<td>"+result.users[i].loc+"</td>";
		htmlStr += "<td>"+result.users[i].email+"</td>";
		htmlStr += "<td>"+result.users[i].nivel+"</td>";
		htmlStr += "<td>"+result.users[i].puncte+"</td>";
		htmlStr += "</tr>";
	}
	$("#listaTopJucatori").html(htmlStr);
}
/**
 * intialize the view to be able to display a new level
 */
function initLevel()
{
	clearBoard();
	if(_currentLevel == 0)
	{
		setTimeout(displayFirstHelpTip, 500);
	}
	_isConnecting = false;
	_currentConnection = null;
	_isDrawPaths = false;
	hideNext2ConnectionsButton();
	hideBack2SetupLevelBtn();
	hideClearAllButton();
	hideNextLevelBtn();
	while(_currentConnections.length > 0)
	{
		var connection = _currentConnections.pop();
		connection.cleanUp();
	}
	
}
/**
 * se afiseaza un dialog cu ajutor pentru partea de plasare a cuvintelor
 */
function displayFirstHelpTip()
{
	$('.modalDialog').show();
	$('#firstHelpTip').show();
	$('#firstHelpTip').click(function(){
		$('.modalDialog').hide();
		$('#firstHelpTip').hide();
	});
}
/**
 * se afiseaza un dialog cu ajutor pentru partea de conexiuni
 */
function displaySecondHelpTip()
{
	$('.modalDialog').show();
	$('#secondHelpTip').show();
	$('#secondHelpTip').click(function(){
		$('.modalDialog').hide();
		$('#secondHelpTip').hide();
	});
}
/**
 * s-a facut click pe stergere sageata
 */
function displayDeleteConnectionAlert()
{
	$('.modalDialog').show();
	$('#deleteDialog').show();
	$('#deleteDialog').click(function(){
		$('.modalDialog').hide();
		$('#deleteDialog').hide();
	});
	$('#deleteConnectionBtn').click(deleteCurrentConnection);
}
/**
 * nu s-a reusit un punctaj corespunzator
 */
function displaySameLevel()
{
	$('.modalDialog').show();
	$('#samelevelDialog').show();
	$('#samelevelDialog').click(function(){
		$('.modalDialog').hide();
		$('#samelevelDialog').hide();
	});
}
/**
 * Se apeleaze periodic pentru a face refresh la canvas
 * @param event
 */
function tick(event){
    if(update)
    {
    	stage.update();    
    }
}
/**
 * pregateste board pentru un nou arbore,
 * este curatat arborele vechi si aplicat gridul
 */
function clearBoard()
{
	board.removeAllChildren ();
	stage.update();

}
/**
 * incarca datele pentru nivelul curent
 * @param int level, incepant cu 0 pentru primul nivel 
 */
function loadData(level)
{
	$.ajax("leveldata?level="+_currentLevel).done(onLevelDataLoaded);
}
/**
 * event handler, s-a incarcat raspunsul serverului pentru un nou nivel
 * @param response
 */
function onLevelDataLoaded(response)
{
//	var strData = levels[level];
//	var xmlData = $.parseXML(strData);
//	var $xml = $(xmlData);
//	var words = $xml.find('word');
	
	var currentPoints = parseInt($("#points").text());
	var newPoints = response.points;
	$("#points").text(newPoints);
	_currentLevel = parseInt(response.level);
	$("#gameLevel").text(_currentLevel + 1);
	
	if(response.previousSentence){
		displaySolvedSentence(response.previousSentence);
	}
	
	if(_levelsPlayed > 0 && currentPoints >= newPoints)
	{
		displaySameLevel();
		return;
	}
	
	initLevel();
	
	var words = response.sentence;
	currentProcessedSentence = [];
	var sentence = [];
	for(var i = 0; i < words.length; i++)
	{   
		currentProcessedSentence.push({
			id:parseInt(words[i].id),
			text:words[i].form,
			postag:words[i].postag,
			parent:null,
			kids:[]
		});
		sentence.push(currentProcessedSentence[i].text);
	}
	var strSentence = sentence.join(" ");
	for(var i = 0; i < currentProcessedSentence.length; i++)
	{
		updateParentKid(currentProcessedSentence[i]);
	}
	displayInitialSentence();
	displayTextSentence(strSentence);
	stage.update();
}
/**
 * se afiseaza propozita corecta
 * @param solvedSentence
 */
function displaySolvedSentence(solvedSentence)
{
	//TODO: trebuie discutat cu toata lumea daca se doreste asa ceva
}
/**
 *@param Object word {
 *	id:int,
 *	text:string,
 *	head:string,
 *	lemma:string,
 *	postag:string,
 *	dprel:string,
 *	parent:word,
 *	kids:word[],
 *  isPunctuation:bool
 *}
 */
function updateParentKid(word)
{
	if(!word.head)
	{
		return;
	}
	word.parent = currentProcessedSentence[word.head];
	word.parent.kids.push(word);
}
/**
 * verifica daca wordXML are atributul attributeName si-i intoarce
 * valoarea, sau null daca nu exista atributul
 * @param wordXML un nod
 * @param attributeName, string numele atributului
 */
function parseWord(wordXML, attributeName)
{
   var wordAttr = wordXML.attributes[attributeName];
   if(wordAttr)
   {
   	return wordAttr.value;
   }
   return null;
}
/**
 * afiseaza propozitia ca text static
 */
function displayTextSentence(strSentence)
{
	$("#sentenceText").text(strSentence);
}
/**
 * afiseaza propozita
 * formata din copii de tip Container
 * 
 */
function displayInitialSentence()
{
	var lastx = 10;
	update = true;
	for(var i = 0; i < currentProcessedSentence.length; i++)
	{
		var word = createWordUI(currentProcessedSentence[i]);
		word.addEventListener('click', onWordClick, true);
		word.addEventListener('mousedown', onWordMouseDown, true);
		word.addEventListener('pressmove', onWordPressMove, true);
		word.addEventListener('pressup', onWordPressUp, true);
		//word.x = lastx;
		word.x = lastx + 400;
		word.y = 10;
		word.alpha = 0;
		//createjs.Tween.get(word).wait(i*250).to({x:lastx,y:10}, 500 + i*200, createjs.Ease.elasticOut).call(function(){
		createjs.Tween.get(word).wait(i*150).to({x:lastx,y:10, alpha:100}, 500 + i*100, createjs.Ease.bounceOut).call(function(){
			
		 });
		var bounds = word.getBounds();
		lastx = lastx+bounds.width+15;
		stage.addChild(word);
	}
	boardDroppedWords = [];
}
/**
 * event handler s-a facut click pe un cuvant
 * @param event
 */
function onWordClick(event)
{
	var wordUI = event.currentTarget;
	var postag = wordUI._data.postag;
	var decoded = "";
	try{
		decoded = msdJS.decode(postag);
	}catch(e)
	{
		decoded = "";
		trace(e);
	}
	$("#statusText").text(wordUI._data.text + ' - '+ decoded);
}
/**
 * event handler, mouse down pe un cuvant
 */
function onWordMouseDown(event)
{
	var wordUI = event.currentTarget;
	wordUI.parent.setChildIndex(wordUI, wordUI.parent.getNumChildren() - 1);
	wordUI._currentLocalX = event.localX;
	wordUI._currentLocalY = event.localY;
	wordUI.initialPosition = {x:wordUI.x, y:wordUI.y};

}
/**
 * event handler, cu mouse apasat se misca cuvatul
 */
function onWordPressMove(event)
{
	update = true;
	$("#statusText").text("");
	var wordUI = event.currentTarget;
	var point = wordUI.parent.globalToLocal(event.stageX, event.stageY);
	wordUI.x = point.x - wordUI._currentLocalX;
	wordUI.y = point.y - wordUI._currentLocalY;
	wordUI.setShadow(25);
	updateLiveConnections();
}
/**
 * event handler, s-a eliberat mouse-ul
 */
function onWordPressUp(event)
{
	var wordUI = event.currentTarget;
	wordUI.setShadow(10);
	if(wordUI.y < 80)
	{
			 createjs.Tween.get(wordUI).to({x:wordUI.initialPosition.x,y:wordUI.initialPosition.y}, 300).call(function(){
			 	update = false;
			 	updateLiveConnections();
			 	stage.update();
			 });
			 return;
	}


	if(wordUI.parent == stage)
	{
		stage.removeChild(wordUI);
		wordUI.y -= BOARD_Y;
		board.addChild(wordUI);
		boardDroppedWords.push(wordUI);
		snapToGrid(wordUI);
		if(boardDroppedWords.length == currentProcessedSentence.length)
		{
			displayStartConnectionsButton();
		}
	}
	update = false;
	stage.update();
}


/**
 * se afiseaza un popup modal din care se pot selecta parti de propozitie
 */
function displayPartiPropozitieDialog()
{
	$("#partiPropWord").text(_currentConnection.destination._data.text);
	$("#sourceWord").text(_currentConnection.source._data.text);
	$(".modalDialog").show();
	$("#partiProp").show();
}
/**
 * se elimina event haldlers pentru un wordUI
 * @param wordUI
 */
function removeWordMoveEventListeners(wordUI)
{
	wordUI.removeEventListener('pressup', onWordPressUp, true);
	wordUI.removeEventListener('mousedown', onWordMouseDown, true);
	wordUI.removeEventListener('pressmove', onWordPressMove, true);
}
/**
 * se elimina event haldlers pentru toate wordUI
 */
function removeMoveEventListeners()
{
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		removeWordMoveEventListeners(wordUI);
	}
}
/**
 * se adauga event handler pentru un cuvant
 * @param wordUI
 */
function addWordDoubleClickEventListener(wordUI)
{
	wordUI.addEventListener('dblclick', onBoardWordDoubleClick, true);
}
/**
 * se adauga event hanler pentru toate cuvintele pentru evenimentul de dublu click
 */
function addDoubleClickEventListeners()
{
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		addWordDoubleClickEventListener(wordUI);
	};
}
/**
 * se trece la modul de conexiuni
 */
function switch2DrawPaths()
{
	if(_isDrawPaths)
	{
		return;
	}
	
	_isDrawPaths = true;
	displayNextLevelButton();
	displayBack2SetupButton();
	displayClearAllButton();
	hideNext2ConnectionsButton();
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		wordUI.addEventListener('pressup', onBoardWordPressUp, true);
		wordUI.addEventListener('mousedown', onBoardWordMouseDown, true);
		wordUI.addEventListener('pressmove', onBoardWordPressMove, true);
		wordUI.setShadow(2);
	};
}

/**
 * se trece la modul de pozitionares
 */
function switch2Setup()
{
	_isDrawPaths = false;
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		wordUI.removeEventListener('pressup', onBoardWordPressUp, true);
		wordUI.removeEventListener('mousedown', onBoardWordMouseDown, true);
		wordUI.removeEventListener('pressmove', onBoardWordPressMove, true);
		wordUI.setShadow(10);
		wordUI.addEventListener('mousedown', onWordMouseDown, true);
		wordUI.addEventListener('pressmove', onWordPressMove, true);
		wordUI.addEventListener('pressup', onWordPressUp, true);
	}
	stage.update();
}
/**
 * se fiseaza butonul de conexiuni.
 */
function displayStartConnectionsButton()
{
	if(_currentLevel == 0)
	{
		setTimeout(displaySecondHelpTip, 500);
	}
	_currentConnections = [];
	addDoubleClickEventListeners();
	displayNext2ConnectionsButton();

}
/**
 * se afiseaza butonul pentru a trece la nivelul urmator
 */
function displayNextLevelButton()
{
	if(!_isDrawPaths)
	{
		hideNextLevelBtn();
		return;
	}
	var domEl = document.getElementById('nextLevelBtn');
	domEl.style.display = "inline-block";
	domEl.onclick = goToNextLevel;
}
/**
 * se ascunde butonul de stergere toate conexiunile
 */
function hideClearAllButton()
{
	$("#deleteAllConnectionsBtn").hide();
}
/**
 * se afiseaza butonul de stergere toate conexiunile
 */
function displayClearAllButton()
{
	$("#deleteAllConnectionsBtn").show();
	$("#deleteAllConnectionsBtn").click(function(){
		$(".modalDialog").show();
		$("#deleteAllDialog").show();
	});
}

function deleteAllConnections()
{
	while(_currentConnections.length>0)
	{
		var conn = _currentConnections.pop();
		conn.cleanUp();
	}
	_currentConnection = null;
	stage.update();
	$("#deleteAllDialog").hide();
	$(".modalDialog").hide();
}

/**
 * se afiseaza butonul de trecere inapoi la conexinu
 */
function displayBack2SetupButton()
{
	var domEl = document.getElementById('back2SetupLevelBtn');
	domEl.style.display = "inline-block";
	domEl.onclick = goBack2SetUpLevel;
}
/**
 * se afiseaza butonul pentru a trece la conexiuni
 */
function displayNext2ConnectionsButton()
{
	var domEl = document.getElementById('next2ConnectionsBtn');
	domEl.style.display = "inline-block";
	domEl.onclick = go2Connections;
}
/**
 * se ascunde butonul pentru a trece la conexiuni
 */
function hideNext2ConnectionsButton()
{
	var domEl = document.getElementById('next2ConnectionsBtn');
	domEl.style.display = "none";
}
/**
 * afiseaza un popup cu textul din errorMsg
 * @param errorMsg
 */
function displayValidationError(errorMsg)
{
	$("#validationDialog").show();
	$(".modalDialog").show();
	$("#validationDialogError").html(errorMsg);
	$("#validationDialog").click(function(){
		$("#validationDialog").hide();
		$(".modalDialog").hide();
	});
}
/**
 * event handler se trece la nivelul urmator
 * @param event
 */
function goToNextLevel(event){
	if(!haveAllConnectedWords())
	{
		displayValidationError(CUVINTE_NECONECTATE);
		return;
	}
	
	var userLevelData = '{"connections":[';
	for(var i = 0; i < _currentConnections.length; i++)
	{
		if(i > 0)
		{
			userLevelData += ',';
		}
		userLevelData += _currentConnections[i].toJSON();
	}
	userLevelData += '],';
	var uiCoords = "[";
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		if(i > 0)
		{
			uiCoords +=",";
		}
		uiCoords += '{"x":"'+boardDroppedWords[i].x+'", "y":"'+boardDroppedWords[i].y+'"}';
	}
	uiCoords += "]";
	userLevelData += '"screen":';
	userLevelData += uiCoords+'}';
	_levelsPlayed++;
	$.ajax({
			url:"leveldata?level="+_currentLevel,
			type:"POST",
			data:userLevelData
	}).done(onLevelDataLoaded);
}
/**
 * ascunde butonul de inapoi
 */
function hideBack2SetupLevelBtn()
{
	var domEl = document.getElementById('back2SetupLevelBtn');
	domEl.style.display = "none";
}
/**
 * ascunde butonul de next
 */
function hideNextLevelBtn()
{
	var domEl = document.getElementById('nextLevelBtn');
	domEl.style.display = "none";
}
/**
 * event handler s-a facut click pe inapoi la conexiuni
 * @param event
 */
function goBack2SetUpLevel(event){
	hideBack2SetupLevelBtn();
	hideNextLevelBtn();
	hideClearAllButton();
	displayNext2ConnectionsButton();
	switch2Setup();
}

/**
 * se creeaza o noua conexiune intre doua UI cuvinte
 * @param sourceWordUI wordUI
 * @param destinationWordUI wordUI
 * @returns un obiect de tip conexiune
 * {
 * 	source:wordUI,
 *  destination:wordUI,
 *  textDeprel:String,
 *  shape:Shape(sageata),
 *  lineTo:Function(Point):void,
 *  cleanUp:Function,
 *  update:Function,
 *  endConnection:Function,
 *  getStartPoint:Function,
 *  setPartePropozitie:Function,
 *  getJSON:Function
 * }
 */
function getNewConnection(sourceWordUI, destinationWordUI)
{
	var connection = {
		source:sourceWordUI,
		destination:destinationWordUI,
		textDeprel:getNewDeprelText(),
		shape:new createjs.Shape(new createjs.Graphics()),
		lineTo:function (point){
			this.shape.graphics.clear();
			var startPoint = this.getStartPoint();
			var lineColor = 0xFF0000;
			this.shape.graphics.setStrokeStyle(5, 1).beginStroke(lineColor).moveTo(startPoint.x, startPoint.y).lineTo(point.x, point.y).endStroke();
			var dx = startPoint.x - point.x;
			var dy = startPoint.y - point.y; 
			var theta = Math.atan2(dx, -dy);
			var p1 = {x:-15, y:-25}; 
			var p2 = {x:0, y:-14};
			var p3 = {x:+15, y:-25};
			var p0 = {x:0, y:8};
			var pointDeprel = {x:0, y:0};
			//transform matrix pentru sageata
			var matrix = new createjs.Matrix2D();
			matrix.rotate(theta);
			matrix.translate(point.x, point.y);
			matrix.transformPoint(p1.x, p1.y, p1);
			matrix.transformPoint(p2.x, p2.y, p2);
			matrix.transformPoint(p3.x, p3.y, p3);
			matrix.transformPoint(p0.x, p0.y, p0);
			//transform matrix pentru eticheta partii de propozitie
			matrix = new createjs.Matrix2D();
			matrix.rotate(theta);
			matrix.translate(startPoint.x - dx/2, startPoint.y - dy/2);
			matrix.transformPoint(0, 0, pointDeprel);
			this.textDeprel.x = pointDeprel.x;
			this.textDeprel.y = pointDeprel.y;
			this.shape.graphics.beginFill(lineColor).moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).lineTo(p2.x ,p2.y).lineTo(p3.x, p3.y).endFill();
		},
		cleanUp:function(){
			this.shape.removeEventListener("click", onConnectionLineClick);
			if(this.shape.parent)
			{
				this.shape.parent.removeChild(this.shape);
			}
			this.shape.graphics.clear();
			if(this.textDeprel.parent)
			{
				this.textDeprel.parent.removeChild(this.textDeprel);
			}
			this.textDeprel = null;
			this.shape = null;
			this.source = null;
			this.destination = null;
			for(var i in this)
			{
				delete(this[i]);
			}
		},
		update:function(){
			this.lineTo(this.getEndPoint());
		},
		endConnection:function(){
			var point = this.getEndPoint();
			this.lineTo(point);
		},
		getStartPoint:function(){
			if(!this.source)
			{
				return null;
			}
			
			var bounds = this.source.getBounds();
			return this.source.localToGlobal(bounds.width/2, bounds.height - BOARD_Y);
		},
		getEndPoint:function(){
			if(!this.destination)
			{
				return null;
			}
			var bounds = this.destination.getBounds();
			return this.destination.localToGlobal(bounds.width/2, -BOARD_Y);
		},
		setPartePropozitie:function(value){
			this.deprel = value;
			this.textDeprel.setText(value);
		},
		toJSON:function()
		{
			if(!this.source||!this.destination)
			{
				return null;
			}
			var json = '{';
			json += '"source":"' + this.source._data.id+'",';
			json += '"destination":"' + this.destination._data.id+'",';
			json += '"deprel":"' + this.deprel + '"';
			json += '}';
			return json;
		}
	};
	connection.textDeprel.connection = connection;
	connection.shape.addEventListener("click", onConnectionLineClick);
	var onDeprelClick = function(event){
		_currentConnection = event.currentTarget.connection;
		displayPartiPropozitieDialog();
	};
	connection.textDeprel.addEventListener("click", onDeprelClick, true);
	return connection;
}
/**
 * event handler, s-a facut click pe conexiunea curenta
 * @param event
 */
function onConnectionLineClick(event){
	if(!_isDrawPaths)
	{
		return;
	}
	_currentConnection = getConnectionByShape(event.target);
	displayDeleteConnectionAlert();
}
/**
 * declanseaza o stegere a conexiunii care este tocmai desenata (s-a apasat anulare)
 */
function deleteCurrentConnection()
{
	for(var i = 0; i < _currentConnections.length; i++)
	{
		if(_currentConnection == _currentConnections[i])
		{
			_currentConnections.splice(i, 1);
			break;
		}
	}
	_currentConnection.cleanUp();
	_currentConnection = null;
	stage.update();
}
/**
 * pentru un shape (sageata) se returneaza conexiunea din care face parte
 * @param shape
 * @returns
 */
function getConnectionByShape(shape)
{
	for(var i = 0; i < _currentConnections.length; i++)
	{
		if(_currentConnections[i].shape == shape)
		{
			return _currentConnections[i];
		}
	}
	return null;
}
/**
 * event handler se face dublu click pe un cuvant
 * @param event
 */
function onBoardWordDoubleClick(event){
	event.preventDefault();
	event.stopImmediatePropagation();
	go2Connections();
}
/**
 * se trece la nivelul urmator
 */
function go2Connections()
{
	removeMoveEventListeners();
	switch2DrawPaths();
	stage.update();
}
/**
 * pentru coordonatele mouse-ului x, y returneaza primul cuvant gasit
 * @param x Number, coordonata x a mouse-ului
 * @param y Number, coordonata y a mouse-ului
 * @returns wordUI UI de cuvant
 */
function getWordUnderPoint(x, y)
{
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		var bounds = wordUI.getBounds();
		if(x >= wordUI.x && x <= wordUI.x + bounds.width && y >= wordUI.y && y <= wordUI.y + bounds.height)
		{
			return wordUI;
		}
	}
	return null;
}
/**
 * event handler, se face release la un UI de cuvant de pe board
 * @param event
 */
function onBoardWordPressUp(event){
	
	_isConnecting = false;
	var wordUI = event.currentTarget;
	event.stopImmediatePropagation();
	var connection = _currentConnection;
	var cancelConnection = function()
	{
		_currentConnection = null;
		connection.cleanUp();
		update = false;
		stage.update();
	};
	if(wordUI != _currentConnection.source)
	{
		cancelConnection();
		return;
	}

	var targetWordUI = getWordUnderPoint(event.stageX, event.stageY - BOARD_Y);
	if(	null == targetWordUI ||
		wordUI == targetWordUI ||
		!targetWordUI.hasOwnProperty('_data')
	  )
	{
		cancelConnection();
		return;
	}
	for(var i = 0; i < _currentConnections.length; i++)
	{
		if(_currentConnections[i].source == _currentConnection.source && _currentConnections[i].destination == targetWordUI)
		{
			cancelConnection();
			return;
		}
	}
	connection.destination = targetWordUI;
	connection.endConnection();
	_currentConnections.push(connection);
	displayPartiPropozitieDialog();
	//_currentConnection = null;
	update = false;
	stage.update();
}
/**
 * se face update la conexiuni
 */
function updateLiveConnections()
{
	for(var i = 0; i < _currentConnections.length; i++)
	{
		var connection = _currentConnections[i];
		connection.update();
		
	}
}
/**
 * event handler s-a apasat peste cuvant
 * @param event
 */
function onBoardWordMouseDown(event){
	update = true;
	var wordUI = event.currentTarget;
	event.stopImmediatePropagation();
	if(_isConnecting)
	{
		//clear current failed connection
		return;
	}
	_isConnecting = true;
	var connection = getNewConnection(wordUI, null);
	board.addChild(connection.shape);
	board.addChild(connection.textDeprel);
	_currentConnection = connection;
}	
/**
 * event handler, se tine apasat si se misca peste un UI de cuvant
 * @param event
 */
function onBoardWordPressMove(event){
	var wordUI = event.currentTarget;
	event.stopImmediatePropagation();
	var connection = _currentConnection;
	if(!connection)
	{
		return;
	}
	
	var point = wordUI.parent.globalToLocal(event.stageX, event.stageY);
	connection.lineTo(point);
	_currentConnection = connection;

}


/**
 * asigura faptul ca avem cuvintele plasate
 * pe nivele discrete pe orizontala
 */
function snapToGrid(wordUI)
{
	var _height = window.innerHeight - 120;
	for(var i = 65; i < _height; i += 60)
	{
		if(wordUI.y > i && wordUI.y < i +35)
		{
			wordUI.y = i;
			var bounds = wordUI.getBounds();
			wordUI.setBounds(wordUI.x, wordUI.y, bounds.width, bounds.height);
			break;
		}
	}
	stage.update();
}

/**
 * pentru un wordObj{
 *	id:int,
 *	text:string,
 *	head:string,
 *	lemma:string,
 *	postag:string,
 *}
 * returneaza un Container
 */
function createWordUI(wordObj)
{
	var container = new createjs.Container();
	container.name = wordObj.text;
	var graphix = new createjs.Graphics();
	var wordUI = new createjs.Shape(graphix);
	container._data = wordObj;
	container.addChild(wordUI);
	var displayText = new createjs.Text(wordObj.text,'24px HammersmithOne','#000000');
	displayText.x = 5;
	displayText.y = (is_firefox?12:6)+0;
	var _compWidth = displayText.getMeasuredWidth()+10;
	if(_compWidth < MIN_WORD_WIDTH)
	{
		var hDiff = MIN_WORD_WIDTH - _compWidth;
		displayText.x += hDiff/2;
		_compWidth = MIN_WORD_WIDTH;
	}
	var _width = _compWidth;
	var _height = displayText.getMeasuredHeight()+20;
	graphix.beginFill('#FF66CC').drawRoundRect(0,0,_width,_height,10).ef();
	wordUI.shadow = new createjs.Shadow("#000000", 0, 0, 10);
	container.addChild(displayText);
	container.setBounds(0, 0, _width, _height);
	container._width = _width;
	container.setShadow = function (value){
		wordUI.shadow = new createjs.Shadow("#000000", 0, 0, value);
	};
	return container;
}
/**
 * Deseneaza si returneaza UI-ul pentru eticheta de Parte de propozitie
 * @returns Container
 */
function getNewDeprelText()
{
	var deprelTextUI = new createjs.Container();
	deprelTextUI.connection = null;
	var text = new createjs.Text('', '12px HammersmithOne', '#FFFFFF');
	text.y = is_firefox?9:3;
	text.x = 5;
	var graphix = new createjs.Graphics();
	var deprelUI = new createjs.Shape(graphix);
	deprelTextUI.addChild(deprelUI);
	deprelTextUI.addChild(text);
	
	deprelTextUI.setText = function(value){
		text.text = value;
		graphix.clear();
		if(!value){
			return;
		}
		var _width = text.getMeasuredWidth()+10;
		var _height = text.getMeasuredHeight()+15;
		graphix.beginFill('#333333').drawRoundRect(0,0,_width,_height,5).ef();
	};
	
	return deprelTextUI;
}
/**
 * returneaza true daca toate cuvintele sunt conectate
 * @returns {Boolean}
 */
function haveAllConnectedWords()
{
	if(!boardDroppedWords || boardDroppedWords.length != currentProcessedSentence.length)
	{
		return false;
	}
	var isWordConnected = function(wordUI)
	{
		for(var i = 0; i < _currentConnections.length; i++)
		{
			if(wordUI == _currentConnections[i].source || wordUI == _currentConnections[i].destination)
			{
				return true;
			}
		}
		return false;
	};
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		if(!isWordConnected(boardDroppedWords[i]))
		{
			return false;
		}
	}
	return true;
}
/**
 * deseneaza background
 */
function drawTree()
{
	treeBg =  new createjs.Bitmap(null);
	stage.addChild(treeBg);
	treeBg.x = window.innerWidth/2 - 525;
	var img = new Image();
	//img.src = "assets/images/header_flash_extra_small.png";
	img.src = "assets/images/tree.png";
	img.onload = function (e) {
		treeBg.image = (e.target);
	    stage.update();
	};
}
var oldNick;
var	oldSchool; 
function openMyProfile()
{
	oldNick = $("#nicknameTextInput").val();
	oldSchool = $("#schoolTextInput").val();
	$("#startGame").hide();
	$("#gameContainer").hide();
	$("#clasamentContainer").hide();
	$("#myProfieContainer").show();
	$("#sentenceText").text("Profilul meu");
}
/**
 * pentru debug
 */
function trace()
{
	if(!console || !console.log)
	{
		return;
	}
	for(var i = 0; i < arguments.length; i++)
	{
		console.log(arguments[i]);
	}
}