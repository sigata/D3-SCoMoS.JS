/**
 * Shape helper : an Utility module with reusable shapes and helper methods
 */


var shapeUtil = d3scomos.shapeUtil = {};

/** draws the ellipse/circle
 * @param {Number} height of ellipse
 * @param {Number} width of ellipse
 * @param {Number} topLeftY y of top-left corner of bounding rectangle of ellipse
 * @returns {String}  a svg path describing ellipse assuming (topLeftX, topLeftY) to be the starting point of bounding rectangle
 **/
shapeUtil .getEllipse = function(height, width, topLeftX, topLeftY){
	//init defaults
	topLeftX = topLeftX || 0;
	topLeftY = topLeftY || 0;

	//	var cx = topLeftX + width/2;
	//	var cy = topLeftY + height/2;
	var rx = width/2;
	var ry = height/2;

	var topMiddle 		= {x: topLeftX + width/2, y: topLeftY},
  		bottomMiddle 	= {x: topLeftX + width/2, y: topLeftY + height};
	return "M" + topMiddle.x + " " +topMiddle.y
  		+ "A " + rx + " "+ ry + " 0 0 0 "+bottomMiddle.x +" "+bottomMiddle.y
  		+ "A " + rx + " "+ ry + " 0 0 0 "+topMiddle.x +" "+topMiddle.y;
}

/** draws the ellipse/circle
 * @param {Number} cx center x val
 * @param {Number} cy center y val
 * @param {Number} rx r radius
 * @param {Number} ry y radius
 * @returns {String}  a svg path describing ellipse assuming (0,0) to be the starting point of bounding rectangle
 **/
//shapeUtil .getEllipse = function(rx,ry,cx,cy){
//	var topMiddle = {x:cx , y: 0},
//  	bottomMiddle = {x: cx, y: 2 * cy };
//	return "M" + topMiddle.x + " " +topMiddle.y
//  		+ "A " + rx + " "+ ry + " 0 0 0 "+bottomMiddle.x +" "+bottomMiddle.y
//  		+ "A " + rx + " "+ ry + " 0 0 0 "+topMiddle.x +" "+topMiddle.y
//}

/**
 * draws rounded rectangle
 * @param {Number} height of target rectangle
 * @param {Number} width of target rectangle
 * @param {Number} topLeftX optional startX coordinate
 * @param {Number} topLeftY optional startY coordinate
 * @returns {String}  a svg path describing rounded rect
 */
shapeUtil .getRoundedRect = function(height,width,topLeftX,topLeftY) {
    //init defaults
    topLeftX = topLeftX || 0;
    topLeftY = topLeftY || 0;
	var radius = d3.min([height,width])*shapeConstants.GENERIC_PROTIEN_RECT_ROUNDNESS_FACTOR;
    return rounded_rect(topLeftX,topLeftY,width,height,radius,1,1,1,1);
}
/**
 * creates rounded_rect
 * @param  {Number} x  start co -ord for rect
 * @param  {Number} y  Start y co-ord for rect
 * @param  {Number} w  width of rect
 * @param  {Number} h  height of rect
 * @param  {Number} r  radius of round rect.
 * @param  {optional } tl is top left rounded.
 * @param  {optional} tr is top right rounded.
 * @param  {optional} bl is bottom left rouned.
 * @param  {optional} br is bottom right rouned.
 * @return {String}    path that renders rouned rect.
 */
function rounded_rect(x, y, w, h, r, tl, tr, bl, br) {
    var retval;
    retval  = "M" + (x + r) + "," + y;
    retval += "h" + (w - 2*r);
    if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
    else { retval += "h" + r; retval += "v" + r; }
    retval += "v" + (h - 2*r);
    if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
    else { retval += "v" + r; retval += "h" + -r; }
    retval += "h" + (2*r - w);
    if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
    else { retval += "h" + -r; retval += "v" + -r; }
    retval += "v" + (2*r - h);
    if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
    else { retval += "v" + -r; retval += "h" + r; }
    retval += "z";
    return retval;
}
/**
 * draws rounded rectangle with thickness
 * @param {Number} height of target rectangle
 * @param {Number} width of target rectangle
 * @param {Number} thickness pixel value for shape thickness
 * @returns {String}  a svg path describing rounded rect
 */
shapeUtil .getRoundedRectWithTickness = function(height,width,thickness) {
	  var innerX = thickness;
	  var innerY = thickness;
	  var innerH = height-2*thickness;
	  var innerW = width-2*thickness;
	  return this.getRoundedRect(height, width)+" "+this.getRoundedRect(innerH, innerW, innerX, innerY);

}

