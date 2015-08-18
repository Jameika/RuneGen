var ShapeCount = 7;
var sigilRows = 5;
var sigilCols = 3;
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
	drawWeights : [1,1,1,1,1,1,1],
	scaleFactor : function(){ return 1/(Math.random() + 1); }
};

Point = Class.extend({
	init: function(x,y, scaleFactor){
		this.x = x;
		this.y = y;
		this.scaleFactor = scaleFactor;
	},
});

function getChoice(blocked)
{
	//Uses the parameters in the design motif to roll
	//We assume that the weights are integers, because ¯\_(ツ)_/¯ 
	var weights = designMotif.drawWeights;
	if (blocked)
	{
		for (var i = 0; i < blocked.length; i++)
		{
			weights[blocked[i]] = 0;
		}
	}
	
	if (!designMotif.useCurves)
	{
		weights[3] = 0;
		weights[4] = 0;
		weights[5] = 0;
	}
	var totalWeight = weights.reduce(function(previousValue, currentValue, index, array) {
		return previousValue + currentValue;
	}, 0);
	var randomSelection = Math.floor(Math.random() * totalWeight);
	var outChoice = -1;
	while (randomSelection >= 0)
	{
		outChoice++;
		randomSelection -= weights[outChoice];
	}
	return outChoice;
}

