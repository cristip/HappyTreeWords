package ro.infoiasi.english.view
{
	import flash.text.TextLineMetrics;
	
	import mx.events.FlexEvent;
	
	import ro.infoiasi.english.model.WordVO;

	public class WordPiece extends WordPieceBase
	{
		public static const SPACER:int = 10;
		public var wordValue:WordVO;
		
		public function WordPiece()
		{
			addEventListener(FlexEvent.CREATION_COMPLETE, onCreationComplete)
		}
		
		protected function onCreationComplete(event:FlexEvent):void
		{
			// TODO Auto-generated method stub
			if(text)
			{
				updateSize();
			}
		}
		override public function set isBlank(value:Boolean):void
		{
			super.isBlank = value;
			updateSize();
		}
		
		override public function set text(value:String):void
		{
			super.text = value;
			updateSize();
		}
		
		protected function updateSize():void
		{
			
			if(wordLabel)
			{
				wordLabel.validateNow();
				callLater(function():void
				{
					var lineMetrics:TextLineMetrics = wordLabel.measureText(wordLabel.text);
					wordLabel.width = isBlank?0: lineMetrics.width + 5;
					wordLabel.height = lineMetrics.height;
					this.width = isBlank? Math.max(60, lineMetrics.width +8) : lineMetrics.width +8;
					this.height = lineMetrics.height +2;
				});
			}
			validateNow();
		}
		
	}
}