/**
 * draws ellipse with thickness
 * @param {Number} height of target ellipse
 * @param {Number} width of target ellipse
 * @param {Number} thickness pixel value for shape thickness
 * @returns {String}  a svg path describing ellipse
 */
shapeUtil .getEllipseWithTickness = function(height,width,thickness) {
	  var innerX = thickness;
	  var innerY = thickness;
	  var innerH = height-2*thickness;
	  var innerW = width-2*thickness;
	  return this.getEllipse(height, width)+" "+this.getEllipse(innerH, innerW, innerX, innerY);

}

/**
 *TODO: refactor
 * this is the dummy implementation for demonstration purposes
 * this does not seem right place for this code
 */
shapeUtil.resolveShape=function(shapeNo)
{
	var TenSpeciesTypes = {
			  'SIMPLECHEMICAL' : 0,
			  'GENERICPROTEIN' : 1,
			  'GENE' : 2,
			  'RNA' : 3,
			  'RECEPTOR' : 4,
			  'PHENOTYPE' : 5,
			  'PERTURBINGAGENT' : 6,
			  'SOURCEORSINK' : 7,
			  'LIGAND' : 8,
			  'TRANSCRIPTIONFACTOR' : 9,
			  'ENZYME' : 10,
			  'COMPLEX' : 11,
			  'INVALIDSPECIESTYPE' : 12
			};
	var keys = [];
	for(var k in TenSpeciesTypes) keys.push(k);
	return keys[shapeNo];
}

/**
 * generalization of hitTest to detect if one rectangle(shape) is inside the other
 * checks if shapeTarget is inside the shapeSource
 * @param {object} shapeSource standard scomos shape object as source container
 * @param {object} shapeTarget standard scomos shape object to be tested
 * @returns {Boolean} true if inside otherWise false
 */
shapeUtil.hitTest = function hitTest(shapeSource,shapeTarget){
	//check if start of shape is inside the containder
	if( (shapeSource.position.iX < shapeTarget.position.iX)
			&& (shapeSource.position.iY < shapeTarget.position.iY)
			&& ((shapeSource.position.iX + shapeSource.iWidth) > (shapeTarget.position.iX + shapeTarget.iWidth) )
			&& ((shapeSource.position.iY + shapeSource.iHeight) > (shapeTarget.position.iY + shapeTarget.iHeight) )
			){
			return true
	}
	return false;
}
/**
 *  function to insert required reusable gradients to svg element
 *  //TODO find better way to reuse the gradient and def shapes
 *  	currently not able to link svg file like we link css
 */

