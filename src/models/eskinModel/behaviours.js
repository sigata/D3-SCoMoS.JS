/**
 * Behaviours.js contains d3 event handler for various events like click drag etc
 * to enable there events to access more data about view use the anon wrapped function call
 *  syntax to define event handler is
 *    function func_name ( element,data1,data2....)
 *    when calling useing
 *    d3.select("node").on("click",function(){ func_name(this,data1)});
 */

var eskinBehaviours = {};

eskinBehaviours.mouseMoveOnCanvas = function(element,construnctionG,construction){
    //<line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
    if(construction.isConstructingEdge()){
        construnctionG.attr('visibility','visible');
        var sourceNode = construction.getReactionConstructor().source;
        var x1 = sourceNode.position.iX + sourceNode.iWidth / 2;
        var y1 = sourceNode.position.iY + sourceNode.iHeight / 2;
        var mouseCoords = modelHelper.getTransformedCordinates(element,d3.event);
        construnctionG.select('line')
                      .attr('x1',x1)
                      .attr('y1',y1)
                      .attr('x2',mouseCoords.iX)
                      .attr('y2',mouseCoords.iY);
    }
    else{
        construnctionG.attr('visibility','hidden');
    }
}
/**
 * hanlder for context i.e. right click handler for canvas.
 * @param  {D3 element} element       reference to canvas.
 * @param  {Construnctio} construnction instanceOf active construnction object.
 * @return {}        handles context behaviour for canvas.
 */
