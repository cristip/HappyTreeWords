  //se ia propozita
  //se face arborele ca lista inlantuita (simplu, dupa atributul head)
  //se prezinta propozita ca un grup de cuvinte in ordinea lor in propozitie.
  //utlizatorul plaseaza cuvintele pe board si  le uneste
  //cand e gata, apasa butonul si valideaza
  //pentru tutorial, alege cate un cuvant si acesta este plasat automat unde trebuie
  //legaturile sunt facute de la sine si primeste punctaj maxim (din partea casei)


var BOARD_HEIGHT = 600;
var BOARD_WIDTH = 1050;
var BOARD_Y = 50;
var MIN_WORD_WIDTH = 70;
var PARTE_VORBIRE_NESETAT = "?";
var _currentConnections = [];
var _currentConnection = null;
var _levelsPlayed = 0;
var _currentWordUI = null;
/**
 * related to the connection action
 * is connection while the mouse is pressed 
 */
var _isConnecting = false;
//related to the application state
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
 * starts a new game
 */
function newGame()
{
	$("#startGame").hide();
	$('#gameCanvas').show();
	$('#helpBtn').show();
	
	stage = new createjs.Stage("gameCanvas");
	createjs.Touch.enable(stage);
  	board = new createjs.Container();
  	board.y = BOARD_Y;
  	drawTree();
  	stage.addChild(board);
  	loadData(_currentLevel);
  	createjs.Ticker.addEventListener("tick", tick);
  	
  	$("#cancelPartiProp").click(function()
	{
		_currentWordUI.setParteVorbire(PARTE_VORBIRE_NESETAT);
		$("#partiProp").hide();
		$(".modalDialog").hide();
	});

}

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

function displayFirstHelpTip()
{
	$('.modalDialog').show();
	$('#firstHelpTip').show();
	$('#firstHelpTip').click(function(){
		$('.modalDialog').hide();
		$('#firstHelpTip').hide();
	});
}
function displaySecondHelpTip()
{
	$('.modalDialog').show();
	$('#secondHelpTip').show();
	$('#secondHelpTip').click(function(){
		$('.modalDialog').hide();
		$('#secondHelpTip').hide();
	});
}
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
function displaySameLevel()
{
	$('.modalDialog').show();
	$('#samelevelDialog').show();
	$('#samelevelDialog').click(function(){
		$('.modalDialog').hide();
		$('#samelevelDialog').hide();
	});
}

function tick(event){
    if(update){
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
function displaySolvedSentence(solvedSentence)
{
	//TODO: show the correct tree
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
	for(var i = 0; i < currentProcessedSentence.length; i++)
	{
		var word = createWordUI(currentProcessedSentence[i]);
		word.addEventListener('mousedown', onWordMouseDown, true);
		word.addEventListener('pressmove', onWordPressMove, true);
		word.addEventListener('pressup', onWordPressUp, true);
		word.x = lastx;
		word.y = 10;
		var bounds = word.getBounds();
		lastx = lastx+bounds.width+15;
		stage.addChild(word);
	}
	boardDroppedWords = [];
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
	var wordUI = event.currentTarget;
	wordUI.removeEventListener('click', onWordUIClick, true);
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
	wordUI.addEventListener('click', onWordUIClick, true);
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
		wordUI.addEventListener('click', onWordUIClick, true);
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



function onWordUIClick(event)
{
	
	var elipseWords = function(strContainerId, raza1, raza2){
		var setParteVorbireClick = function(evt){
			event.currentTarget.setParteVorbire(this.lastChild.nodeValue);
			$("#partiProp").hide();
			$(".modalDialog").hide();
		};
		var radios = document.getElementById(strContainerId);
		var pas = 2 * Math.PI/radios.children.length;
		for(var i = 0, j = 0; i < radios.children.length; i++, j+=pas)
		{
			//radios.children[i].style.left = (225 + raza1 * Math.cos(j) - radios.children[i].offsetWidth/2)+"px";
			radios.children[i].style.left = (243 + raza1 * Math.cos(j) - 30)+"px";
			radios.children[i].style.top = (122 + raza2 * Math.sin(j))+"px";
			radios.children[i].style.width = "60px";
			radios.children[i].onclick = setParteVorbireClick;
		}
	};

	var wordUI = event.currentTarget;
	_currentWordUI = wordUI;
	
	elipseWords("radios", 230, 120);
	//elipseWords("radios_inner", 150, 80);
	$("#partiPropWord").text(event.currentTarget._data.text);
	;
	
	$(".modalDialog").show();
	$("#partiProp").show();
}

function removeWordMoveEventListeners(wordUI)
{
	wordUI.removeEventListener('pressup', onWordPressUp, true);
	wordUI.removeEventListener('mousedown', onWordMouseDown, true);
	wordUI.removeEventListener('pressmove', onWordPressMove, true);
}
function removeMoveEventListeners()
{
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		removeWordMoveEventListeners(wordUI);
	}
}
function addWordDoubleClickEventListener(wordUI)
{
	wordUI.addEventListener('dblclick', onBoardWordDoubleClick, true);
}
function addDoubleClickEventListeners()
{
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		addWordDoubleClickEventListener(wordUI);
	}
}
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
	}
}


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

