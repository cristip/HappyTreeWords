package ro.infoiasi.english.utils
{
	
	import flash.geom.Point;
	
	import mx.collections.ArrayCollection;
	import mx.core.IFlexDisplayObject;
	import mx.core.IVisualElement;
	
	import ro.infoiasi.english.model.WordVO;

	public class GameUtils
	{
		/**
		 * creeaza 
		 */
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
		
		
		
		public static function computeSentenceLevels(structure:WordVO, levels:ArrayCollection):void
		{
			var temp_buffer:Array = [];
			function setUpLevels(structure:WordVO, level:int):void
			{
				structure.level = level;
				if(!temp_buffer[level])
				{
					temp_buffer[level] = [structure];
					levels.addItem(temp_buffer[level]);
				}else
				{
					temp_buffer[level].push(structure);
					
				}
				for(var i:int = 0; i < structure.children.length; i++)
				{
					setUpLevels(structure.children[i], level+1);
				}
			}
			setUpLevels(structure, 0);
			
		}
		
	}
}