eskinBehaviours.contextOnCanvas = function(element,construction){
    if(construction.isConstructingEdge()){
        d3.event.preventDefault();
        construction.stopCurrentOperation();
    }
}
eskinBehaviours.getCanvasContextMenu = function(contextHandler){
    var canvasContextMenu = [
            {
                title: 'paste',
                action: function(elm, d, i) {
                    contextHandler.paste();
                    console.warn('Copied  element.');
                },
                disabled : !clipboard.hasPastables()
            }]
    return canvasContextMenu;
}
eskinBehaviours.getCompartmentContextMenu = function(data,contextHandler){
    var compartmentContextMenu = [
			{
				title: 'Copy',
				action: function(elm, d, i) {
					contextHandler.copy();
                    console.warn('Copied  element.');
				}
			},
			{
				title: 'Paste',
				action: function(elm, d, i) {
                    contextHandler.paste();
                    console.warn('Pasted elements');
                    console.warn(d3.event);
				},
                disabled : !clipboard.hasPastables()
			},
            {
				title: 'Cut',
				action: function(elm, d, i) {
                    contextHandler.cut();
                    console.warn('Elements been Cut');
				}
			},
            {
				title: 'Delete',
				action: function(elm, d, i) {
                    contextHandler.delete();
                    console.warn('Elements been Deleted.');
				}
			}
		]
    return compartmentContextMenu;
}
eskinBehaviours.getSpeciesContextMenu = function(data,contextHandler){
    var speceisContextMenu = [
			{
				title: 'Copy',
				action: function(elm, d, i) {
					contextHandler.copy();
                    console.warn('Copied  element.');
				}
			},
			{
				title: 'Paste',
				action: function(elm, d, i) {
                    contextHandler.paste();
                    console.warn('Pasted elements');
                    console.warn(d3.event);
				},
                disabled : data.sType.toUpperCase() !== 'COMPLEX' || (!clipboard.hasPastables())
			},
            {
				title: 'Cut',
				action: function(elm, d, i) {
                    contextHandler.cut();
                    console.warn('Elements been Cut');
				}
			},
            {
				title: 'Delete',
				action: function(elm, d, i) {
                    contextHandler.delete();
                    console.warn('Elements been Deleted.');
				}
			}
		]
    return speceisContextMenu;
}
eskinBehaviours.getReactionContextMenu = function(data,contextHandler){
    var reactionContextMenu = [
			{
				title: 'Copy',
				action: function(elm, d, i) {
					contextHandler.copy();
                    console.warn('Copied  element.');
				}
			},
            {
				title: 'Cut',
				action: function(elm, d, i) {
                    contextHandler.cut();
                    console.warn('Elements been Cut');
				}
			},
            {
				title: 'Delete',
				action: function(elm, d, i) {
                    contextHandler.delete();
                    console.warn('Elements been Deleted.');
				}
			}
		]
    return reactionContextMenu;
}
eskinBehaviours.getCovalentContextMenu = function(data,contextHandler){
    var covalentContextMenu = [
            {
                title: 'Delete',
                action: function(elm, d, i) {
                    contextHandler.delete();
                    console.warn('Elements been Deleted.');
                }
            }
        ]
    return covalentContextMenu;
}
eskinBehaviours.mouseClickedOnSpecies = function(element,selection,construction,panMode){
    if(panMode === 'PAN'){
        //dont block the event let zoom behaviour handle this
        return;
    }
	d3.event.stopPropagation();
	if (d3.event.defaultPrevented) return;
	//propagate this event one level above so that g element will handle it
	//fixes dragging problem
	//d3.event.stopPropagation();

	var thisSpecies = d3.select(element);
	var thisData = thisSpecies.datum();
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
    //add resizer to this node
    if(d3.selectAll('.selected')[0].length == 1)
        resizer.addResizer(d3.select('.selected'));//new selection is required as this click could be deselection event
    else
        resizer.clearResizer();
	eskinDispatch.speciesClick(thisData,element);
    construction.constructNode(d3.event);
}
eskinBehaviours.mouseClickedOnReaction = function(element,selection,construction,panMode){
    if(panMode === 'PAN'){
        //dont block the event let zoom behaviour handle this
        return;
    }
	d3.event.stopPropagation();
	if (d3.event.defaultPrevented) return;
	//propagate this event one level above so that g element will handle it
	//fixes dragging problem
	//d3.event.stopPropagation();

	var thisReaction = d3.select(element);
	var thisData = thisReaction.datum();
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
	//mark all its edges selected if this reaction is selected
	if(thisReaction.classed("selected")){
		thisData.getAllEdges().forEach(function(edge){
			//var eData= edge.datum();
				var thisEdge = d3.selectAll(".link")
							.filter(function(d){
								return d.sId === edge.sId
							});
				thisEdge.classed('selected',true);
		})
	}
	//select edges involving this reaction
	// d3.selectAll('.link').filter(function(thisLink){
	// 	var _source = thisLink.source;
	// 	var _target = thisLink.target;
	// 	var thisID = thisReaction.datum().sId;
	// 	return _source.sId === thisID || _target.sId === thisID;
	// }).classed('selected',thisReaction.classed('selected')); //links follow the state of reaction node
	// //dispatch click event for user defined hadlers
	construction.constructNode(d3.event);
    resizer.clearResizer();
	eskinDispatch.reactionClick(thisData,element);
}

eskinBehaviours.mouseClickedOnCompartment = function(element,selection,panMode){
    if(panMode === 'PAN'){
        //dont block the event let zoom behaviour handle this
        return;
    }
	d3.event.stopPropagation();
	if (d3.event.defaultPrevented) return;
	//propagate this event one level above so that g element will handle it
	//fixes dragging problem
	//d3.event.stopPropagation();

	var thisCompartment = d3.select(element);
	var thisData = thisCompartment.datum();
	if(!d3.event.ctrlKey){
		d3.selectAll('.selected').classed("selected", false);
		//clean up the selection
		selection.clear();
		thisCompartment.classed("selected", true);
		//clean up the selection
		selection.addNode(thisCompartment);
        resizer.addResizer(thisCompartment)
	}
	else{
		//toggle speciesSelection
		thisCompartment.classed('selected',!thisCompartment.classed('selected'));
		//add to selection if it is selected
		if(thisCompartment.classed('selected'))
			selection.addNode(thisCompartment);
		else
			selection.removeNode(thisCompartment);
	}
	//selection.updateDraggableSelection(data);
	//selection.updateDraggableSelection(data);
	eskinDispatch.compartmentClick(thisData,element);
}
eskinBehaviours.mouseClickedOnEdge = function (element,selection,panMode){
    if(panMode === 'PAN'){
        //dont block the event let zoom behaviour handle this
        return;
    }
	d3.event.stopPropagation();
	var thisLink = d3.select(element);
	var thisData = thisLink.datum();
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
	eskinDispatch.linkClick(thisData,element);
}