function displayNextLevelButton()
{
	if(!_isDrawPaths || !haveAllParteVorbire())
	{
		hideNextLevelBtn();
		return;
	}
	var domEl = document.getElementById('nextLevelBtn');
	domEl.style.display = "inline-block";
	domEl.onclick = goToNextLevel;
}
function hideClearAllButton()
{
	$("#deleteAllConnectionsBtn").hide();
}
function displayClearAllButton()
{
	$("#deleteAllConnectionsBtn").show();
	$("#deleteAllConnectionsBtn").click(function(){
		while(_currentConnections.length>0)
		{
			var conn = _currentConnections.pop();
			conn.cleanUp();
		}
		_currentConnection = null;
		stage.update();
	});
}
function displayBack2SetupButton()
{
	var domEl = document.getElementById('back2SetupLevelBtn');
	domEl.style.display = "inline-block";
	domEl.onclick = goBack2SetUpLevel;
}
function displayNext2ConnectionsButton()
{
	var domEl = document.getElementById('next2ConnectionsBtn');
	domEl.style.display = "inline-block";
	domEl.onclick = go2Connections;
}
function hideNext2ConnectionsButton()
{
	domEl = document.getElementById('next2ConnectionsBtn');
	domEl.style.display = "none";
}
function goToNextLevel(event){
	var userLevelData = '{"connections":[';
	for(var i = 0; i < _currentConnections.length; i++)
	{
		if(i > 0)
		{
			userLevelData += ',';
		}
		userLevelData += _currentConnections[i].toJSON();
	}
	userLevelData += ']}';
	_levelsPlayed++;
	$.ajax({
			url:"leveldata?level="+_currentLevel,
			type:"POST",
			data:userLevelData
	}).done(onLevelDataLoaded);
}

function hideBack2SetupLevelBtn()
{
	var domEl = document.getElementById('back2SetupLevelBtn');
	domEl.style.display = "none";
}
function hideNextLevelBtn()
{
	var domEl = document.getElementById('nextLevelBtn');
	domEl.style.display = "none";
}

function goBack2SetUpLevel(event){
	hideBack2SetupLevelBtn();
	hideNextLevelBtn();
	hideClearAllButton();
	displayNext2ConnectionsButton();
	switch2Setup();
}