shapeUtil.initGradients = function( injectInto)
{
	if(!injectInto)
		return;
	/** reference to new svg element to hold various reusable gradients **/
	var defElem = d3.select(injectInto).select("svg").append("defs").attr('id', 'eskindefs');;
  var disabledColor = shapeConstants.gradient.GEOverlay.disabledFill;
  var colorConstants = SBMLConstants.colorConstants;
	/**
	 * <linearGradient id="speciesLinear"
	 * x1="0%" x2="0%" y1="100%" y2="0%" spreadMethod="pad">
	 * <stop offset="50%" stop-opacity="1" style="stop-color: rgb(173, 216, 230);"></stop>
	 * <stop offset="100%" stop-opacity=".5" style="stop-color: rgb(255, 255, 255);"></stop>
	 * </linearGradient>
	 */
	var speciesFill = defElem.append("linearGradient").attr("id", "speciesLinear")
		.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
		.attr("spreadMethod","pad");
		speciesFill.append("stop").attr("offset", "-30%").attr("stop-opacity","1").style("stop-color", "rgb(51, 33, 161)");
		speciesFill.append("stop").attr("offset", "100%").attr("stop-opacity","1").style("stop-color", "white");



	var complexFill = defElem.append("linearGradient").attr("id", "complexFill")
		.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
		.attr("spreadMethod","pad");
		complexFill.append("stop").attr("offset", "0%").attr("stop-opacity","1").style("stop-color", "rgb(180, 170, 240)");
		complexFill.append("stop").attr("offset", "100%").attr("stop-opacity","1").style("stop-color", "white");


	//type : GENERAL
	/*
	GENERALREACTION: Object
	iAlfa: 255 iBlue: 0 iGreen: 0 iRed: 0
	 */
	var reactionFill_general = defElem.append("linearGradient").attr("id", "reactionFill_general")
	    .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad");
		reactionFill_general	.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", colorConstants["GENERAL"]);
		reactionFill_general.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", "white");

	//type : TRANSPORT
	/*
	TRANSPORT: Object iAlfa: 255 iBlue: 47 iGreen: 51 iRed: 120
	 */
	var reactionFill_transport = defElem.append("linearGradient").attr("id", "reactionFill_transport")
			.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad");
			reactionFill_transport.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", colorConstants["TRANSPORT"]);
			reactionFill_transport.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", "white")

	//type : TRANSCRIPTION
	//
	var reactionFill_transcription = defElem.append("linearGradient").attr("id", "reactionFill_transcription")
			.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad");
			reactionFill_transcription.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", colorConstants["TRANSCRIPTION"]);
			reactionFill_transcription.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", "white")

	//type : TRANSLATION
	/*
	TRANSLATION: Object
	iAlfa: 255 iBlue: 163 iGreen: 116 iRed: 70
	 */
	var reactionFill_translation = defElem.append("linearGradient").attr("id", "reactionFill_translation")
			.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad");
			reactionFill_translation.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", colorConstants["TRANSLATION"]);
			reactionFill_translation.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", "white");

	//type : COMPLEX FORMATION
	/*
	COMPLEXFORMATION:  iAlfa: 255 iBlue: 214 iGreen: 170 iRed: 19
	 */
	var reactionFill_complex = defElem.append("linearGradient").attr("id", "reactionFill_complex")
			.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad")
			reactionFill_complex.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", colorConstants["COMPLEX FORMATION"]);
			reactionFill_complex.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", "white");

	//type : COVALENT MODIFICATION
	//TODO find color
	var reactionFill_covalent = defElem.append("linearGradient").attr("id", "reactionFill_covalent")
			.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad");
			reactionFill_covalent.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", colorConstants["COVALENT MODIFICATION"]);
			reactionFill_covalent.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", "white");

	// type: DISABLED REACTION due to GEO filters state
	var reactionFill_disabled = defElem.append("linearGradient").attr("id", "reactionFill_disabled")
			.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad");
			reactionFill_disabled.append("stop").attr("offset", "50%").attr("stop-opacity","1").attr("stop-color", shapeConstants.gradient.GEOverlay.disabledFill);
			reactionFill_disabled.append("stop").attr("offset", "50%").attr("stop-opacity","1").attr("stop-color", "white");

	var nodeFill_disabled = defElem.append("linearGradient").attr("id", "nodeFill_disabled")
			.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
			.attr("spreadMethod","pad");
			nodeFill_disabled.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", disabledColor);
			nodeFill_disabled.append("stop").attr("offset", "50%").attr("stop-opacity","1").style("stop-color", disabledColor);


		var filledArrowMarker = defElem.append("marker")
										.attr("id", "filledArrow")
										.attr("markerWidth", "12")
										.attr("markerHeight", "12")
										.attr("refX", "0")
										.attr("refY", "6")
										.attr("orient", "auto")
										.attr('markerUnits','userSpaceOnUse')
										.append("path")
										.attr("d", "M0,0 L0,12 L12,6 L0,0")
										.attr("style", "fill: #000000;");
										//.classed('marker-all',true);
		var hollowArrowMarker = defElem.append("marker")
										.attr("id", "hollowArrow")
										.attr("markerWidth", "12")
										.attr("markerHeight", "12")
										.attr("refX", "0")
										.attr("refY", "6")
										.attr("orient", "auto")
										.attr('markerUnits','userSpaceOnUse')
										.append("path")
										.attr("d", "M0,0 L0,12 L12,6 L0,0")
										.attr("style", "fill: #fff; stroke: #000000;  stroke-width:2px;");
										//.classed('marker-all',true);
		var lineMarker = defElem.append("marker")
								.attr("id", "Line")
								.attr("markerWidth", "12")
								.attr("markerHeight", "12")
								.attr("refX", "0")
								.attr("refY", "6")
								.attr("orient", "auto")
								.attr('markerUnits','userSpaceOnUse')
								.append("polyline")
								.attr("points", "0,-12 0,12")
								.attr("style", "fill: #fff; stroke: #000000; stroke-width:5px;");
								//.classed('marker-all',true);
		// line arrow markers for disabledFill
		var filledArrowMarker_disabled = defElem.append("marker")
										.attr("id", "filledArrow_disabled")
										.attr("markerWidth", "12")
										.attr("markerHeight", "12")
										.attr("refX", "0")
										.attr("refY", "6")
										.attr("orient", "auto")
										.attr('markerUnits','userSpaceOnUse')
										.append("path")
										.attr("d", "M0,0 L0,12 L12,6 L0,0")
										.attr("style", "fill:"+disabledColor+";");
										//.classed('marker-all',true);
		var hollowArrowMarker_disable = defElem.append("marker")
										.attr("id", "hollowArrow_disable")
										.attr("markerWidth", "12")
										.attr("markerHeight", "12")
										.attr("refX", "0")
										.attr("refY", "6")
										.attr("orient", "auto")
										.attr('markerUnits','userSpaceOnUse')
										.append("path")
										.attr("d", "M0,0 L0,12 L12,6 L0,0")
										.attr("style", "fill: " + disabledColor + "; stroke: "+disabledColor+";  stroke-width:2px;");
										//.classed('marker-all',true);
		var lineMarker_disable = defElem.append("marker")
								.attr("id", "lineMarker_disable")
								.attr("markerWidth", "12")
								.attr("markerHeight", "12")
								.attr("refX", "0")
								.attr("refY", "6")
								.attr("orient", "auto")
								.attr('markerUnits','userSpaceOnUse')
								.append("polyline")
								.attr("points", "0,-12 0,12")
								.attr("style", "fill: "+disabledColor+"; stroke: "+disabledColor+"; stroke-width:5px;");
								//.classed('marker-all',true);
}
/**
 * returns the fillClassName for reaction based on type
 * @param  {[type]} reactionType [description]
 * @return {[type]}              [description]
 */
