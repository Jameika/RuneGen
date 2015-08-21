var ShapeCount = 7;
var sigilRows = 5;
var sigilCols = 3;
var sigilArray = [];
var PI = Math.PI;
var iterCount = 0;

designMotif = {
	enforceVerticalSymmetry : true,
	enforceHorizontalSymmetry : true,
	symmetryWeighting : 1.0,
	forceUniqueDraws : true,
	single : false,
	drawGrid : true,
	minStroke : 2,
	maxStroke : 4,
	useCurves : true,
	//drawWeights : [1,5,5,5,1,1,0],
	drawWeights : [1,1,1,1,1,1,1,1,1,1,1],
	scaleFactor : function(){ return 1/(Math.random() + 1); }
};

Point = Class.extend({
	init: function(x,y, scaleFactor){
		this.x = x;
		this.y = y;
		this.scaleFactor = scaleFactor;
	},
});

function initRuneSet(p, sigilRows, sigilCols)
{
	for (var i = 0; i < sigilRows; i++)
	{
		for (var j = 0; j < sigilCols; j++)
		{
			console.log("NEW RUNE");
			var sigil = new Rune(p, new Point(75 + 150*i,75 + 150*j,0), designMotif);
			sigil.generateRune();
			sigilArray.push(sigil);
		}
	}
};

function regenRunes()
{
	for (var i = 0; i < sigilArray.length; i++)
	{
		sigilArray[i].clearRune();
		sigilArray[i].generateRune();
	}
};

function sketchProc(processing) {
	//Initialize all objects here
	processing.size(150*sigilRows + 150,150*sigilCols);
	
	reDraw = true;
	font = processing.loadFont("FFScala.ttf");
	processing.textFont(font); 
	var button = new Button(770,25,75,25, "Refresh", 17);
	var button2 = new Button(770,55,75,25, "Toggle Grid", 7);
	
	if (designMotif.single)
		initRuneSet(processing, 1, 1);
	else
		initRuneSet(processing, sigilRows, sigilCols);
	
	processing.mousePressed = function(){
		if (button.mouseOver)
		{
			regenRunes();
			reDraw = true;
		}
		if (button2.mouseOver)
		{
			designMotif.drawGrid = !designMotif.drawGrid;
			console.log("Grid Toggle!");
			reDraw = true;
		}
	};
	
	processing.draw = function() { 

    	// erase background
    	// update the state
    	if (reDraw)
    	{
    		processing.background(224);
    		processing.fill(255,0,0,0);
    		processing.stroke(0,0,255);
    		if (designMotif.drawGrid)
    		{
    			for (var i = 0; i < sigilRows; i++)
				{
					processing.line(75 + 150*i,0,75 + 150*i,150*sigilCols);
				}
				for (var j = 0; j < sigilCols; j++)
				{
					processing.line(0,75 + 150*j,150*sigilRows,75 + 150*j);
				}
    		}
    		
			processing.stroke(255,0,0);
			if (designMotif.single)
				sigilArray[0].drawRune();
			else		
				for (var i = 0; i < sigilArray.length; i++)
				{
					sigilArray[i].drawRune();
				}
			
    		reDraw = false;
    	}
    	// draw the screen
    	// draw the menu
    	processing.fill(224,224,224);
    	processing.stroke(224,224,224);
    	processing.rect(150*sigilRows,0,150,150*sigilCols);
    	button.checkMouseOver(processing.mouseX, processing.mouseY);
    	button.draw(this);
    	button2.checkMouseOver(processing.mouseX, processing.mouseY);
    	button2.draw(this);
	};
}

var canvas = document.getElementById("canvas1");
var processing = new Processing(canvas, sketchProc);