function getNewConnection(sourceWordUI, destinationWordUI)
{
	var connection = {
		source:sourceWordUI,
		destination:destinationWordUI,
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
			var matrix = new createjs.Matrix2D();
			matrix.rotate(theta);
			matrix.translate(point.x, point.y);
			matrix.transformPoint(p1.x, p1.y, p1);
			matrix.transformPoint(p2.x, p2.y, p2);
			matrix.transformPoint(p3.x, p3.y, p3);
			matrix.transformPoint(p0.x, p0.y, p0);
			this.shape.graphics.beginFill(lineColor).moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).lineTo(p2.x ,p2.y).lineTo(p3.x, p3.y).endFill();
		},
		cleanUp:function(){
			this.shape.removeEventListener("click", onConnectionLineClick);
			if(this.shape.parent)
			{
				this.shape.parent.removeChild(this.shape);
			}
			this.shape.graphics.clear();
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
		toJSON:function()
		{
			if(!this.source||!this.destination)
			{
				return;
			}
			var json = '{';
			json += '"source":"' + this.source._data.id+'",';
			json += '"destination":"' + this.destination._data.id+'"';
			json += '}';
			return json;
		}
	};
	connection.shape.addEventListener("click", onConnectionLineClick);
	return connection;
}
function onConnectionLineClick(event){
	if(!_isDrawPaths)
	{
		return;
	}
	_currentConnection = getConnectionByShape(event.target);
	displayDeleteConnectionAlert();
}
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
function onBoardWordDoubleClick(event){
	event.preventDefault();
	event.stopImmediatePropagation();
	go2Connections();
}
function go2Connections()
{
	removeMoveEventListeners();
	switch2DrawPaths();
}
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
	_currentConnection = null;
	update = false;
	stage.update();
}

function updateLiveConnections()
{
	for(var i = 0; i < _currentConnections.length; i++)
	{
		var connection = _currentConnections[i];
		connection.update();
		
	}
}

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
	_currentConnection = connection;
}	

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
 *
 *
 */
function snapToGrid(wordUI)
{
	for(var i = 65; i < BOARD_HEIGHT; i += 60)
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
 *	deprel:string,
 *	parent:word,
 *	kids:word[],
 *  isPunctuation:bool
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
	var parteVorbireText = new createjs.Text('', '16px HammersmithOne', '#FFFFFF');
	parteVorbireText.y = is_firefox?12:6;
	var displayText = new createjs.Text(wordObj.text,'24px HammersmithOne','#000000');
	displayText.x = 5;
	displayText.y = (is_firefox?12:6)+20;
	var _compWidth = displayText.getMeasuredWidth()+10;
	if(_compWidth < MIN_WORD_WIDTH)
	{
		var hDiff = MIN_WORD_WIDTH - _compWidth;
		displayText.x += hDiff/2;
		_compWidth = MIN_WORD_WIDTH;
	}
	container.addChild(parteVorbireText);
	//container.parteVorbireText = parteVorbireText;
	var _width = _compWidth;
	var _height = displayText.getMeasuredHeight()+40;
	graphix.beginFill('#FF66CC').drawRoundRect(0,0,_width,_height,10).ef();
	wordUI.shadow = new createjs.Shadow("#000000", 0, 0, 10);
	container.addChild(displayText);
	container.setBounds(0, 0, _width, _height);
	container._width = _width;
	container.setShadow = function (value){
		wordUI.shadow = new createjs.Shadow("#000000", 0, 0, value);
	};
	container.hasParteVorbire = function(){
		return parteVorbireText.text != PARTE_VORBIRE_NESETAT;
	};
	container.getParteVorbire = function(){
		return parteVorbireText.text;
	};
	container.setParteVorbire = function(parteVorbireStr){
		//container.dispatchEvent("parte_vorbire");
		parteVorbireText.text = parteVorbireStr;
		var pvWidth = parteVorbireText.getMeasuredWidth();
		parteVorbireText.x = this._width/2 - pvWidth/2;
		stage.update();
		displayNextLevelButton();
	};
	container.setParteVorbire(PARTE_VORBIRE_NESETAT);
	return container;
}
function haveAllParteVorbire()
{
	if(!boardDroppedWords || boardDroppedWords.length != currentProcessedSentence.length)
	{
		return;
	}
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		if(!boardDroppedWords[i].hasParteVorbire())
		{
			return false;
		}
	}
	return true;
}
function drawTree()
{
	var bmp =  new createjs.Bitmap(null);
	stage.addChild(bmp);
	var img = new Image();
	img.src = "assets/images/header_flash_extra_small.png";
	img.onload = function (e) {
    	bmp.image = (e.target);
	    stage.update();
	};
}

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