var modelHelper = d3scomos.modelHelper = {};

/**
 * Model Helper : This helper will contain re-usable codes required while drawing
 * various graph constructs ( generally re factored code form scomosGraph.js will go here
 * @param reactionList {object} d3 selection as input
 * @param speciesNodes {object} d3 selection as input
 * @return  array of links
 **/
modelHelper.getEdgeList = function getEdgeList(reactionList,speciesNodes){
	var links = [];
	if(!reactionList || !speciesNodes)
		return links;
	reactionList.forEach(function(reaction){
		var thisReaction = reaction;
		var _color = "rgb("+thisReaction.color.iRed+","+thisReaction.color.iGreen+","+thisReaction.color.iBlue+")";

		//assume this node as source node
		// find product nodes and add them as targets
		//mapProducts: {Species_2: {bConstant: true, rStoichiometry: 1, sSpeciesRole: "Product", sModifierType: ""}}
		for(var sId in thisReaction.mapProducts){
			var thisMap = thisReaction.mapProducts;
			var _targetNode = speciesNodes.filter(function(s){
				return s.sId === sId;
			})[0];

			var thisEdge = thisMap[sId];

			//add species name to the map species reference ( property explorer needs this)
			thisEdge.sName = _targetNode.sName;

			var _role = thisEdge['sSpeciesRole'];
			var _stoichiometry = thisEdge['rStoichiometry'];
			var _constant = thisEdge['bConstant'];
			if(_targetNode){
				links.push({
				sId : thisReaction.sId+':'+_targetNode.sId,
				source: thisReaction,
		        target: _targetNode,
		        role: _role,
		        color: _color,
		        stoichiometry:_stoichiometry,
		        constant:_constant,
		        updateEdge:function(obj){
		        	if(obj.hasOwnProperty("stoichiometry")){
		        		thisEdge['rStoichiometry'] = obj["stoichiometry"];
		        	}

		        	if(obj.hasOwnProperty("constant")){
		        		thisEdge['bConstant'] = obj["constant"];
		        	}
		        }
				});
			}
		}
		//assume this node as target
		//find reactant nodes add them as source
		//mapReactants: {S_3: {bConstant: false, rStoichiometry: 1, sSpeciesRole: "Reactant", sModifierType: ""}}
		for(var sId in thisReaction.mapReactants)
			{
				var thisMap = thisReaction.mapReactants;

				var _sourceNode = speciesNodes.filter(function(s){
					return s.sId === sId;
				})[0];

				var thisEdge = thisMap[sId];

				//add species name to the map species reference ( property explorer needs this)
				thisEdge.sName = _sourceNode.sName;

				var _role = thisEdge['sSpeciesRole'];
				var _stoichiometry = thisEdge['rStoichiometry'];
				var _constant = thisEdge['bConstant'];
				var isReversible=false; //is this edge part of reversible
				if(thisReaction.bIsReversible){
					isReversible:true;
				}
				if(_sourceNode){
					links.push({
					sId : _sourceNode.sId+'-'+thisReaction.sId,
					//Intentionally swapped source and target of this type of link, so as to display the marker near source
					source: thisReaction,
			        target: _sourceNode,
			        role: _role,
			        color: _color,
			        stoichiometry:_stoichiometry,
			        constant:_constant,
			        reversible:isReversible,
			        updateEdge:function(obj){
			        	if(obj.hasOwnProperty("stoichiometry")){
			        		thisEdge['rStoichiometry'] = obj["stoichiometry"];
			        	}

			        	if(obj.hasOwnProperty("constant")){
			        		thisEdge['bConstant'] = obj["constant"];
			        	}
			        }
					});
				}
			}

		//assume this node as target
		//find modifier nodes  add them as source
		//mapModifiers: {S_17: {bConstant: false, rStoichiometry: -1, sSpeciesRole: "Modifier", sModifierType: "Inhibitor"},…}
		for(var sId in thisReaction.mapModifiers)
			{
				var thisMap = thisReaction.mapModifiers;
				var _sourceNode = speciesNodes.filter(function(s){
					return s.sId === sId;
				})[0];
				var thisEdge = thisMap[sId];

				var _role = thisEdge['sSpeciesRole'];
				//add species name to the map species reference ( property explorer needs this)
				thisEdge.sName = _sourceNode.sName;

				//var _stoichiometry = thisEdge['rStoichiometry'];
				//var _constant = thisEdge['bConstant'];
				var _modifierType = thisEdge['sModifierType'];


				if(_sourceNode){
					links.push({
					sId : _sourceNode.sId+'-'+thisReaction.sId,
					source: _sourceNode,
			        target: thisReaction,
			        role: _role,
			        color: _color,
			        modifierType:_modifierType
					});
				}
			}
		//console.log('** reaction node '+reaction);
	});
	return links;
}