eskinBehaviours.clickOnCovalentModification = function(element,selection){
    d3.event.stopPropagation();
    if (d3.event.defaultPrevented) return;

    var thisModification = element;
    var thisData = thisModification.datum();
    if(!d3.event.ctrlKey){
        d3.selectAll('.selected').classed("selected", false);
        //clean up the selection
        selection.clear();
        thisModification.classed("selected", true);
        //clean up the selection
        selection.addNode(thisModification,element);

    }
    else{
        //toggle speciesSelection
        thisModification.classed('selected',!thisModification.classed('selected'));
        //add to selection if it is selected
        if(thisModification.classed('selected'))
            selection.addNode(thisModification);
        else
            selection.removeNode(thisModification);
    }
    resizer.clearResizer();
    eskinDispatch.covalentModificationClick(thisData)
}
/**
 * clears the selection from view and selections
 * @param  {D3 selected elem (canvas)} element   d3 selection fro canvases
 * @param  {scomosSelections} selection selections Object
 * @param  {string} __panMode   pan mode decides wheather to clear the selections
 * @return {}           [description].
 */
eskinBehaviours.mouseClickedOnCanvas = function(element,selection,model,__panMode,construction){
    //if (d3.event.defaultPrevented) return;
	if(__panMode.toUpperCase() === "PAN"){
        return;
		}
	if(__panMode.toUpperCase() === "SELECT"){
			selection.clear();
			d3.selectAll('.selected').classed('selected',false);
            resizer.clearResizer();
		}
    if(construction.getDetails().activeTool){
        construction.constructNode(d3.event);
    }
    else{
        var defCompart = model.mapCompartmentLayouts['default'];
        var eventData = {
                            sId             : model.sId,
                            sName           : model.sName,
                            sOrganismType   : model.sOrganismType,
                            sNotes          : model.sNotes,
                            iHeight         : defCompart.iHeight,
                            iWidth          : defCompart.iWidth,
                            getEntityType   :function(){return 'SBMLModel'},
                        }
        eskinDispatch.canvasClick(eventData);
    }
}
/** used as synch var between various drag handlers. It is anti pattern
    not able to find way around this **/
var isDragged = false;
var resizeStatus = {isResizing:false,activeResizeHandle:'',node:null,event:null};
/**
 * will record before drag dimensions of object.
 * Structure shall look something like {sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}
 */
var beforeDragState;
eskinBehaviours.dragstarted = function(element,selection,panMode){
    if(panMode === 'PAN'){
        //dont block the event let zoom behaviour handle this
        return;
    }
	d3.event.sourceEvent.stopPropagation();
	//treat drag started as the mouseDown event
	//do only selection logic in drag started no drag logic here
	//leave that to dragged method
	var thisNode = element;
    var target = d3.event.sourceEvent.target;
        target = d3.select(target);
    resizeStatus.isResizing = false;
    if(target.classed('resizer')){
        resizeStatus.isResizing = true;//this flag will be used by the dragging handlers to decide drag or resize
        resizeStatus.activeResizeHandle = target.attr('class').split(' ')[1];//TODO: remvoe hard coded index
        resizeStatus.node = thisNode;
    }
	//ignore ctrl press in drag started
	if(!d3.event.sourceEvent.ctrlKey || resizeStatus.isResizing){
		//deselect all if this is not selected one
		//if selected this could be the case of the drag
		//so let dragged or clicked event handle further state
		if(!thisNode.classed('selected')){
			d3.selectAll('.selected').classed('selected',false);
			//clean up the selection
			selection.clear();
		}
		modelHelper.selectNode(thisNode);
		selection.addNode(thisNode);
	}
}
/**
 * dragged event handlers is invoked on actual drag
 * @param  {D3 selector} element    d3 selector that is being dragged
 * @param  {scomosSelections} selection  current selections set
 * @param  {SBMLModel} modelData  model
 * @param  {Function} viewUpdate viewUpdater Function
 * @return {}            handles drag and resize, updates the view accordingly
 */
