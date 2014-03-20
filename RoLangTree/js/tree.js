function drawTree()
{
	var bmp =  new createjs.Bitmap(null);
	stage.addChild(bmp);
	var img = new Image();
	img.src = "assets/images/header_flash_extra_small.png";
	img.onload = function (e) {
    	bmp.image = (e.target);
	    stage.update();
	}
}