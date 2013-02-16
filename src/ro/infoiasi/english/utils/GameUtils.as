package ro.infoiasi.english.utils
{
	
	import flash.geom.Point;
	
	import mx.core.IFlexDisplayObject;
	import mx.core.IVisualElement;
	
	import ro.infoiasi.english.model.WordVO;

	public class GameUtils
	{
		public static function createPhrase(phraseIndex:int, xData:XML, words:Vector.<WordVO>):WordVO
		{
			var selectedElement:XML = xData.children()[phraseIndex];
			var rootNode:WordVO;
			
			var xWords:XMLList = selectedElement.word;
			var maxLevel:int;
			var i:int = 0;
			var num_of_words:int = xWords.length();
			
			
			for(i = 0; i < num_of_words; i++)
			{
				var word:WordVO = WordVO.fromXML(xWords[i]);
				if(word.head == 0)
				{
					rootNode = word;
				}
				words.push(word);
			}
			for(i = 0; i < words.length; i++)
			{
				for(var j:int = 0; j < words.length; j++)
				{
					if(words[j].id == words[i].head)
					{
						words[j].children.push(words[i]);
						words[i].parent = words[j];
						break;
					}
				}
				
			}
			
			return rootNode;
		}
		public static function translateCoords(targetPlace:IVisualElement, droppedPiece:IVisualElement, dropTargets:IFlexDisplayObject, dragTargets:IFlexDisplayObject):void
		{
			var point:Point = new Point(targetPlace.x, targetPlace.y);
			var gPoint:Point = dropTargets.localToGlobal(point);
			var lPoint:Point = dragTargets.globalToLocal(gPoint);
			droppedPiece.x = lPoint.x;
			droppedPiece.y = lPoint.y;
		}
	}
}