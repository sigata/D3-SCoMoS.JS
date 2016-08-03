/**
 * scomosGraphBehaviours : refactored from scomosGraph to minimize the file size
 * Will contain :
 * 		various event handler functions 
 * 		d3 behaviours(drag,zoom) and handlers
 * All these are re factored from scomosGraph so will be very specific to scomosGraph.
 * Note : no need to write seperate test for these as these functions will be tested from scomosGraph_tests.js
 *//*

//function mouseDownOnSpecies(d){
function clickOnSpecies(d){
	d3.event.stopPropagation(); 
	if (d3.event.defaultPrevented) return;
	console.log("specie clicked");
	//propagate this event one level above so that g element will handle it
	//fixes dragging problem
	//d3.event.stopPropagation();
	
	var thisSpecies = d3.select(this);
	if(!d3.event.ctrlKey){
		d3.selectAll('.selected').classed("selected", false);
		//clean up the selection
		selection.clear();
		thisSpecies.classed("selected", true);
		//clean up the selection
		selection.addNode(thisSpecies);
	}
	else{
		//toggle speciesSelection
		thisSpecies.classed('selected',!thisSpecies.classed('selected'));
		//add to selection if it is selected
		if(thisSpecies.classed('selected'))
			selection.addNode(thisSpecies);
		else
			selection.removeNode(thisSpecies);
	}
}

//function mouseDownOnReaction(d){
function clickOnReaction(d){
	d3.event.stopPropagation(); 
	if (d3.event.defaultPrevented) return;
	console.log("reaction clicked");
	//propagate this event one level above so that g element will handle it
	//fixes dragging problem
	//d3.event.stopPropagation();
	
	var thisReaction = d3.select(this);
	if(!d3.event.ctrlKey){
		d3.selectAll('.selected').classed("selected", false);
		//clean up the selection
		selection.clear();
		thisReaction.classed("selected", true);
		selection.addNode(thisReaction);
	}
	else{
		//toggle reactionSelection
		thisReaction.classed('selected',!thisReaction.classed('selected'));
		
		//add to selection if it is selected
		if(thisReaction.classed('selected'))
			selection.addNode(thisReaction);
		else
			selection.removeNode(thisReaction);
	}
	//select edges involving this reaction
	d3.selectAll('.link').filter(function(thisLink){
		var _source = thisLink.source;
		var _target = thisLink.target;
		var thisID = thisReaction.datum().sId;
		return _source.sId === thisID || _target.sId === thisID;
	}).classed('selected',thisReaction.classed('selected')); //links follow the state of reaction node
}

function mouseDownOnLink(d){
//function clickOnLink(d){
	console.log("link clicked");
	//propagate this event one level above so that g element will handle it
	//fixes dragging problem
	d3.event.stopPropagation(); 
	//if (d3.event.defaultPrevented) return;
	
	var thisLink = d3.select(this);
	if(!d3.event.ctrlKey){
		//deselect all and select this link
		d3.selectAll('.selected').classed("selected", false);
		//clean up the selection
		selection.clear();
		thisLink.classed("selected", true);
		selection.addNode(thisLink);
	}
	else{
		//toggle link selection
		thisLink.classed('selected',!thisLink.classed('selected'));
		//add to selection if it is selected
		if(thisLink.classed('selected'))
			selection.addNode(thisLink);
		else
			selection.removeNode(thisLink);
	}
}

function mouseDownOnCompartment(d){
	d3.event.stopPropagation(); 
	if (d3.event.defaultPrevented) return;
	var thisCompartment = d3.select(this);
	
	if(!d3.event.ctrlKey){
		d3.selectAll('.selected').classed("selected", false);
		//clean up the selection
		selection.clear();
		thisCompartment.classed("selected", true);
		selection.addNode(thisCompartment);
	}
	else{
		//toggle speciesSelection
		thisCompartment.classed('selected',!thisCompartment.classed('selected'));
		//add to selection if it is selected
		if(thisLink.classed('selected'))
			selection.addNode(thisCompartment);
		else
			selection.removeNode(thisCompartment);
	}
}

function mouseClickedOnSVG(d){
	 if (d3.event.defaultPrevented) return;
	d3.event.stopPropagation();
	d3.selectAll('.selected').classed("selected", false);
	//clean up the selection
	selection.clear();
}*/