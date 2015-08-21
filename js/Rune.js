Rune = Class.extend({
	init: function(p, startPoint, designMotif){
		this.startPoint = startPoint;
		this.choiceList = [];
		this.p = p;
		this.pointSet = [this.startPoint];
		this.designMotif = designMotif;
	},
	
	clearRune : function()
	{
		this.choiceList = [];
		this.pointSet = [this.startPoint];
	},
	
	getChoice : function(blocked)
	{
		//Uses the parameters in the design motif to roll
		//We assume that the weights are integers, because ¯\_(ツ)_/¯ 
		var weights = this.designMotif.drawWeights;
		if (blocked)
		{
			for (var i = 0; i < blocked.length; i++)
			{
				weights[blocked[i]] = 0;
			}
		}
		
		if (!this.designMotif.useCurves)
		{
			weights[7] = 0;
			weights[8] = 0;
			weights[9] = 0;
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
	},
	
	generateRune : function()
	{
		var strokeCount = designMotif.minStroke + Math.floor(Math.random() * (designMotif.maxStroke - designMotif.minStroke));
		//First Stroke is seperate
		this.generateFirstStoke();
		for (var i = 0; i < strokeCount; i++)
		{
			this.generateSegment();
		}
	},
	
	generateFirstStoke : function()
	{
		var choice = {
			choice : this.getChoice([0]),
			pointIndex : 0,
			scale : 25,
		};
		this.choiceList.push(choice);
		this.updatePointSet(this.startPoint, choice);
		this.enforceSymmetry(this.startPoint, choice);
	},
	
	generateSegment : function()
	{
		var choice = {choice : this.getChoice()};
		var target = {};
		//Need to test for duplication
		if (choice.choice == 0)
		{
			choice.scale = 25;
			choice.pointIndex = [Math.floor(Math.random() * this.pointSet.length), Math.floor(Math.random() * this.pointSet.length)];
			target = [this.pointSet[choice.pointIndex[0]], this.pointSet[choice.pointIndex[1]]];
		}
		else
		{
			choice.scale = 25 * designMotif.scaleFactor();
			choice.pointIndex = Math.floor(Math.random() * this.pointSet.length);
			target = this.pointSet[choice.pointIndex];
		}
		
		this.choiceList.push(choice);
		this.updatePointSet(target, choice);
		this.enforceSymmetry(target, choice);
	},
	
	enforceSymmetry : function(target, choice)
	{
		if (designMotif.enforceHorizontalSymmetry)
		{
			//console.log("X SYMMETRY!!!");
			var secondaryPoint = new Point(target.x, target.y, 1);
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
			if (choice.choice == 3) c = 4;
			if (choice.choice == 4) c = 3;
			if (choice.choice == 5) c = 6;
			if (choice.choice == 6) c = 5;
			console.log(secondaryPoint);
			var choice2 = {
				choice : c,
				pointIndex : this.pointSet.length,
				scale : choice.scale,
				note : "X-Reflection"
			};
			this.pointSet.push(secondaryPoint);
			this.choiceList.push(choice2);
			this.updatePointSet(secondaryPoint, choice2);
		}
		if (designMotif.enforceVerticalSymmetry)
		{
			//console.log("Y SYMMETRY!!!");
			var secondaryPoint = new Point(target.x, target.y, 1);
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
			if (choice.choice == 3) c = 5;
			if (choice.choice == 4) c = 6;
			if (choice.choice == 5) c = 3;
			if (choice.choice == 6) c = 4;
			if (choice.choice == 8) c = 9;
			if (choice.choice == 9) c = 8;
			var choice2 = {
				choice : c,
				pointIndex : this.pointSet.length,
				scale : choice.scale,
				note : "Y-Reflection"
			};
			this.pointSet.push(secondaryPoint);
			this.choiceList.push(choice2);
			this.updatePointSet(target, choice2);
		}
		if (designMotif.enforceHorizontalSymmetry && designMotif.enforceVerticalSymmetry)
		{
			//console.log("X AND Y SYMMETRY!!!");
			var secondaryPoint = new Point(target.x, target.y, 1);
			var c = choice.choice;
			if (choice.choice == 0)
			{
				for (var i = 0; i < secondaryPoint.length; i++)
				{
					secondaryPoint[i].x = 2 * this.startPoint.x - secondaryPoint[i].x;
					secondaryPoint[i].y = 2 * this.startPoint.y - secondaryPoint[i].y;
				}
			}
			else
			{
				secondaryPoint.x = 2 * this.startPoint.x - secondaryPoint.x;
				secondaryPoint.y = 2 * this.startPoint.y - secondaryPoint.y;
			}
			if (choice.choice == 3) c = 6;
			if (choice.choice == 4) c = 5;
			if (choice.choice == 5) c = 4;
			if (choice.choice == 6) c = 3;
			if (choice.choice == 8) c = 9;
			if (choice.choice == 9) c = 8;
			var choice2 = {
				choice : c,
				pointIndex : this.pointSet.length,
				scale : choice.scale,
				note : "XY-Reflection"
			};
			this.pointSet.push(secondaryPoint);
			this.choiceList.push(choice2);
			this.updatePointSet(target, choice2);
		}
	},
	
	updatePointSet: function(target, choice)
	{
		scale = choice.scale;
		scaleFactor = 0;
		switch(choice.choice)
		{
			case 0:
				//No New Points
				break;
			case 1:
				//Vert Line, 5 points
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x,y-scale,scaleFactor + 1));
				this.pointSet.push(new Point(x,y+scale,scaleFactor + 1));
				this.pointSet.push(new Point(x,y-(scale/2),scaleFactor + 1));
				this.pointSet.push(new Point(x,y+(scale/2),scaleFactor + 1));
				break;
			case 2:
				//Hori Line, 5 points
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x-(scale/2),y,scaleFactor + 1));
				this.pointSet.push(new Point(x+(scale/2),y,scaleFactor + 1));
				break;
			case 3:
				//DiagUL
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x-scale,y-scale,scaleFactor + 1));
				break;
			case 4:
				//DiagUR
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x+scale,y-scale,scaleFactor + 1));
				break;
			case 5:
				//DiagDL
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x-scale,y+scale,scaleFactor + 1));
				break;
			case 6:
				//DiagDR
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x+scale,y+scale,scaleFactor + 1));
				break;
			case 7:
				//Circle
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x,y-scale,scaleFactor + 1));
				this.pointSet.push(new Point(x,y+scale,scaleFactor + 1));
				break;
			case 8:
				//Upper semi Circle
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x,y-scale,scaleFactor + 1));
				break;
			case 9:
				//Lower semi Circle
				x = target.x;
				y = target.y;
				this.pointSet.push(new Point(x-scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x+scale,y,scaleFactor + 1));
				this.pointSet.push(new Point(x,y+scale,scaleFactor + 1));
				break;
			case 10:
				//Dot
				break;
		}
	},
	
	drawRune : function()
	{
		console.log("Draw me!");
		console.log(this);
		for (var i = 0; i < this.choiceList.length; i++)
		{
			console.log(i);
			this.drawShape(this.p, this.pointSet, this.choiceList[i].pointIndex, this.choiceList[i].choice, this.choiceList[i].scale);
		}
	},
	
	drawShape : function(p, pointSet, pointIndex, sClass, scale)
	{
		var scaleFactor = 0;
		
		switch(sClass)
		{
			case 0:
				target = [pointSet[pointIndex[0]], pointSet[pointIndex[1]]];
				x0 = target[0].x;
				y0 = target[0].y;
				x1 = target[1].x;
				y1 = target[1].y;
				p.line(x0,y0,x1,y1);
				break;
			case 1:
				//Vert Line, 5 points
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.line(x,y-scale,x,y+scale);
				break;
			case 2:
				//Hori Line, 5 points
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.line(x-scale,y,x+scale,y);
				break;
			case 3:
				//DiagUL
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.line(x,y,x-scale,y-scale);
				break;
			case 4:
				//DiagUR
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.line(x,y,x+scale,y-scale);
				break;
			case 5:
				//DiagDL
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.line(x,y,x-scale,y+scale);
				break;
			case 6:
				//DiagDR
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.line(x,y,x+scale,y+scale);
				break;
			case 7:
				//Circle
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.ellipse(x,y,2*scale,2*scale);
				break;
			case 8:
				//Upper semi Circle
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.arc(x,y,2*scale,2*scale, PI, 2*PI);
				break;
			case 9:
				//Lower semi Circle
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
				p.arc(x,y,2*scale,2*scale, 0, PI);
				break;
			case 10:
				//Dot
				target = pointSet[pointIndex];
				x = target.x;
				y = target.y;
    			p.fill(255,0,0);
				p.ellipse(x,y,5,5);
    			p.fill(255,0,0,0);
		}
	},
	
	isDuplicate: function(targetPoint, choice, scale){
		for (var i = 0; i < this.choices.length; i++)
		{
			if (targetPoint == this.pointIndex[i] && this.choices[i] == choice && Math.abs(this.scale[i]/scale) < 1.33 && Math.abs(this.scale[i]/scale) > .60 )
				return true;
		}
		return false;
	}
});