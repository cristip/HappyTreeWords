package ro.infoiasi.english.view
{
	import flash.text.TextLineMetrics;
	
	import mx.events.FlexEvent;
	
	import ro.infoiasi.english.model.WordVO;

	public class WordPiece extends WordPieceBase
	{
		public static const SPACER:int = 10;
		
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
		
		public var wordValue:WordVO;
		
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
				callLater(function():void{
				var lineMetrics:TextLineMetrics = wordLabel.measureText(wordLabel.text);
				wordLabel.width = lineMetrics.width + 5;
				wordLabel.height = lineMetrics.height;
				this.width = lineMetrics.width +8;
				this.height = lineMetrics.height +2;
				});
			}
		}
		
	}
}