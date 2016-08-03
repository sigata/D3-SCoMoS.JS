/**
 * eskinView module : Canvas Drawing and manipulation goes here
 * this is private module wont be exposed outside the library
 */

/**
 * Creates eskinView object
 * @constructor
 * @param {String} rootElem rootDiv( fully qulified jquery selector) in which this model will be rendered
 */
function eskinView(rootElem,config,model,undoManager,construction,contextHandler){

	var selection = new scomosSelections(rootElem);
	var svg;
	var rootG;//first level root elem
	var compartG;
    var construnctionG;
	var edgesG;
	var speciesG;
	var reactionG;
    var toolTip;
	var panMode = "PAN";
    var overlayMode = false;
	// following variables are for internal purposes
	// they help implement the general update pattern
	// for more information on said pattern checkout mike bostokcs blog
	// http://bl.ocks.org/mbostock/3808234

	var arrSpecies = [];
	var arrCompartments = [];
	var arrReactions = [];
	var links = [];

	/**
	 * function updates the private nodeArray selection
	 * @param {[nodeObject]} parentNodeArray
	 * @param {nodeObject} nodeObject node to be added/updateNodeArray
	 * @returns updates the nodeArray
	 **/
	function updateNodeArray(parentNodeArray,newElem){
		var found = $.grep(parentNodeArray,function(elem,i){return elem.sId === newElem.sId})[0];
		if(!found) parentNodeArray.push(newElem);//add new
		else found = newElem;//update
	}
    /**
     * splice the node from said array if found
     * @param  {[SBML object]} parentNodeArray node array to be spliced from
     * @param  {String} elemId            sId of elem to be spliced
     * @return {SBML object}                 returns the spliced sbml object
     */
    function spliceNodefromNodeArray(parentNodeArray,elemId){
        var foundAt;
        var found = $.grep(parentNodeArray,function(elem,i){foundAt = i;return elem.sId === elemId})[0];
        //found at is index so valid if greater that 0 fix for issue 20819 : last drawn molecule reappers.
        if(foundAt >=0 ){
            return parentNodeArray.splice(foundAt,1)[0];
        }
		return null;
    }
	var force=d3.layout.force()
	.size([200,200])
	.nodes([])
	.links(links);

	var drag = d3.behavior.drag()
                .origin(function() {
                    var d = d3.select(this).datum();
                    return {x: d.position.iPostionX, y: d.position.iPostionY};
                })
    //		    .origin(function(d) {
    //		    	return {x:d.position.iX,y:d.position.iY}; })
    .on("dragstart", function(){eskinBehaviours.dragstarted(d3.select(this),selection,panMode)})
    .on("drag", function(){eskinBehaviours.dragged(d3.select(this),selection,model,update,panMode)})
    .on("dragend", function(){eskinBehaviours.dragended(d3.select(this),selection,model,undoManager)});

    var zoomBehaviour = d3.behavior.zoom().
					scaleExtent([0.5, 10])
					.on("zoom", function(){eskinBehaviours.zoom(panMode,rootG,selection,zoomBehaviour);});
    /**
     * initialises the tooltip functionality for this graph.
     * @return {} clears any remenant toolTips and inits the toolTip variable.
     */
    function initToolTip(){
        d3.selectAll('.eskin-toolTip').remove();//remove any tip if exists.
         toolTip = d3.tip()
                    .attr('class', 'eskin-toolTip')
                    .html(function(d) { return toolTipFormatter(d)})
                    .offset([0, 0]);
    }
    /**
     * accepts node data and returns the toolTip html
     * @param  {SBML Node} d node data to be displayed in tooltip
     * @return {String}   html to be displayed in tip container.
     */
    function toolTipFormatter(d){
        return '<span> ID : ' + d.sId + '</span>' + '<br> ' +
                '<span> Name : ' + d.sName + '</span>' + '<br> '+
                '<span> Type : ' + d.sType + '</span>' + '<br> '
    }
    function initCanvas(){
    	//Skeleton looks like
    	/**
    	 * graphRoot -- >SVG (def attrib)
    	 * 			    --> <g root g ( receives pan events)>
    	 * 					--> <g compartments>
    	 * 					--> <g links>
    	 *  				--> <g species>
    	 * 					--> <g reaction>
    	 */
		//add svg to the root elem and set dimension
		d3.select(rootElem).select("svg").remove();
		var thisSVG = d3.select(rootElem)
					.append("svg")
					.attr("height",config.height)
					.attr("width",config.width)
                    .attr("style","padding:10px;");
		svg = thisSVG;
		//add shape gradients
		shapeUtil.initGradients(rootElem);
		//init group containers
		rootG 		    = svg.append("g").attr("id","rootG");
		compartG        = rootG.append("g").attr("id","compartG");
        construnctionG  = rootG.append("g").attr('id',"construnctionG")
                                            .attr('visibility','hidden');
		edgesG 		    = rootG.append("g").attr("id","edgesG");
		speciesG 	    = rootG.append("g").attr("id","speciesG");
		reactionG 	    = rootG.append("g").attr("id","reactionG");
		svg.call(zoomBehaviour);
		svg.on('click',function(){eskinBehaviours.mouseClickedOnCanvas(this,selection,model,panMode,construction)});
        svg.on('mousemove',function(){eskinBehaviours.mouseMoveOnCanvas(this,construnctionG,construction)});
        svg.on('contextmenu',function(){
            eskinBehaviours.contextOnCanvas(this,construction);
            d3.contextMenu(function(){return eskinBehaviours.getCanvasContextMenu(contextHandler);})(event);
        });

        //svg.on('contextmenu',d3.contextMenu(function(){return eskinBehaviours.getCanvasContextMenu(contextHandler);}));
        //some extra config
        construnctionG.append('line').attr('id','constrLine')
                                    .attr('class','constrLine');
        //setup toolTip functionality
        initToolTip();
        svg.call(toolTip)
    }

	initCanvas();

	/**
	 * adds compartment to view
	 */
	function addCompartment(compartment){
		/*compartG.data(compartment)
			.enter();*/
		var compartment_node = compartG.selectAll('.compartment')
	    .data(arrCompartments,function(d){return d.sId})
	    .enter()
	    .append('g')
	    .attr('class',function(d){return d.sId !== 'default' ? 'compartment' : 'defCompartment'});

		//add shape-path
		compartment_node.append('path')
			.attr('class', 'compartment-path')
			.attr('d',function(d){
				if(d.sType == "Rectangular"){
					return shapeUtil.getRoundedRectWithTickness(d.iHeight, d.iWidth,10);
				}else if(d.sType == "Circular"){
					return shapeUtil.getEllipseWithTickness(d.iHeight, d.iWidth,10);
				}else{
					return shapeUtil.getRoundedRectWithTickness(d.iHeight, d.iWidth,10);
				}
				})
			.attr('style',function(d){
				//dont show  default compartment
				if(d.sId === 'default') return;
				return 'fill:'+'rgb('+d.color.iRed+','+d.color.iGreen+','+d.color.iBlue+')';
			});

		// 	add text-node
		compartment_node.append('text')
				.attr('text-anchor','start')
				//TODO: used static spacing for text make this configurable
				.attr('x',function(d){return 0;})
				.attr('y',function(d){return d.iHeight + 15})
				.text(function(d){return d.sName})
				.attr('class', 'text-node');
	    //move compartment node to its corrrection position
		compartment_node.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });
		//TODO: add event handlers here
		compartment_node.on('click',function(){
		    eskinBehaviours.mouseClickedOnCompartment(this,selection,panMode);
		});//there is no special click event handler here
		// compartments.on('mouseover', dispatch.compartmentHover);
        compartment_node.on('mouseout', toolTip.hide)
        compartment_node.on('mouseover', function(d) {
            var node = d3.select(this).node();
            toolTip.show(d, node);
        });
        compartment_node.on('contextmenu',d3.contextMenu(
                function(data){
                    return eskinBehaviours.getCompartmentContextMenu(data,contextHandler)
                })
        );
        //add drag
		compartment_node.call(drag);
		//console.info("added a compartment node : "+compartment.sId+" to canvas ");
	}

	/**
	 * adds species to graph binds events etc
	 * @param {Species} species speceis object to be added to view
	 * @returns {} adds svg element for this species to view bootstraps its behavior
	 */
    function addSpecies(species){
    	// var node = speciesG.selectAll('.species-node')
    	//             .data(arrSpecies,function(d){return d.sId})
        //             .exit().each(function(d){console.warn('removed : ' + d.sId);}).remove();
        var node = speciesG.selectAll('.species-node')
    	            .data(arrSpecies,function(d){return d.sId})
    			    .enter()
                    .append('g')
    		        .attr('class','species-node');
    		//add shape
    	node.append('path')
    	    .attr('d',function(d){
    		    return d3scomos.getSymbol(d.sType,d);
    		})
    	    .attr('class', 'species-path')
        	.attr('fill',function(d){ if(d.sType.toUpperCase() === 'COMPLEX') return 'url(#complexFill)'; return 'url(#speciesLinear)';});
            //add text
    	node.append('text')
    	    .attr('text-anchor','middle')
    	    //TODO: used static spacing for text make this configurable
    	    .attr('x',function(d){return d.iWidth/2;})
    	    .attr('y',function(d){return d.iHeight + 15})
    	    .text(function(d){return d.sName})
    	    .attr('class', 'text-node');

    	//transform these nodes there right posistions
    	node.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });

    	node.on('click', function(){
    		eskinBehaviours.mouseClickedOnSpecies(this,selection,construction,panMode);
    	});
        node.on('mouseout', toolTip.hide)
        node.on('mouseover', function(d) {
            var node = d3.select(this).node();
            toolTip.show(d, node);
        });
        // node.on('contextmenu',function(){
        //     eskinBehaviours.contextOnSpecies(this);
        // });
        node.on('contextmenu',d3.contextMenu(
                function(data){
                    return eskinBehaviours.getSpeciesContextMenu(data,contextHandler)
                })
        );
        //add co valant modification to this node
        addCovalantModification(node);
    	//add drag
    	node.call(drag);
    }
    /**
     * process the co valant modification info for this node.
     * @param {D3 selector} speciesNode d3 species node selector.
     */
    function addCovalantModification(speciesNode){
        try{
            //for each species-node, renders its COVALENT MODIFICATIONS
                var thisNode = speciesNode;
                var thisNodeData = speciesNode.datum();
                //add svg elements
                var modifierListOfThisNode = modelHelper.getModifierListOfNode(thisNodeData);
                var modifierNodesOfThisNode = thisNode.selectAll('.modifier-node')
                                                        .data(modifierListOfThisNode)
                                                        .enter()
                                                        .append('g').attr('class', 'modifier-node');
                modifierNodesOfThisNode.append('path')
                                        .attr('class', 'modifier-path')
                                        .attr('d', function(d){
                                                        return shapeUtil.getEllipse(16, 16, d.parentSpecies.iWidth + 8 + d.pos*16, d.parentSpecies.iHeight - 8);
                                                    });
                                        //.attr('style', "stroke-width: 1px; stroke: #000000; fill : #ffffff;");
                modifierNodesOfThisNode.append('text')
                                        .attr('x', function(d){return d.parentSpecies.iWidth + 12 + d.pos*16})
                                        .attr('y', function(d){return d.parentSpecies.iHeight + 4})
                                        .attr('class', "text-node")
                                        .text(function(d){return d.modificationType});


                //var covalentModification = d3.selectAll('.modifier-node');
                modifierNodesOfThisNode.on('click', function(){
                    //eskinBehaviours.clickOnCovalentModification(d3.select(this),selection);
                    d3.event.stopPropagation();
                });
                modifierNodesOfThisNode.on('mousedown', function(){
                    eskinBehaviours.clickOnCovalentModification(d3.select(this),selection);
                });
                modifierNodesOfThisNode.on('contextmenu',d3.contextMenu(
                        function(data){
                            return eskinBehaviours.getCovalentContextMenu(data,contextHandler);
                        })
                );
        }
        catch(err){
            //console.warn(err);
        }

    }
    var updateSpeciesCovalantModification = function (sId){
        var speciesNode = d3.selectAll('.species-node')
                            .filter(function(d){return d.sId === sId});
        speciesNode.selectAll('.modifier-node').remove();
        addCovalantModification(speciesNode);
        //clear all modfiier nodes.
        //redraw all modifer nodes
    }
    /**
     * add reaction  node to view
     * @param {Reaction} reaction reaction node to be added
     */
    function addReaction(reaction){
    	var reaction_node = reactionG.selectAll('.reaction-node')
    		.data(arrReactions,	function(d){return d.sId})
    		.enter()
    		.append('g')
    		.attr('class','reaction-node');
    	//add reaction node path
    	reaction_node.append('path')
    			.attr('d',function(d){
    				return d3scomos.getSymbol('REACTION',d);
    			})
    			.attr('class', 'reaction-path')
    			.attr('fill',function(d){return shapeUtil.getReactionFill(d.sType)});
    			// .attr("style", function(d){
    			// 				var reactionColor = "rgb("+d.color.iRed+","+d.color.iGreen+","+d.color.iBlue+")";
    			// 				//return "fill: "+reactionColor+"; stroke: "+reactionColor+";";
    			// 			});
    	// add text node
    	reaction_node.append('text')
    			.attr('text-anchor','start')
    			//TODO: used static locations assuming node size + 20 + 5 padding
    			.attr('x',function(d){return 25;})
    			//TODO: used static locations assuming node hiehgt + 20/2 + 5 padding
    			.attr('y',function(d){return 15})
    			.text(function(d){return d.sName})
    			.attr('class', 'text-node');
    	// move node to its correct position
    	reaction_node.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });
    	// TODO: add event handlers
    	// .on('mouseover', dispatch.reactionHover)
    	reaction_node.on('click', function(){
    		eskinBehaviours.mouseClickedOnReaction(this,selection,construction,panMode);
    	});
        reaction_node.on('mouseout', toolTip.hide)
        reaction_node.on('mouseover', function(d) {
            var node = d3.select(this).node();
            toolTip.show(d, node);
        });
        reaction_node.on('contextmenu',d3.contextMenu(
                function(data){
                    return eskinBehaviours.getReactionContextMenu(data,contextHandler)
                })
        );
        //add drag
    	reaction_node.call(drag);
    	updateEdges();
    }

    function updateEdges(){
    	//updates the edge collection
    	links = [];
    	arrReactions.map(function(reaction){
    		reaction.getAllEdges().forEach(function(edge){links.push(edge)});
    	});
    	addEdge();
    }

    /**
     * updates the viewElement by updating view properties
     * @return
     */
    function update(){
		//update compartment-nodes
		var allCompartments = compartG.selectAll('.compartment').data(arrCompartments,function(d){return d.sId});
		//update shape-path
		allCompartments.select('path')
			.attr('class', 'compartment-path')
			.attr('d',function(d){
				if(d.sType == "Rectangular"){
					return shapeUtil.getRoundedRectWithTickness(d.iHeight, d.iWidth,10);
				}else if(d.sType == "Circular"){
					return shapeUtil.getEllipseWithTickness(d.iHeight, d.iWidth,10);
				}else{
					return shapeUtil.getRoundedRectWithTickness(d.iHeight, d.iWidth,10);
				}
				})
			.attr('style',function(d){
				//dont show  default compartment
				if(d.sId === 'default') return;
				return 'fill:'+'rgb('+d.color.iRed+','+d.color.iGreen+','+d.color.iBlue+')';
			});

		// 	add text-node
		allCompartments.select('text')
				.attr('text-anchor','start')
				//TODO: used static spacing for text make this configurable
				.attr('x',function(d){return 0;})
				.attr('y',function(d){return d.iHeight + 15})
				.text(function(d){return d.sName})
				.attr('class', 'text-node');
	    //move compartment node to its corrrection position
		allCompartments.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });
        allCompartments.exit().each(function(d){console.warn('removing Compartment : '+d.sId);}).remove();
		//update speceis-node
		var allSpeceis = speciesG.selectAll('.species-node').data(arrSpecies,function(d){return d.sId})
		//add shape
	    allSpeceis.select('path')
		    .attr('d',function(d){
		    	return d3scomos.getSymbol(d.sType,d);
		    })
		    .attr('class', 'species-path')
				.attr('fill',function(d){ if(d.sType.toUpperCase() === 'COMPLEX') return 'url(#complexFill)'; return 'url(#speciesLinear)';});
	    //add text
		allSpeceis.select('text')
		    .attr('text-anchor','middle')
		    //TODO: used static spacing for text make this configurable
		    .attr('x',function(d){return d.iWidth/2;})
		    .attr('y',function(d){return d.iHeight + 15})
		    .text(function(d){return d.sName})
		    .attr('class', 'text-node');
		//transform these nodes there right posistions
		allSpeceis.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });
        //update covalent modification
        allSpeceis.each(function(d){
            var thisNode = d3.select(this);
            thisNode.selectAll('.modifier-node').remove();
            addCovalantModification(thisNode)
        })
        allSpeceis.exit().each(function(d){console.warn('removing species : '+d.sId);}).remove();
		//update reaction nodes
		var allReactions = reactionG.selectAll('.reaction-node').data(arrReactions,	function(d){return d.sId});
		allReactions.select('path')
				.attr('d',function(d){
					return d3scomos.getSymbol('REACTION',d);
				})
				.attr('class', 'reaction-path')
				.attr('fill',function(d){return shapeUtil.getReactionFill(d.sType)});
				// .attr("style", function(d){
				// 				var reactionColor = "rgb("+d.color.iRed+","+d.color.iGreen+","+d.color.iBlue+")";
				// 				//return "fill: "+reactionColor+"; stroke: "+reactionColor+";";
				// 			});
		// add text node
		allReactions.select('text')
				.attr('text-anchor','start')
				//TODO: used static locations assuming node size + 20 + 5 padding
				.attr('x',function(d){return 25;})
				//TODO: used static locations assuming node hiehgt + 20/2 + 5 padding
				.attr('y',function(d){return 15})
				.text(function(d){return d.sName})
				.attr('class', 'text-node');
		// move node to its correct position
		allReactions.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });
        allReactions.exit().each(function(d){console.warn('removing Reaction : '+d.sId);}).remove();
        //Recreate All edges
        updateEdges();
    }
    /**
     * adds edge to the view
     * @param {edge} edge
     */
    function addEdge(edge){
        //remove edges if any and redraw
        edgesG.selectAll('.link').remove();
    	var link = edgesG.selectAll('.link')
    		.data(links,function(d){return d.sId})
    		.enter()
    		.append('path')
    		.attr('class', 'link')
    		.attr('d', function(d){return shapeUtil.getPathCoordsForLine(d.source, d.target, d.role)})
    		.attr("style", function(d){
    				var marker;
    				switch(d.role){
    					case "REACTANT":
    						if(d.reversible) marker = "marker-mid:url(#filledArrow);";
    						else marker = "";//no arrow marker for this one
    					break;
    					case "PRODUCT":
    						marker = "marker-mid:url(#filledArrow);";
    					break;
    					case "MODIFIER":
    						if(d.sModifierType === 'Inhibitor')
    							marker = "marker-mid:url(#Line);";
    						else //defaults ot activator
    							marker = "marker-mid:url(#hollowArrow);";
    						break;
    					case "MODIFIER_INHIBITOR":
    						marker = "marker-mid:url(#Line);";
    						break;
    					case "MODIFIER_ACTIVATOR":
    						marker = "marker-mid:url(#hollowArrow);";
    						break;
    					default:
    						marker = "";
    			}
    			return marker+" stroke:"+d.getColorString()+";";
    		})
    		.on('click', function(){
    				eskinBehaviours.mouseClickedOnEdge(this,selection,panMode);
    			});
    		// link.on('click', dispatch.linkClick)
    		// .on('mouseover', dispatch.linkHover);
    }
    /**
     * removes the node from svg/dom based on elem( sId)
     * @param  {String} speciesId sId of ele
     * @return {D3 selection}  d3 selection pointing to the removed node
     */
    function removeSpeciesNode(speciesId){
        //spliceNodefromNodeArray(arrSpecies,speciesId);
        recreateAllDataArrays();
        update();
        // return d3.selectAll('.species-node')
        //     .filter(function(d){return d.sId === speciesId})
        //     .remove();
    }
    /**
     * removes the reaction node from the view
     * @param  {String} reactionsId reaction node to be removed from view
     * @return {D3 selector}             D3 selector pointing to removed selection
     */
    function removeReactionNode(reactionsId){
        recreateAllDataArrays();
        update();
        // return d3.selectAll('.reaction-node')
        //     .filter(function(d){return d.sId === reactionsId})
        //     .remove();
    }

    /**
     * removes the Compartment node from the view
     * @param  {String} compartmentsId reaction node to be removed from view
     * @return {D3 selector}             D3 selector pointing to removed selection
     */
    function removeCompartment(compartmentsId){
        recreateAllDataArrays();
        update();
        // return d3.selectAll('.compartment')
        //     .filter(function(d){return d.sId === compartmentsId})
        //     .remove();
    }

    function removeEdgeNode(edgeId){
        spliceNodefromNodeArray(links,edgeId);
        return d3.selectAll('.link')
            .filter(function(d){return d.sId === edgeId})
            .remove();
    }
    function recreateAllDataArrays (){
        //clear all data arrays and recreate them
        //and redraw them.
        arrSpecies = d3.values(model.mapSpeciesLayouts);
        arrCompartments = d3.values(model.mapCompartmentLayouts);
        arrReactions = d3.values(model.mapReactionLayouts);
        updateEdges();
    }
    /** return view object **/
    function updateCursor(){
        if(panMode === 'PAN')
            svg.attr('style',svg.attr('style') + 'cursor: pointer;');
        else
            svg.attr('style',svg.attr('style') + 'cursor: default;');

    }
	return {
		/**
		 * clears the canvas deletes all the visual contents and defaults to config params
		 */
		initCanvas : function(){
			d3.select(rootElem).select("svg").remove();
			initCanvas();
		},
        changeGraphRoot : function(_rootElem){
            console.warn(rootElem);
            rootElem = _rootElem;
            selection = new scomosSelections(rootElem);
			initCanvas();
            //trigger hard redraw.
            recreateAllDataArrays();
            arrCompartments.map(this.addNode);
            arrSpecies.map(this.addNode);
            arrReactions.map(this.addNode);
            //reset zoomLevel before values of tab switch
            rootG.attr("transform", "translate(" + zoomBehaviour.translate() + ")scale(" + zoomBehaviour.scale() + ")");
            updateEdges();
            update();
            eskinDispatch.rendered();
        },
		/**
		 * A broker method to add a elem to the view
		 * @param {Compartment|Species|Reaction|Edge} node node to be inserted to view
		 */
		addNode : function(node){
			if(node.getEntityType() === "Species"){
				updateNodeArray(arrSpecies,node);
					addSpecies(node);
			}
			else if(node.getEntityType() === "Compartment"){
				updateNodeArray(arrCompartments,node);
				addCompartment(node);
			}
			else if(node.getEntityType() === "Reaction"){
				updateNodeArray(arrReactions,node);
				addReaction(node);
			}
            else if(node.getEntityType() === 'Edge'){
                updateNodeArray(links,node);
                addEdge(node);
            }
			else{
				throw new Error("Unsupported node type : " +node.getEntityType());
			}
		},
        /**
         * remove node from view
         * @param  {SBML object} node Valid SBML object
         * @return {D3 selection}      reference to removed d3 selection
         */
        removeNode :function(nodesId,nodeType){
            if(nodeType === "Species"){
				return removeSpeciesNode(nodesId);
			}
            else if(nodeType === "Compartment"){
				return removeCompartment(nodesId);
			}
            else if(nodeType === 'Reaction'){
                return removeReactionNode(nodesId);
            }
            else if(nodeType === 'Edge'){
                return removeEdgeNode(nodesId);
            }
			// else if(node.constructor.name === "Compartment"){
			// 	updateNodeArray(arrCompartments,node);
			// 	addCompartment(node);
			// }
			// else if(node.constructor.name === "Reaction"){
			// 	updateNodeArray(arrReactions,node);
			// 	addReaction(node);
			// }
			else{
				throw new Error("Unsupported node type : " +node.constructor.name);
			}
            update();
        },
        updateSpeciesCovalantModification:function(sId){
            updateSpeciesCovalantModification(sId);
        },
		/**
		 * updates the ViewPort to fit the passed vRect
		 * @param  {{top,left,width,height}} vRect [description]
		 * @return {[type]}       [description]
		 */
		fitToScreen:function(){
            var vRect = model.updateModelBoundaries();
			svg.attr("viewBox",vRect.top + " " + vRect.left + " " + vRect.width + " " + vRect.height)
		  	.attr("preserveAspectRatio", "xMinYMin meet");
            rootG.attr('transform','scale(1)');
            zoomBehaviour.translate( [0, 0]);
            zoomBehaviour.scale(1);
		},
        /**
         * Resets the zoom to 1
         * @return {} reset zoom
         */
        resetZoom:function(){
            var transStr = rootG.attr('transform');
            if(!transStr) return;
            var part1 = transStr.split('scale')[0];
            var part2 = 'scale(1)'
            var targetStr = part1.concat(part2);
            rootG.attr('transform',targetStr);
            zoomBehaviour.translate( [0, 0]);
            zoomBehaviour.scale(1);
        },
        /**
         * zooms in
         * @return {number} current zoom level
         */
        zoomIn:function(){
            //var transFactor  = shapeUtil.getScaleAndTransformFromString(rootG.attr('transform'));
            zoomBehaviour.scale(zoomBehaviour.scale()+0.3);
            //rootG.attr("transform","scale(" + zoomBehaviour.scale() + ")");
            rootG.attr("transform", "translate(" + zoomBehaviour.translate() + ")scale(" + zoomBehaviour.scale() + ")");
        },
        zoomOut:function(){
            zoomBehaviour.scale(zoomBehaviour.scale()-0.3);
            rootG.attr("transform", "translate(" + zoomBehaviour.translate() + ")scale(" + zoomBehaviour.scale() + ")");
        },
        normalizeZoomBehaviour:function(){
            zoomBehaviour.scale(zoomBehaviour.scale);
            zoomBehaviour.transform(zoomBehaviour.transform);
        },
		/**
		 * sets the pan Mode
		 * @param  {string } __panMode [description]
		 * @return {[type]}           [description]
		 */
		setPanMode:function(__panMode){
            //clear the selection mode is changed
            if(panMode !== __panMode) {
                d3.selectAll('.selected').classed('selected',false);
                selection.clear();
                resizer.clearResizer();
            }
            panMode = __panMode;
            updateCursor();
        },
		refresh:function(){
            update();
            var vRect = model.updateModelBoundaries();
			svg.attr("viewBox",vRect.top + " " + vRect.left + " " + vRect.width + " " + vRect.height)
		  	.attr("preserveAspectRatio", "xMinYMin meet");
            selection.markSelected();
		},
		/**
		 * apply the gradient pattern on proveded nodes with passed color and second values as violet
		 * @param  {[{geneName:String,color:String}]} overlayNodes genename maps to sName of the node, color is string property of type rgb(int,int,int)
		 *          if no color ignore.
		 * @return finds the specified node in view and applies the said color gradient to it.
		 * @throws {customErrors.ValidationError} throws error if passed in node does not exist.
		 */
		applyGradientsToSpecies:function(overlayNodes){
			overlayNodes.each(function(node){
				// find this node in species map
				var thisSpecies = d3.selectAll('.species-node')
									.filter(function(d){return d.sName.toUpperCase() === node.sName});
				if(!thisNode)
					throw customErrors.ValidationError("Node "+node.sName + " not found in pathway map")
			})
		},
        /**
         * get this views selection object
         * @return {[type]} [description]
         */
        getSelection : function(){
            return selection;
        },
        enableOverlayMode : function(){
            overlayMode = true;
            //unbind all context events
            d3.selectAll('.species-node').on('contextmenu',null);
            d3.selectAll('.reaction-node').on('contextmenu',null);
            d3.selectAll('.compartment').on('contextmenu',null);
            svg.on('contextmenu',null);
        }

	} //return ends here
}
