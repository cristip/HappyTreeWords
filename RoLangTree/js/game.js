  //se ia propozita
  //se face arborele ca lista inlantuita (simplu, dupa atributul head)
  //se prezinta propozita ca un grup de cuvinte in ordinea lor in propozitie.
  //utlizatorul plaseaza cuvintele pe board si  le uneste
  //cand e gata, apasa butonul si valideaza
  //pentru tutorial, alege cate un cuvant si acesta este plasat automat unde trebuie
  //legaturile sunt facute de la sine si primeste punctaj maxim (din partea casei)

/** integ nivelul curent, incepand cu 0 pentru primul nivel */
var _currentLevel = 0;
var BOARD_HEIGHT = 600;
var BOARD_WIDTH = 1050;
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
	stage = new createjs.Stage("gameCanvas");
  	board = new createjs.Container();
  	board.y = 50;
  	stage.addChild(board);
  	initLevel();
  	createjs.Ticker.addEventListener("tick", tick);

}

function initLevel()
{
	clearBoard();
	loadData(_currentLevel)
}
/**
 * pregateste board pentru un nou arbore,
 * este curatat arborele vechi si aplicat gridul
 */
function clearBoard()
{
	board.removeAllChildren ();
	var gridGraphics = new createjs.Graphics();
	var boardGrid = new createjs.Shape(gridGraphics);
	for(var i = 5; i < BOARD_HEIGHT; i+=30)
	{
		gridGraphics.beginStroke("#4EB0FF").moveTo(0, i).lineTo(BOARD_WIDTH, i).endStroke();
	}
	gridGraphics.beginStroke("#FF86C9").moveTo(30, 0).lineTo(30, BOARD_HEIGHT).endStroke();
	board.addChild(boardGrid);


	drawTree();
	//var bitmap = new createjs.Bitmap('assets/images/tree.png');

	//board.addChild(bitmap);


	stage.update();

}
/**
 * incarca datele pentru nivelul curent
 * @param int level, incepant cu 0 pentru primul nivel 
 */
function loadData(level)
{
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
	$("#sentenceText").text(strSentence)
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
		var word = createWordUI(currentProcessedSentence[i])
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
	wordUI.parent.setChildIndex(wordUI, wordUI.parent.getNumChildren()-1)
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

	//wordUI.removeEventListener('pressup', onWordPressUp, true);
	//wordUI.removeEventListener('mousedown', onWordMouseDown, true);
	//wordUI.removeEventListener('pressmove', onWordPressMove, true);
	
	//wordUI.addEventListener('doubleclick', onBoardWordDoubleClick, true);
	//wordUI.addEventListener('pressup', onBoardWordPressUp, true);
	//wordUI.addEventListener('mousedown', onBoardWordMouseDown, true);
	//wordUI.addEventListener('pressmove', onBoardWordPressMove, true);

	if(wordUI.parent == stage)
	{
		stage.removeChild(wordUI);
		wordUI.y -= 50;
		board.addChild(wordUI);
		decorateDroppedWord(wordUI)
	}
	
	snapToGrid(wordUI);
	
	boardDroppedWords.push(wordUI);
	if(boardDroppedWords.length == currentProcessedSentence.length)
	{
		displayStartConnectionsButton();
	}
  
}

function onBoardWordDoubleClick(event){

}
function onBoardWordPressUp(event){
	var fromWord = event.target;


}

function onBoardWordMouseDown(event){
	
}

function onBoardWordPressMove(event){
	
}


/**
 *
 *
 */
function snapToGrid(wordUI)
{
	for(var i = 65; i < BOARD_HEIGHT; i += 30)
	{
		if(wordUI.y > i && wordUI.y < i +35)
		{
			wordUI.y = i;
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
	var graphix = new createjs.Graphics();
	var wordUI = new createjs.Shape(graphix);
	container._data = wordObj;
	container.addChild(wordUI);

	var displayText = new createjs.Text(wordObj.text,'32px HammersmithOne','#FFFFFF');
	displayText.x = 5;
	displayText.y = is_firefox?6:0;
	graphix.beginStroke("#FFFFFF").beginFill('#267F2D').drawRoundRect(0,0,displayText.getMeasuredWidth()+10,displayText.getMeasuredHeight()+10,10).ef();
	wordUI.shadow = new createjs.Shadow("#000000", 0, 0, 5);
	container.addChild(displayText);
	return container;
}
function decorateDroppedWord(wordContainer)
{
	var graphics = new createjs.Graphics();
	var shapeOut = new createjs.Shape(graphics);
	var shapeIn = new createjs.Shape(graphics);
	graphics.f("#FF66CC").p("AhEg7ICJAAIhFB3g");
	var bounds = wordContainer.getBounds();
	shapeOut.setTransform(bounds.width/2+5, bounds.height+14);
	shapeIn.setTransform(bounds.width/2+5, 0);
	shapeIn.enableMouseOver = true;
	shapeIn.addEventListener('rollover', onInMouseOver)
	if(wordContainer._data.isPunctuation)
	{
		wordContainer.addChild(shapeIn);
	}else
	{
		wordContainer.addChild(shapeIn, shapeOut);
	}
	
}
function onInMouseOver(event)
{
	console.log('mouse over...' + event)
}
function onInPressUp(event)
{
	console.log(event);
}