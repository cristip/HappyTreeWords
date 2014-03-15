//se ia propozita
  //se face arborele ca lista inlantuita (simplu, dupa atributul head)
  //se prezinta propozita ca un grup de cuvinte in ordinea lor in propozitie.
  //utlizatorul plaseaza cuvintele pe board si  le uneste
  //cand e gata, apasa butonul si valideaza
  //pentru tutorial, alege cate un cuvant si acesta este plasat automat unde trebuie
  //legaturile sunt facute de la sine si primeste punctaj maxim (din partea casei)

var _currentLevel = 0;
var currentProcessedSentence;
var word = {
	text:"Caii",
	head:2
};

function initLevel()
{
	loadData(_currentLevel)
}
function loadData(level)
{
	var strData = levels[level];
	var xmlData = $.parseXML(strData);
	var $xml = $(xmlData);
	var words = $xml.find('word');
	currentProcessedSentence = [];
	for(var i = 0; i < words.length; i++)
	{
		currentProcessedSentence.push({
			id:parseInt(parseWord(words[i], 'id')),
			text:parseWord(words[i], 'form'),
			head:parseInt(parseWord(words[i], 'head')),
			lemma:parseWord(words[i], 'lemma'),
			postag:parseWord(words[i], 'postag'),
			dprel:parseWord(words[i], 'dprel'),
			parent:null,
			kids:[]
		});
	}
	for(var i = 0; i < currentProcessedSentence.length; i++)
	{
		updateParentKid(currentProcessedSentence[i]);
	}
	displayInitialSentence();
}

function updateParentKid(word)
{
	if(!word.head)
	{
		return;
	}
	word.parent = currentProcessedSentence[word.head];
	word.parent.kids.push(word);
}

function parseWord(wordXML, attributeName)
{
   var wordAttr = wordXML.attributes[attributeName];
   if(wordAttr)
   {
   	return wordAttr.value;
   }
   return null;
}

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
	stage.update();
}
function onWordMouseDown(event)
{
	var wordUI = event.currentTarget;
	wordUI.parent.setChildIndex(wordUI, wordUI.parent.getNumChildren()-1)
	wordUI._currentLocalX = event.localX;
	wordUI._currentLocalY = event.localY;
	wordUI.initialPosition = {x:wordUI.x, y:wordUI.y};

}
function onWordPressMove(event)
{
	update = true;
	var wordUI = event.currentTarget;
	wordUI.x = event.stageX - wordUI._currentLocalX;
	wordUI.y = event.stageY - wordUI._currentLocalY;
}
function onWordPressUp(event)
{
   //update = false;
   var wordUI = event.currentTarget;
   createjs.Tween.get(wordUI).to({x:wordUI.initialPosition.x,y:wordUI.initialPosition.y}, 300);
}

function createWordUI(wordObj)
{
	var container = new createjs.Container();
	var graphix = new createjs.Graphics();
	var wordUI = new createjs.Shape(graphix);
	container._data = wordObj;
	container.addChild(wordUI);

	var displayText = new createjs.Text(wordObj.text,'32px AveriaSansLibre','#000000');
	displayText.x = 5;
	displayText.y = 0;
	graphix.beginFill('#FFFFFF').drawRoundRect(0,0,displayText.getMeasuredWidth()+10,displayText.getMeasuredHeight()+10,10).ef();
	wordUI.shadow = new createjs.Shadow("#000000", 0, 0, 10);
	container.addChild(displayText);
	return container;
}