Rune = Class.extend({
	init: function(p, startPoint){
		this.startPoint = startPoint;
		this.choiceList = [];
		this.p = p;
	},
	
	addSegment : function(choiceNum, scale, idx)
	{
		//idx can be either an int or an array of two ints
		//Needs to match up with
		this.choiceList.push({
			choice : choiceNum,
			pointIndex : idx,
			scale : scale,
		});
	},
	
	mutateSegement : function(choiceNum, scale, idx)
	{
		while(this.isDuplicate(targetPoint, choice, scale))
		{
			var mTarget = Math.floor(3*Math.random());
			switch(mTarget)
			{
				case 0:
					//change targetPoint
					if (choice == 0)
					{
						targetPoint[Math.floor(Math.random()*2)] = Math.floor(Math.random() * pointSet.length);
					}
					else
					{
						targetPoint = Math.floor(Math.random() * pointSet.length);
					}
					break;
				case 1:
					//change choice - either grabbing a new target Point or dropping one
					var oldChoice = choice;
					choice = getChoice();
					if (oldChoice != choice && oldChoice == 0)
					{
						targetPoint = targetPoint[Math.floor(Math.random()*2)];
					}
					else if (oldChoice != choice && choice == 0)
					{
						targetPoint = [targetPoint, Math.floor(Math.random() * pointSet.length)];
					}
					break;
				case 2:
					//change scale
					scale = 25 * designMotif.scaleFactor();
					break;
			}
		}
		return {
			choice : choiceNum,
			pointIndex : idx,
			scale : scale,
		};
	},
	
	enforceSymmetry : function(pointSet, target, choice)
	{
		if (designMotif.enforceHorizontalSymmetry)
		{
			//console.log("X SYMMETRY!!!");
			var secondaryPoint = target;
			if (choice.choice == 0)
			{
				for (var i = 0; i < secondaryPoint.length; i++)
				{
					secondaryPoint[i].x = 2 * this.startPoint.x - secondaryPoint[i].x;
				}
			}
			else
			{
				secondaryPoint.x = 2 * this.startPoint.x - secondaryPoint.x;
			}
			this.drawShape(this.p, pointSet, secondaryPoint, choice.choice, choice.scale);
		}
		if (designMotif.enforceVerticalSymmetry)
		{
			//console.log("Y SYMMETRY!!!");
			var secondaryPoint = target;
			var c = choice.choice;
			if (choice.choice == 0)
			{
				for (var i = 0; i < secondaryPoint.length; i++)
				{
					secondaryPoint[i].y = 2 * this.startPoint.y - secondaryPoint[i].y;
				}
			}
			else
			{
				secondaryPoint.y = 2 * this.startPoint.y - secondaryPoint.y;
			}
			if (choice.choice == 4) c = 5;
			if (choice.choice == 5) c = 4;
			this.drawShape(this.p, pointSet, secondaryPoint, c, choice.scale);
		}
		if (designMotif.enforceHorizontalSymmetry && designMotif.enforceVerticalSymmetry)
		{
			//console.log("X AND Y SYMMETRY!!!");
			var secondaryPoint = target;
			var c = choice.choice;
			if (choice.choice == 0)
			{
				for (var i = 0; i < secondaryPoint.length; i++)
				{
					secondaryPoint[i].x = 2 * this.startPoint.x - secondaryPoint[i].x;
				}
			}
			else
			{
				secondaryPoint.x = 2 * this.startPoint.x - secondaryPoint.x;
			}
			if (choice.choice == 4) c = 5;
			if (choice.choice == 5) c = 4;
			this.drawShape(this.p, pointSet, secondaryPoint, c, choice.scale);
		}
	},
	
	getFirstStoke : function(pointSet){
		var choice = {
			choice : getChoice([0]),
			pointIndex : 0,
			scale : 25,
		};		
		this.drawShape(this.p, pointSet, this.startPoint, choice.choice, 25);
		this.choiceList.push(choice);
		this.enforceSymmetry(pointSet, this.startPoint, choice);
		return pointSet;
	},
	
	getNewStroke : function(pointSet){
		var choice = {choice : getChoice()};
		var target = {};
		//Need to test for duplication
		if (choice.choice == 0)
		{
			choice.scale = 25;
			choice.targetPoint = [Math.floor(Math.random() * pointSet.length), Math.floor(Math.random() * pointSet.length)];
			target = [pointSet[choice.targetPoint[0]], pointSet[choice.targetPoint[1]]];
		}
		else
		{
			choice.scale = 25 * designMotif.scaleFactor();
			choice.targetPoint = Math.floor(Math.random() * pointSet.length);
			target = pointSet[choice.targetPoint];
		}

		this.drawShape(this.p, pointSet, target, choice.choice, choice.scale);
		this.addSegment(choice);
		this.enforceSymmetry(pointSet, target, choice);
		return pointSet;
	},
	
	generateRandomRune: function(){
		var pointSet = [this.startPoint];
		var strokeCount = designMotif.minStroke + Math.floor(Math.random() * (designMotif.maxStroke - designMotif.minStroke));
		//First Stroke is seperate
		pointSet = this.getFirstStoke(pointSet);
		for (var i = 0; i < strokeCount; i++)
		{
			pointSet = this.getNewStroke(pointSet);
		}
	},
	
	isDuplicate: function(targetPoint, choice, scale){
		for (var i = 0; i < this.choices.length; i++)
		{
			if (targetPoint == this.pointIndex[i] && this.choices[i] == choice && Math.abs(this.scale[i]/scale) < 1.33 && Math.abs(this.scale[i]/scale) > .60 )
				return true;
		}
		return false;
	},
	
	regenerateRune: function(p){
		var pointSet = [this.startPoint];
		for (var i = 0; i < this.choices.length; i++)
		{
			if (pointIndex[i] < pointSet.length)
				this.drawShape(p, this.pointSet, this.pointIndex[i], this.choices[i], this.scale[i]);
		}
	},
	
	drawShape : function(p, pointSet, target, sClass, scale)
	{
		var scaleFactor = 0;
		switch(sClass)
		{
			case 0:
				x0 = target[0].x;
				y0 = target[0].y;
				x1 = target[1].x;
				y1 = target[1].y;
				p.line(x0,y0,x1,y1);
				break;
			case 1:
				//Vert Line, 5 points
				x = target.x;
				y = target.y;
				pointSet.push(new Point(x,y-scale,scaleFactor + 1));
				pointSet.push(new Point(x,y+scale,scaleFactor + 1));
				pointSet.push(new Point(x,y-(scale/2),scaleFactor + 1));
				pointSet.push(new Point(x,y+(scale/2),scaleFactor + 1));
				p.line(x,y-scale,x,y+scale);
				break;
			case 2:
				//Hori Line, 5 points
				x = target.x;
				y = target.y;
				pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				pointSet.push(new Point(x-(scale/2),y,scaleFactor + 1));
				pointSet.push(new Point(x+(scale/2),y,scaleFactor + 1));
				p.line(x-scale,y,x+scale,y);
				break;
			case 3:
				//Circle
				x = target.x;
				y = target.y;
				pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				pointSet.push(new Point(x,y-scale,scaleFactor + 1));
				pointSet.push(new Point(x,y+scale,scaleFactor + 1));
				p.ellipse(x,y,2*scale,2*scale);
				break;
			case 4:
				//Upper semi Circle
				x = target.x;
				y = target.y;
				pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				pointSet.push(new Point(x,y-scale,scaleFactor + 1));
				p.arc(x,y,2*scale,2*scale, PI, 2*PI);
				break;
			case 5:
				//Lower semi Circle
				x = target.x;
				y = target.y;
				pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				pointSet.push(new Point(x,y+scale,scaleFactor + 1));
				p.arc(x,y,2*scale,2*scale, 0, PI);
				break;
			case 6:
				//Dot
				x = target.x;
				y = target.y;
    			p.fill(255,0,0);
				p.ellipse(x,y,5,5);
    			p.fill(255,0,0,0);
		}
	}
});

function drawNewRune(p, centerX, centerY)
{
	var sigil = new Rune(p, new Point(centerX, centerY, 0));
	sigil.generateRandomRune();
};

function sketchProc(processing) {
	//Initialize all objects here
	processing.size(150*sigilRows + 150,150*sigilCols);
	
	reDraw = true;
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
				drawNewRune(processing, 75, 75);
			else
			{
				for (var i = 0; i < sigilRows; i++)
				{
					for (var j = 0; j < sigilCols; j++)
					{
						console.log("NEW RUNE");
						drawNewRune(processing,75 + 150*i,75 + 150*j);
					}
				}
			}
			
    		reDraw = false;
    	}
    	// draw the screen
	};
	
	/* List of Objects:
	 * General Line
	 * Vertical Line
	 * Horizontal Line
	 * Circle
	 * Upper semi-circle
	 * Lower semi-circle
	 * Dot
	 */
}

var canvas = document.getElementById("canvas1");
var processing = new Processing(canvas, sketchProc);