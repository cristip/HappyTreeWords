function drawTree()
{
	var bmp =  new createjs.Bitmap(null);
	stage.addChild(bmp);
	var img = new Image();
	img.src = "assets/images/bg_small.png";
	img.onload = function (e) {
    	bmp.image = (e.target);
	    stage.update();
	}
}