eskinBehaviours.dragged = function(element,selection,modelData,viewUpdate,panMode){
	//process drag only if true drag
    if(panMode === 'PAN'){
        //dont process this.
        return;
    }
	var thisNode = element;
	if(d3.event.dx != 0 || d3.event.dy != 0)
	{

        isDragged = true;
        var target = d3.event.sourceEvent.target;
            target = d3.select(target);
        if(resizeStatus.isResizing){
            resizeStatus.event = d3.event;
            if(!beforeDragState){
                beforeDragState = recordSelectionDimensions(selection);
            }
            resizer.processResize(resizeStatus);
            viewUpdate();
        }else{
            resizer.clearResizer();
            if(d3.event.sourceEvent.ctrlKey){
    			//mark this as selected
    			modelHelper.selectNode(thisNode);
    			selection.addNode(thisNode);
    		}
            if(!beforeDragState){
                beforeDragState = recordSelectionDimensions(selection);
            }
    		var dragables = selection.getDraggableSelection(modelData);
    		dragables.forEach(function(thisNode){
    			var node = d3.select(thisNode[0][0]);
    			//drag if neither an edge nor a covalent modification
    			if(!node.classed('link') && !node.classed('modifier-node')){
    				//console.info(node.attr('class'));
    				node.classed('dragging',true);
    			}
    		});
    		//console.info(d3.selectAll('.dragging'));
    		d3.selectAll('.dragging').each(function(d){
    			d.position.iX = d3.event.dx + d.position.iX;
    			d.position.iY = d3.event.dy + d.position.iY;
    			d3.select(this).attr("transform", "translate(" + d.position.iX + "," + d.position.iY + ")")
    		})
    		//update affecting links
    		d3.selectAll('.link').attr('d', function(d){return shapeUtil.getPathCoordsForLine(d.source, d.target, d.role)});
        }
	}
}

eskinBehaviours.dragended = function(element,selection,modelData,undoManager){
    //d3.event.sourceEvent.stopPropagation();
	if(isDragged){
		isDragged=false;
		console.log("drag ended");
		//do not handle any selection logic in drag end only dragging logic
		d3.selectAll(".dragging").classed("dragging", false);
		//update parent child relationShip of dragged elements
		//selection.updateDraggableSelection(modelData);
        var afterDragState = recordSelectionDimensions(selection);
        undoableOperations.recordDrag(undoManager,modelData,beforeDragState,afterDragState);
        beforeDragState = null;
        modelData.refreshNodeRelations();
		//if selection count is one add resizers back
		if (d3.selectAll('.selected')[0].length == 1){
            resizer.addResizer(element);
                modelHelper.triggerClickOnNode(d3.select('.selected'));
        }
	}
}