shapeUtil.getReactionFill = function (reactionType){
		reactionType = reactionType.toUpperCase() || "GENERAL";
		var reactionFillTypes = {
			"GENERAL" : "reactionFill_general",
			"TRANSPORT" : "reactionFill_transport",
			"TRANSCRIPTION" : "reactionFill_transcription",
			"TRANSLATION" : "reactionFill_translation",
			"COMPLEX FORMATION" : "reactionFill_complex",
			"COVALENT MODIFICATION" : "reactionFill_covalent"

		}
		if(!reactionFillTypes[reactionType])
			console.warn("reaction fill does not exists " +reactionType);
		return 'url(#' + reactionFillTypes[reactionType] + ')';
}
/**
 *  function to get svg path coordinates corresponding to given svg line
 *  It accepts end points of a line, height, width of target nodes and role of the link in the reaction; and returns a string
 *  The returned string will contain coordinates of 3 points on the path
 */
shapeUtil.getPathCoordsForLine = function(sourceNode, targetNode, role){

	if(sourceNode == undefined)
		console.log("error");

	//node.position gives coordinates of top-left corner of the bounding box;
	//calculate coordinates of centre of bounding box
	var sourceX = sourceNode.position.iX + (sourceNode.iWidth || 20 )/2;
	var sourceY = sourceNode.position.iY + (sourceNode.iHeight || 20 )/2;
	var targetX = targetNode.position.iX + (targetNode.iWidth || 20 )/2;
	var targetY = targetNode.position.iY + (targetNode.iHeight || 20 )/2;

	var sourceHeight = sourceNode.iHeight || 20;
	var sourceWidth = sourceNode.iWidth || 20;
	var targetHeight = targetNode.iHeight || 20;
	var targetWidth = targetNode.iWidth || 20;

	//Depending on the role of link, update the connection points at reactionNode--------------------------------------------
	if(role == "product"){
		//In this case, link is 'reaction->species'; connect it to bottom of reactionNode
		sourceY =  sourceY + sourceHeight/2;
	}else if(role.substring(0,8) == "reactant"){
		//In this case, link is 'species->reaction' [but represented as 'reaction->species' for sake of convenience];
		//connect it to top of reactionNode
		sourceY =  sourceY - sourceHeight/2;
	}else if(role.substring(0,8) == "modifier"){
		//In this case, link is 'species->reaction'
		//connect it to either left or right of reactionNode depending on position of species
		if(sourceX < targetX){ //species on left; connect to left of reaction
			targetX = targetX - targetWidth/2;
		}else{ //species on right; connect to right of reaction
			targetX = targetX + targetWidth/2;
		}
	}
	//----------------------------------------------------------------------------------------------------------------------

	var getPythagorianDistance = function(a, b){return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));}

		//calculate diagonal of target
		var diagonalOfSourceNode = getPythagorianDistance(sourceHeight, sourceWidth);
		var diagonalOfTargetNode = getPythagorianDistance(targetHeight, targetWidth);

		//Calculate distance(from source) at which to have break-point---------------------------------------------------------
		//find visible length of line
		var lengthOfLine = getPythagorianDistance(Math.abs(sourceX-targetX), Math.abs(sourceY-targetY));
		var visibleLengthOfLine = 0;
		if(role.substring(0,8) == "modifier"){
			visibleLengthOfLine = lengthOfLine - (diagonalOfSourceNode/2);
		}else{
			visibleLengthOfLine = lengthOfLine - (diagonalOfTargetNode/2);
		}

		var d1 = 0; //distance of marker from boondary of targetNode
		var d2 = 0; //distance of marker from boondary of sourceNode
		var d = 0;  //distance of marker from connection point of sourceNode
		if(visibleLengthOfLine > 0){ //if no overlap between sourceNode and targetNode
			d1 = visibleLengthOfLine/6;
			d2 = visibleLengthOfLine - d1;
		} //else d2 = 0;

		if(role.substring(0,8) == "modifier"){ //here, sourceNode overlaps some portion of link
			d = d2 + (diagonalOfSourceNode/2);
		}else{
			d = d2;
		}
		//---------------------------------------------------------------------------------------------------------------------

		//calculate coordinate of break-point
		var xOfBreakPoint = sourceX + (d*(targetX-sourceX)/lengthOfLine);
		var yOfBreakPoint = sourceY + (d*(targetY-sourceY)/lengthOfLine);

		//construct and return string
		return "M"+sourceX+","+sourceY+" L"+xOfBreakPoint+","+yOfBreakPoint+" L"+targetX+","+targetY;
}
/**
 * creates the gradient with passed color values and ids if does not exist
 * @param  {String} color1     color1 of graient spans form top to middle
 * @param  {string} color2     color2 of graient spans form middle to bottom
 * @param  {string} gradientID gradient id for new gradient
 * @return {String}            returns the gradienID back
 */
