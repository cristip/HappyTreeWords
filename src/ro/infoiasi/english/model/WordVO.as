package ro.infoiasi.english.model
{
	import ro.infoiasi.english.view.WordPiece;
	[Bindable]
	public class WordVO
	{
		//<word id="3" form="să" lemma="să" postag="Qs" head="5" chunk="" deprel="part."/>
		//<word id="1" form="Caii" lemma="cal" postag="Ncmpry" head="2" chunk="" deprel="sbj."/>
		public function WordVO()
		{
		}
		
		public static function fromXML(value:XML):WordVO
		{
			var word:WordVO = new WordVO();
			word.id = parseInt(value.@id);
			word.head = parseInt(value.@head);
			word.form = value.@form;
			word.deprel = value.@deprel;
			word.posttag = value.@posttag;
			return word;
		}
		
		public var id:int;
		public var head:int;
		public var form:String;
		public var posttag:String;
		public var deprel:String;
		public var ui:WordPiece;
		public var level:int;
		public var parent:WordVO;
		public var children:Vector.<WordVO> = new Vector.<WordVO>();
	}
}