/**
 * @param speciesNode {object} d3 selection as input
 * @return  array of modifiers
 **/
modelHelper.getModifierListOfNode = function getEdgeList(speciesNode){
	var _modifiers = [];
	var _modifiersOfCurrentSpecies = speciesNode.sModification.split("-");
	var index = 0;
	for(var modifier in _modifiersOfCurrentSpecies){
		if(_modifiersOfCurrentSpecies[modifier] != ""){
			_modifiers.push({
                //sId:speciesNode.sId+'covalent_'+pos,
				parentSpecies : speciesNode,
				modificationType : _modifiersOfCurrentSpecies[modifier],
				pos : index,
                getEntityType: function(){return 'Modification';},
                changeModificationType:function(newVal){
                    var splitStr = this.parentSpecies.sModification.split("-");
                    if(!newVal || newVal === "")
                        splitStr.splice(this.pos,1);
                    else
                        splitStr[this.pos] = newVal;

                    if(splitStr.length == 0) return this.parentSpecies.sModification = "";//all covalent nodes deleted

                    this.parentSpecies.sModification = splitStr.reduce(function(previousValue, currentValue) {
                                        return previousValue + '-' + (currentValue?currentValue:"");
                                    });

                }
			});
		}
		index = index + 1;
	}
	return _modifiers;
}


/**
 * marks the passed reaction and its edges as selected
 * @param {object} d3 selection as input
 * @return  marks this node as selected and if valid reaction node selects all its edges
 */

modelHelper.selectNode = function selectNode(node){
	node.classed('selected',true);
	if(node.classed("reaction-node"))
	{
		//links follow the state of reaction node
		var thisReaction = node;
		d3.selectAll('.link').filter(function(thisLink){
			var _source = thisLink.source;
			var _target = thisLink.target;
			var thisID = thisReaction.datum().sId;
			return _source.sId === thisID || _target.sId === thisID;
		}).classed('selected',thisReaction.classed('selected'));
	}
}

modelHelper.selectNodesByData = function(toBeselected,options){
    //clear selection if any.
    d3.selectAll('.selected').classed('selected',false);
    var allCompartmentNodes = d3.selectAll('.compartments');
    if(toBeselected.hasOwnProperty('compartments')){
        toBeselected.compartments.forEach(function(compartment){
                    allCompartmentNodes.filter(function(d){return d.sId === compartment.sId})
                                        .each(function(){
                                            modelHelper.triggerClickOnNode(d3.select(this),true)
                                        })
            });
    }
    var allSpeciesNodes = d3.selectAll('.species-node');
    if(toBeselected.hasOwnProperty('species')){
        toBeselected.species.
            forEach(function(species){
                allSpeciesNodes.filter(function(d){return d.sId === species.sId})
                                .each(function(){
                                    modelHelper.triggerClickOnNode(d3.select(this),true)
                                })
            });
    }
    var allReactionNodes = d3.selectAll('.reaction-node');
    if(toBeselected.hasOwnProperty('reactions')){
        toBeselected.reactions.
            forEach(function(reaction){
                allReactionNodes.filter(function(d){return d.sId === reaction.sId})
                                .each(function(){
                                    modelHelper.triggerClickOnNode(d3.select(this),true)
                                })
            });
    }
    var allEdgeNodes = d3.selectAll('.link');
    if(toBeselected.hasOwnProperty('edges')){
        toBeselected.edges
            forEach(function(edge){
                allEdgeNodes.filter(function(d){return d.sId === edge.sId})
                            .each(function(){
                                modelHelper.triggerClickOnNode(d3.select(this),true)
                            })
            });
    }
}
/**
 * updates/redraws/transform node to its correct poistion
 * @return {[type]} [description]
 */
