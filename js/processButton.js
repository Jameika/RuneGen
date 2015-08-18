Button = Class.extend({
	init: function(x,y, width, height, label){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.label = label;
		this.mouseOver = false;
		this.pressCallback = function(){};
	},
	
	setPressCallback : function(func){
		this.pressCallback = func;
	},
	
	checkMouseOver : function(mx, my){
		this.mouseOver = (mx >= this.x & mx <= this.x + this.width & my >= this.y & my <= this.height);
	},
	
	onpress : function(){
		if(this.mouseOver)
		{
			this.pressCallback();
		}
	},
	
	draw : function(){
		
	}
});

console.log("BUTTON!");
