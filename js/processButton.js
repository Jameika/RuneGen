Button = Class.extend({
	init: function(x,y, width, height, label){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.label = label;
		this.mouseOver = false;
		this.pressCallback = function(){console.log("Hello World!");};
		console.log("New Button!");
	},
	
	setPressCallback : function(func){
		this.pressCallback = func;
	},
	
	checkMouseOver : function(mx, my){
		this.mouseOver = ((mx >= this.x) && (mx <= this.x + this.width) && (my >= this.y) && (my <= this.y + this.height));
	},
	
	onpress : function(){
		if(this.mouseOver)
		{
			this.pressCallback();
		}
	},
	
	draw : function(prosObj){
		if (this.mouseOver)
		{
			//Draw Highlighted
    		prosObj.fill(255,255,255);
    		prosObj.stroke(0,0,0);
			prosObj.rect(this.x, this.y, this.width, this.height);
		}
		else
		{
			//Draw Normal
    		prosObj.fill(255,0,0);
    		prosObj.stroke(0,0,255);
			prosObj.rect(this.x, this.y, this.width, this.height);
		}
		prosObj.fill(0,0,0);
		prosObj.text(this.label, this.x + (this.width/4), this.y + this.height - 5);
	}
});

console.log("BUTTON!");
