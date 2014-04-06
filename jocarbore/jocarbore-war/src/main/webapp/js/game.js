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
var _currentConnections = [];
var _currentConnection = null;
var _isConnecting = false;
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
	$('#dprelBtn').show();
	stage = new createjs.Stage("gameCanvas");
	createjs.Touch.enable(stage);
  	board = new createjs.Container();
  	board.y = BOARD_Y;
  	drawTree();
  	stage.addChild(board);
  	initLevel();
  	createjs.Ticker.addEventListener("tick", tick);

}

function initLevel()
{
	clearBoard();
	loadData(_currentLevel);
	if(_currentLevel == 0)
	{
		setTimeout(displayFirstHelpTip, 500);
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
	//TODO: load data from ajax service
	
	
	var strData = levels[level];
	var xmlData = $.parseXML(strData);
	var $xml = $(xmlData);
	var words = $xml.find('word');
	currentProcessedSentence = [];
	var sentence = [];
	for(var i = 0; i < words.length; i++)
	{   
		var deprel = parseWord(words[i], 'deprel');
		currentProcessedSentence.push({
			id:parseInt(parseWord(words[i], 'id')),
			text:parseWord(words[i], 'form'),
			head:parseInt(parseWord(words[i], 'head')),
			lemma:parseWord(words[i], 'lemma'),
			postag:parseWord(words[i], 'postag'),
			dprel:deprel,
			parent:null,
			kids:[],
			isPunctuation:(deprel == "punct.")
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
	var point = wordUI.parent.globalToLocal(event.stageX, event.stageY);
	wordUI.x = point.x - wordUI._currentLocalX;
	wordUI.y = point.y - wordUI._currentLocalY;
}
/**
 * event handler, s-a eliberat mouse-ul
 */
function onWordPressUp(event)
{
	var wordUI = event.currentTarget;
	if(wordUI.y < 80)
	{
			 createjs.Tween.get(wordUI).to({x:wordUI.initialPosition.x,y:wordUI.initialPosition.y}, 300).call(function(){
			 	//update = false;
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
	displayNextLevelButton();
	for(var i = 0; i < boardDroppedWords.length; i++)
	{
		var wordUI = boardDroppedWords[i];
		wordUI.addEventListener('pressup', onBoardWordPressUp, true);
		wordUI.addEventListener('mousedown', onBoardWordMouseDown, true);
		wordUI.addEventListener('pressmove', onBoardWordPressMove, true);
	}
}
function displayStartConnectionsButton()
{
	if(_currentLevel == 0)
	{
		setTimeout(displaySecondHelpTip, 500);
	}

	

	_currentConnections = [];

	addDoubleClickEventListeners();
	

}

function displayNextLevelButton()
{
	var domEl = document.getElementById('nextLevelBtn');
	
	var nextBtn = new createjs.DOMElement(domEl);
	stage.addChild(nextBtn);
	domEl.style.visibility = "hidden";
	domEl.style.display = "inline-block";
	//nextBtn.x = BOARD_WIDTH/2 - 30;
	nextBtn.y = 150;
	nextBtn.x = -530;
	createjs.Tween.get(nextBtn).to({x:-130}, 500);

}

function getNewConnection(sourceWordUI, destinationWordUI)
{
	var connection = {
		source:sourceWordUI,
		destination:destinationWordUI,
		shape:null,
		lineTo:function (point){
			this.shape.graphics.clear();
			var startPoint = this.getStartPoint();
			this.shape.graphics.setStrokeStyle(3, 1).beginStroke(0xFF0000).moveTo(startPoint.x, startPoint.y).lineTo(point.x, point.y).endStroke();
		},
		cleanUp:function(){
			this.shape.parent.removeChild(this.shape);
			this.shape.graphics.clear();
			this.shape = null;
			this.source = null;
			this.destination = null;
			for(var i in this)
			{
				delete(this[i]);
			}
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
		}
	};
	var graphic = new createjs.Graphics();
	connection.shape = new createjs.Shape(graphic);
	return connection;
}

function onBoardWordDoubleClick(event){
	event.preventDefault();
	event.stopImmediatePropagation();
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
	console.log("mouse up " + wordUI);
	var connection = _currentConnection;
	if(wordUI != _currentConnection.source)
	{
		console.log("initiator gresit...");
		_currentConnection = null;
		connection.cleanUp();
		return;
	}

	var targetWordUI = getWordUnderPoint(event.stageX, event.stageY - BOARD_Y);
	if(	null == targetWordUI ||
		wordUI == targetWordUI ||
		!targetWordUI.hasOwnProperty('_data')
	  )
	{
		console.log("nu s-a dat drumul peste un obiect...");
		_currentConnection = null;
		connection.cleanUp();
		return;
	}
	connection.destination = targetWordUI;
	connection.endConnection();
	_currentConnections.push(connection);
	_currentConnection = null;
	
}

function onBoardWordMouseDown(event){
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
}

/**
 * pentru un wordObj{
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
	displayText.y = is_firefox?12:6;
	var _width = displayText.getMeasuredWidth()+10;
	var _height = displayText.getMeasuredHeight()+20;
	graphix.beginFill('#FF66CC').drawRoundRect(0,0,_width,_height,10).ef();
	wordUI.shadow = new createjs.Shadow("#000000", 0, 0, 5);
	container.addChild(displayText);
	container.setBounds(0, 0, _width, _height);
	return container;
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