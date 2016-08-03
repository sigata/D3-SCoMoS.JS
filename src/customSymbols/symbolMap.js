/** Contains symbol path functions for various paths required in e skin **/
/** private symbols */
var customSymbolTypes = d3.map({
	  /**
	   * SIMPLECHEMICAL : returns the circle of passed dimension
	   */
	  'SIMPLECHEMICAL': function(shapeObj) {
		  //size = shapeObj.iHeight||shapeObj.iWidth;
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;

		  var topMiddle = {x:iWidth/2 ,y: 0},
		  	bottomMiddle = {x: iWidth/2,y: iHeight},
		  	xRadius = iWidth/2,
		  	yRadius = iHeight/2;
		  return "M" + topMiddle.x + " " +topMiddle.y
		  		+ "A " + xRadius + " "+ yRadius + " 0 0 0 "+bottomMiddle.x +" "+bottomMiddle.y
		  		+ "A " + xRadius + " "+ yRadius + " 0 0 0 "+topMiddle.x +" "+topMiddle.y
		  ;
	  },
	  /** GENERICPROTEIN : returns rounded rectangle **/
	  'GENERICPROTEIN': function(shapeObj) {
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  return shapeUtil.getRoundedRect(iHeight, iWidth);
	  },
	  /** GENE : returns rectangle of given dimensions **/
	  'GENE' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  return "M0 0"
				+ "h" + iWidth
				+ "v" + iHeight
				+ "h" + -iWidth
				+ "z";
	  },
	/** RNA : returns rombus **/
	  'RNA' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;

		  // Tilting edges factor 20% of the width.
		  //var shapeOffest = iWidth*shapeConstants.SPECIES_SHAPE_OFFSET;
		  var shapeOffest = iWidth*0.2;
		  var leftTop = {x: shapeOffest,y: 0},
		  	midTop = {x: iWidth/2,y: shapeOffest},
		  	rightTop = {x: iWidth,y: 0},
		  	rightBottom = {x: iWidth-shapeOffest ,y: iHeight},
		  	leftBottom = {x:0 ,y: iHeight};

		  return "M"+ leftTop.x + " "+leftTop.y
				+ "L" + rightTop.x + " "+rightTop.y
				+ "L" + rightTop.x + " "+rightTop.y
				+ "L" + rightBottom.x + " "+rightBottom.y
				+ "L" + leftBottom.x + " "+leftBottom.y
				+ "L" + leftBottom.x + " "+leftBottom.y
				+ "Z";
		  },
	 /** Receptor : returns Receptor shape **/
	  'RECEPTOR' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  // Tilting edges factor 20% of the width.
		  //var shapeOffest = iWidth*shapeConstants.SPECIES_SHAPE_OFFSET;
		  var shapeOffest = iWidth*0.2;
		  var leftTop = {x: 0,y: 0},
		  	midTop = {x: iWidth/2,y: shapeOffest},
		  	rightTop = {x: iWidth,y: 0},
		  	rightBottom = {x: iWidth ,y: iHeight-shapeOffest},
		  	midBottom = {x: iWidth/2 ,y: iHeight},
		  	leftBottom = {x:0 ,y: iHeight-shapeOffest};

		  return "M"+ leftTop.x + " "+leftTop.y
				+ "L" + midTop.x + " "+midTop.y
				+ "L" + rightTop.x + " "+rightTop.y
				+ "L" + rightBottom.x + " "+rightBottom.y
				+ "L" + midBottom.x + " "+midBottom.y
				+ "L" + leftBottom.x + " "+leftBottom.y
				+ "Z";
		  },
	  /** PHENOTYPE : returns PHENOTYPE shape ( a hexagon) **/
	  'PHENOTYPE' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  // Tilting edges factor 20% of the width.
		  //var shapeOffest = iWidth*shapeConstants.SPECIES_SHAPE_OFFSET;
		  var shapeOffest = iWidth*0.2;
		  var leftMid = {x: 0,y: iHeight/2},
		  	leftTop = {x: shapeOffest,y: 0},
		  	rightTop = {x: iWidth - shapeOffest,y: 0},
		  	rightMid = {x: iWidth ,y: iHeight / 2},
		  	rightBottom = {x: iWidth - shapeOffest ,y: iHeight},
		  	leftBottom = {x:shapeOffest ,y: iHeight};

		  return "M"+ leftMid.x + " "+leftMid.y
				+ "L" + leftTop.x + " "+leftTop.y
				+ "L" + rightTop.x + " "+rightTop.y
				+ "L" + rightMid.x + " "+rightMid.y
				+ "L" + rightBottom.x + " "+rightBottom.y
				+ "L" + leftBottom.x + " "+leftBottom.y
				+ "Z";
	  	},
	  'PERTURBINGAGENT' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  // Tilting edges factor 20% of the width.
		  //var shapeOffest = iWidth*shapeConstants.SPECIES_SHAPE_OFFSET;
		  var shapeOffest = iWidth*0.2;
		  var leftTop = {x: 0,y: 0},
		  	leftMid = {x: shapeOffest,y: iHeight/2},
		  	leftBottom = {x: 0,y:iHeight},
		  	rightBottom = {x: iWidth,y: iHeight},
		  	rightMid = {x: iWidth-shapeOffest,y:iHeight/2 },
		  	rightTop = {x: iWidth,y: 0};

		  return "M"+ leftTop.x + " "+leftTop.y
				+ "L" + leftMid.x + " "+leftMid.y
				+ "L" + leftBottom.x + " "+leftBottom.y
				+ "L" + rightBottom.x + " "+rightBottom.y
				+ "L" + rightMid.x + " "+rightMid.y
				+ "L" + rightTop.x + " "+rightTop.y
				+ "Z";
	  	},
	  'SOURCEORSINK' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  // Tilting edges factor 20% of the width.
		  //var shapeOffest = iWidth*shapeConstants.SPECIES_SHAPE_OFFSET;

		  var rightTop = {x: iWidth,y: 0},
		  	  leftBottom = {x: 0,y: iHeight};

		  return getSymbol('SimpleChemical', shapeObj)
				+ " M" + rightTop.x + " "+rightTop.y
				+ "L" + leftBottom.x + " "+leftBottom.y
				;
	  },
	  'LIGAND' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;

		  return "M0 0"
				+ "L" + iWidth + " 0"
				+ "L" + iWidth/2 + " "+iWidth
				+ "Z";
		  },
	  'TRANSCRIPTIONFACTOR' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  var hFactor = 2.5;

		  var lCenter = {x: iWidth / 4,y: iHeight / hFactor},
		  	  rCenter = {x: 3 * iWidth / 4 ,y: iHeight/hFactor};
		  var iRadius = iWidth / 4;