eskinBehaviours.zoom = function(__panMode,rootG,selection,zoomBehaviour){
	//zoomBehaviour.translate([d3.event.sourceEvent.x, d3.event.sourceEvent.y]);//reset translate if any
	//blcok if true zoom
	if(d3.event.translate || d3.event.scale){
        if(!d3.event.sourceEvent)//not a d3 event dont handle.
            return;
        d3.event.sourceEvent.stopPropagation();
        console.log("zooming")
    	var zoomElem = rootG;
    	if(__panMode.toUpperCase() === "PAN"){
    		zoomElem.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    	}
    	if(__panMode.toUpperCase() === "SELECT"){
            if(event.ctrlKey){
                zoomElem.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }
            else{
                var transFactor  = shapeUtil.getScaleAndTransformFromString(rootG.attr('transform'));
                //nullify any zoom or translate
                zoomBehaviour.translate(transFactor.translate);
                zoomBehaviour.scale(transFactor.scale);
            }
    	}
    }
}

eskinBehaviours.keyPresseed = function(rootSVG,selection){
    d3.select('body').on("keydown", function() {
        d3.event.stopPropagation();
        if(d3.event.keyCode==65 && d3.event.ctrlKey){
            d3.selectAll('.species-node').each(function(){
                var thisNode = d3.select(this);
                thisNode.classed('selected', true);
                selection.addNode(thisNode);
            });
            d3.selectAll('.reaction-node').each(function(){
                var thisNode = d3.select(this);
                thisNode.classed('selected', true);
                selection.addNode(thisNode);
            });
            d3.selectAll('.link').each(function(){
                var thisNode = d3.select(this);
                thisNode.classed('selected', true);
                selection.addNode(thisNode);
            });
            d3.selectAll('.compartment').each(function(){
                var thisNode = d3.select(this);
                thisNode.classed('selected', true);
                selection.addNode(thisNode);
            });
        }
    else if (d3.event.keyCode == 46) { //46 is key code for delete
        d3.event.stopPropagation();
    }
    });
}
function handleResize(event){
    var thisNode = resizeStatus.node;
    var thisData = thisNode.datum();
    var aspectRatio = thisData.iWidth / thisData.iHeight;

    if(resizeStatus.activeResizeHandle === 'rNE'){
        //rule width follows height
        thisData.iHeight    -=  event.dy;
        thisData.iWidth     =   thisData.iHeight * aspectRatio;
        //thisData.position.iX += event.dx;
        thisData.position.iY += event.dy;
    }
    else if(resizeStatus.activeResizeHandle === 'rSE'){
        //rule width follows height
        thisData.iHeight    +=  event.dy;
        thisData.iWidth     =   thisData.iHeight * aspectRatio;
        //thisData.position.iX += event.dx;
        //thisData.position.iY += event.dy;
    }
    else if(resizeStatus.activeResizeHandle === 'rSW'){
        //rule width follows height
        var oldWidth = thisData.iWidth;
        thisData.iHeight    +=  event.dy;
        thisData.iWidth     =   thisData.iHeight * aspectRatio;

        thisData.position.iX += oldWidth - thisData.iWidth;
        //thisData.position.iY += event.dy;
    }
    else if(resizeStatus.activeResizeHandle === 'rNW'){
        //rule width follows height
        var oldWidth = thisData.iWidth;
        thisData.iHeight    -=  event.dy;
        thisData.iWidth     =   thisData.iHeight * aspectRatio;

        thisData.position.iX -= thisData.iWidth - oldWidth;
        thisData.position.iY += event.dy;
    }

    modelHelper.updateNodeView(thisNode)
    resizer.updateResizer(thisNode);
    //update affecting links
    d3.selectAll('.link').attr('d', function(d){return shapeUtil.getPathCoordsForLine(d.source, d.target, d.role)});
}

/**
 * returns data in the usable format for drag method to record drag event.
 * @param  {scomosSelections} selection a scomos seleciton object
 * @return {{sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}}           [description]
 */
function recordSelectionDimensions(selection){
    var returnThis = {};
    selection.getDraggableSelection()
             .map(function(node){
                 var thisData = node.datum();
                 returnThis[thisData.sId] = {iHeight:thisData.iHeight,
                                            iWidth:thisData.iWidth,
                                            position:{iX:thisData.position.iX,iY:thisData.position.iY}}
             })
    return returnThis;
}