shapeUtil.getGEOGradient = function(color1,color2,gradientID){
	var defElem = d3.select('#eskindefs');
	//remove this node if exists
	defElem.select('#'+gradientID).remove();
	// <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
  //     <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
  //     <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
  //   </linearGradient>
	//
	var speciesFill = defElem.append("linearGradient").attr("id", gradientID)
		 .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%")
		 .attr("spreadMethod","pad");
		 speciesFill.append("stop").attr("offset", "0%").attr("stop-opacity","1").attr("stop-color", color1);
		 speciesFill.append("stop").attr("offset", "50%").attr("stop-opacity","1").attr("stop-color", color1);
		 speciesFill.append("stop").attr("offset", "100%").attr("stop-opacity","1").attr("stop-color",color2);
	return gradientID;
}
/**
 * returns midpoint of two sbml Nodes.
 * @param  {instace of Base} nodeX node X.
 * @param  {instace of Base} nodeY node Y.
 * @return {{iX:Number,iY:Number}}   position object pointing tho the midpoint.
 */
shapeUtil.getMidPoint = function(nodeX,nodeY){
    console.warn(nodeX);
    console.warn(nodeY);
    var pointX = {iX: (nodeX.position.iX + nodeX.iWidth/2),iY: (nodeX.position.iY + nodeX.iHeight/2)};
    var pointY = {iX: (nodeY.position.iX + nodeY.iWidth/2),iY: (nodeY.position.iY + nodeY.iHeight/2)}
    //return {iX:(pointX.iX+pointX.iY)/2,iY: (pointY.iX+pointY.iY)/2};
    return {iX:(nodeX.position.iX+nodeY.position.iX)/2,iY: (nodeX.position.iY+nodeY.position.iY)/2};
}
/**
 * decodes the transform svg string to constituent factors
 * @param  {String} transStr string that looks like translate(88.5439453125,143.88400268554688)scale(1)
 * @return {{transform:[number,number],scale:number}}          transform co-ordinates
 */
shapeUtil.getScaleAndTransformFromString = function (transStr){
    if(!transStr) return {translate:[0,0],scale:0};

    var transPart = transStr.split('scale')[0];
    var transFactors = [0,0];
    if(transPart && transPart.indexOf('translate') != -1){
        //bit weired right ? cant understand this? Go and learn javascript.
        var transFactors = transPart.replace('translate(','').replace(')','').split(',').map(parseFloat);
        if(transFactors.length != 2) transFactors = [0,0];
    }
    var scalePart = transStr.split('scale')[1];
    var scaleFactor = 0;
    if(scalePart){
        scaleFactor = parseFloat(scalePart.replace('(','').replace(')',''));
    }
    return {translate:transFactors,scale:scaleFactor};
}