modelHelper.updateNodeView = function(node){
    console.warn('classed for resi '+node.attr('class'));
    if(node.classed('species-node')){
        node.select('path')
    	    .attr('d',function(d){
    		    return d3scomos.getSymbol(d.sType,d);
    		})
    	    //.attr('class', 'species-path')
        	//.attr('fill',function(d){ if(d.sType.toUpperCase() === 'COMPLEX') return 'url(#complexFill)'; return 'url(#speciesLinear)';});
            //add text
    	node.select('text')
    	    //.attr('text-anchor','middle')
    	    //TODO: used static spacing for text make this configurable
    	    .attr('x',function(d){return d.iWidth/2;})
    	    .attr('y',function(d){return d.iHeight + 15})
    	    .text(function(d){return d.sName})
    	    //.attr('class', 'text-node');

    	//transform these nodes there right posistions
    	node.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });
    }else if(node.classed('compartment')){
        console.warn('resizing compartment_node');
        node.select('.compartment-path')
			.attr('d',function(d){
				if(d.sType == "RECTANGULAR"){
					return shapeUtil.getRoundedRectWithTickness(d.iHeight, d.iWidth,10);
				}else if(d.sType == "CIRCULAR"){
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
		node.select('text-node')
				//.attr('text-anchor','middle')
				//TODO: used static spacing for text make this configurable
				.attr('x',function(d){return 0;})
				.attr('y',function(d){return d.iHeight + 15})
				.text(function(d){return d.sName});
				//.attr('class', 'text-node');
	    //move compartment node to its corrrection position
		node.attr("transform", function(d){ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });

    }
}

/**
 * maps event cordinates to viewPort co-ordinates
 * @param  {String} rootElem fully qualified div selector
 * @param  {D3 mouse event} event    d3 mouse event whose co-ords are to be transfored
 * @return {{iX:Number,iY:Number}}   view port specific co-ordinates
 */
modelHelper.getTransformedCordinates = function(rootElem,event){
    // fetch actual co ordinates using the CTM transform
    var root = d3.select(rootElem).select('#rootG').node();
    if(d3.select(rootElem).node().tagName === 'svg'){
        var svg = d3.select(rootElem).node();
    }
    else {
        var svg = d3.select(rootElem).select('svg').node();
    }
    var uupos = svg.createSVGPoint();
    var evt = event;
    uupos.x = evt.clientX;
    uupos.y = evt.clientY;

    var ctm = root.getScreenCTM();
    var iCtm = ctm.inverse();
    uupos = uupos.matrixTransform(iCtm)
    var gTransformMatrix = root.transform.baseVal.consolidate();
    uupos.matrixTransform(gTransformMatrix.matrix.inverse());
    return {iX:uupos.x,iY:uupos.y};
}
/**
 * Optiosn required to construct object
 * @param {String} objectType object type to be constructed
 * @param  {Object} options default required to init SBML object
 * @return {SBML Object}    retursn one of various SBML object supported
 */
modelHelper.getSBMLObject = function(objectType,options){
    switch (objectType) {
        case 'SPECIES':

            break;
        case 'COMPARTMENT':

            break;
        default:

    }
}

/**
 * trigger mouse click on provided node.
 * @param  {D3 selector} node D3 selector poinging to node
 * @return {}
 */
modelHelper.triggerClickOnNode = function(node,isCtrlPressed){
    var domNode = node.node();
    // var e = document.createEvent('UIEvents');
    // e.initUIEvent("click", true, true, window, 1);

    var mouseClick = new MouseEvent('click',{ctrlKey:isCtrlPressed});
    //construnction node disable accordingly
    //reset the tools if DISCONTINUOS construnction mode
    domNode.dispatchEvent(mouseClick);
}
/**
 * returns the pastable selection by applying the transforms and genrating new layout and new Sids
 * @param  {{speceis:[Species],reactions:[Reactions]}} toBePasted selection that is to be pasted.
 * @param  {KeyStore} keyStore   instace of active keyStore.
 * @return {{speceis:[Species],reactions:[Reactions]}}            [description]
 * @throws {error} if conversion failed due to some reason.
 */
modelHelper.getPastableSelection = function (toBePasted,keyStore,pasteAt){
    try{
        /**
         * ID map to maintain mapping of newly generated ids to old ids
         * @type {{sId:{oldSid:Sid,newSId:newSid,isProcessed:Boolean}}}
         */
        var sIdMap = {};
        toBePasted.species.forEach(function(species){
            //generate new key store with old one
            sIdMap[species.sId] = {oldSid:species.sId,newSid:keyStore.getNextSpecies(),isProcessed:false}
        });
        toBePasted.reactions.forEach(function(reaction){
            //generate new key store with old one
            sIdMap[reaction.sId] = {oldSid:reaction.sId,newSid:keyStore.getNextReaction(),isProcessed:false}
        });
        //apply these sid to collection
        toBePasted.species.forEach(function(species){
            var oldSid = species.sId;
            species.sId = sIdMap[oldSid].newSid;//update this Speceis
            if(species.sParentComplex){
                if(sIdMap[species.sParentComplex]){
                    species.sParentComplex = sIdMap[species.sParentComplex].newSid;
                }
            }
        });
        toBePasted.reactions.forEach(function(reaction){
            reaction.sId = sIdMap[reaction.sId].newSid;
            //update all submaps of this reaction
            var newMapProducts = {};
            d3.keys(reaction.mapProducts).forEach(function(productSId){
                newMapProducts[sIdMap[productSId].newSid] = reaction.mapProducts[productSId];
            })
            reaction.mapProducts = newMapProducts;

            var newMapReactants = {};
            d3.keys(reaction.mapReactants).forEach(function(reactantSId){
                newMapReactants[sIdMap[reactantSId].newSid] = reaction.mapReactants[reactantSId];
            })
            reaction.mapReactants = newMapReactants;

            var newMapModifiers = {};
            d3.keys(reaction.mapModifiers).forEach(function(modifierSId){
                newMapModifiers[sIdMap[modifierSId].newSid] = reaction.mapModifiers[modifierSId];
            })
            reaction.mapModifiers = newMapModifiers;
        });
        //apply tranformations
        //process all complexes first
        if(!pasteAt){
            pasteAt = {iX:10,iY:10};
        }

        var tX      = pasteAt.iX || 10;
        var tY      = pasteAt.iY || 10;
        var xSpace  = 10;
        toBePasted.species.forEach(function(species){
            if(species.sType.toUpperCase() === 'COMPLEX'){
                var transVector = {x: (tX - species.position.iX), y: (tY - species.position.iY)};
                species.position = {iX:tX,iY : tY};
                species.isProcessed = true;
                toBePasted.species.forEach(function(childSpecies){
                    if(!childSpecies.isProcessed && childSpecies.sParentComplex === species.sId){
                        console.warn('tranforming the complex child : '+childSpecies.sId);
                        console.warn(transVector);
                        console.warn(childSpecies.position);
                        var newPos = {iX : childSpecies.position.iX + transVector.x,
                                      iY : childSpecies.position.iY + transVector.y}
                        // childSpecies.position.iX += transVector.x;
                        // childSpecies.position.iY += transVector.y;
                        childSpecies.position = newPos;
                        console.warn(childSpecies.position);
                        childSpecies.isProcessed = true;
                    }
                });
                tX += species.iWidth + xSpace;
            }
        });
        //process species that are not processed yet
        toBePasted.species.forEach(function(species){
            if(!species.isProcessed){
                console.warn(species.sId);
                species.position = {iX:tX,iY : tY};
                species.isProcessed = true;
                tX += species.iWidth + xSpace;
            }
        });
        //process reactions
        toBePasted.reactions.forEach(function(reaction){
            //get first product
            var firstProductSId = d3.keys(reaction.mapProducts)[0];
            //get first reaction
            var firstReactantSId = d3.keys(reaction.mapReactants)[0];
            if(firstProductSId && firstReactantSId){
                var firstProduct    = toBePasted.species.filter(function(elem){return elem.sId === firstProductSId})[0];
                var firstReaction   = toBePasted.species.filter(function(elem){return elem.sId === firstReactantSId})[0];
                var newPos = shapeUtil.getMidPoint(firstProduct,firstReaction);
                reaction.position = newPos;
            }
            else if(firstReactantSId){
                //get the species
                //move the shape to the 100px right of vertical center of the shape.
                var firstReaction   = toBePasted.species.filter(function(elem){return elem.sId === firstReactantSId})[0];
                var newPos = {iX:firstReaction.position.iX + firstReaction.iWidth + 100,
                              iY:firstReaction.position.iY + (firstReaction.iHeight/2) }
                reaction.position = newPos;
            }
            else if(firstProductSId){
                //get the species
                //move the shape to the 100px right of vertical center of the shape.
                var firstProduct    = toBePasted.species.filter(function(elem){return elem.sId === firstProductSId})[0];
                var newPos = {iX : (firstProduct.position.iX + firstProduct.iWidth + 100),
                              iY : (firstProduct.position.iY + (firstProduct.iHeight/2)) }
                reaction.position = newPos;
            }
            reaction.isProcessed = true;
        });
        return toBePasted;
    }
    catch(err){
        __logger.error('modelHelper-gePastableSelection failed : '+err.message)
    }
}

/**
 * handles the externally triggered node selection.
 * @param  {d3 selector} node        non empty node selector.
 * @param  {instanceOf scomosSelections} selection   active instanceOf scomosSelections.
 * @param  {Boolean} ctrlPressed is ctrl pressed.
 * @return {}  Selects or deselects one or more nodes based on the parameters passed.
 */
modelHelper.handleExternalNodeSelection = function(node,selection,ctrlPressed){
    if(!ctrlPressed){
		d3.selectAll('.selected').classed("selected", false);
		//clean up the selection
		selection.clear();
		modelHelper.selectNode(node);
		//clean up the selection
		selection.addNode(node);
        if(!node.classed('reaction-node')) resizer.addResizer(node);
	}
	else{
		//toggle speciesSelection
		resizer.clearResizer();
		node.classed('selected',!node.classed('selected'));
		//add to selection if it is selected
		if(node.classed('selected')){
            modelHelper.selectNode(node);
            selection.addNode(node);
        }
		else
			selection.removeNode(node);

	}
}
