package ro.infoiasi.english.view
{
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.text.TextLineMetrics;
	
	import mx.events.FlexEvent;

	public class WordPiece extends WordPieceBase
	{
		public static const SPACER:int = 10;
		
		public var head:WordPiece;
		public var tails:Vector.<WordPiece> = new Vector.<WordPiece>();
		
		public function WordPiece()
		{
			addEventListener(FlexEvent.INITIALIZE, onInitialize)
			
		}
		protected function onInitialize(event:FlexEvent):void
		{
			outConnector.addEventListener(MouseEvent.MOUSE_DOWN, outConnector_clickHandler);
		}
		protected function outConnector_clickHandler(event:MouseEvent):void
		{
			dispatchEvent(new Event("connect_out"));
		}
		
	}
}