function drawTree()
{
	var img = new Image();
	img.src = "assets/images/tree.png";
	img.onload = function (e) {
    var bmp = new createjs.Bitmap(e.target);
    board.addChild(bmp);
    stage.update();
}
}