//		  return d3scomos.shapeUtil.getEllipse(lCenter.x,lCenter.y,iRadius,Math.ceil(iHeight / hFactor))
//		  		+ d3scomos.shapeUtil.getEllipse(rCenter.x,rCenter.y,iRadius,Math.ceil(iHeight / hFactor));

		  return d3scomos.shapeUtil.getEllipse(iHeight,iWidth/2,0,0)
	  		+ d3scomos.shapeUtil.getEllipse(iHeight,iWidth/2,iWidth/2,0);
	   	},
	   'ENZYME' : function(shapeObj){
			  var iHeight = shapeObj.iHeight - shapeObj.iHeight * 0.4;
			  var iWidth = shapeObj.iWidth;

			  var leftTop = {x: 0,y: 0},
			  	rightTop = {x: iWidth,y: 0},
			  	rightBottom = {x:iWidth,y: iHeight},
			  	leftBottom = {x: 0,y: iHeight},
			    arcCenter ={x: iWidth/2,y: iHeight};

			  return "M"+ leftTop.x + " "+leftTop.y
				  	+ "L" + rightTop.x + " "+rightTop.y
				  	+ "L" + rightBottom.x + " "+rightBottom.y
				  	+ "A " + iWidth/2 + " "+ iHeight/2 + " 0 0 1 "+leftBottom.x +" "+leftBottom.y
				  	+ "Z";
		   },
	   	'COMPLEX' : function(shapeObj){
	   		var iHeight = shapeObj.iHeight;
			var iWidth = shapeObj.iWidth;
			//GENERIC_PROTIEN_RECT_ROUNDNESS_FACTOR
			var radius = d3.min([iHeight,iWidth])*0.2;
			return shapeUtil.getRoundedRect(iHeight,iWidth);
		   },
	   'REACTION' : function(shapeObj){
		   	/** current imple does not respect passed dimensions **/
			  //var iHeight = shapeObj.iHeight;
			  //var iWidth = shapeObj.iWidth;
			  var iHeight = 20; //
			  var topMiddle = {x: iHeight/2,y: 0},
			  	rightMiddle = {x: iHeight,y: iHeight/2},
			  	bottomMiddle = {x: iHeight/2, y:iHeight},
			  	leftMiddle = {x: 0, y:iHeight/2};

			  return "M"+ topMiddle.x + " "+topMiddle.y
			  	+ "L" + rightMiddle.x + " "+rightMiddle.y
			  	+ "L" + bottomMiddle.x + " "+bottomMiddle.y
			  	+ "L" + leftMiddle.x + " "+leftMiddle.y
			  	+ "Z";
		  }
	  /* new shape template
	  'shape' : function(shapeObj){
		  var iHeight = shapeObj.iHeight;
		  var iWidth = shapeObj.iWidth;
		  // Tilting edges factor 20% of the width.
		  //var shapeOffest = iWidth*shapeConstants.SPECIES_SHAPE_OFFSET;
		  var shapeOffest = iWidth*0.2;
		  var leftMid = {x: 0,y: 0},
		  	leftTop = {x: 0,y: 0},
		  	rightTop = {x: 0,y: 0},
		  	rightMid = {x: 0,y: 0},
		  	rightBottom = {x: 0,y: 0},
		  	leftBottom = {x: 0,y: 0};

		  return
	  }*/
	});
