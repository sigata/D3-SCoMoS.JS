/**
 * This module handles the various model specific selections
 * optimizes the selections and keeps track of various selection data
 * Module will use selectionSet to keep track of selections internally
 *
 *  Note : This module is not exposed outside directly so for testing
 *  retrieve the instance from scomos graph module
 */

/**
 * creates instance of the scomos selections
 * @constructor
 */
function scomosSelections(rootElem)
{
	/** selection set to store various d3 selectors **/
	var __selections = new scomosSelectionSet();
	/** tracks the last selected element **/
	var __lastSelected =null;
	/** root div on which this graph is drawn **/
	//TODO this is bad bad but not seeing any way around this for now
	// everytime __grpahRoot is not set graph root ( root svg ) of current element will be
	// set as __graphRoot
	var __graphRoot = d3.select(rootElem);
	/** selection mode **/
	var __isMultiSelect = false;
    var _OH = objectHelper;//Weired I know. but cannot use _ as it is used by _ library. could be missleading.
    //private helper methods

	/**
	 * sets the last selected element value based on the selection mode
	 * @param {Object} elem
	 * @returns	 sets the lastSelected to this if not multiselect else sets last selecteded to null;
	 */
	function __setLastSelected(elem){

	}
	/**
	 * finds sets  the root svg of passed d3 selection
	 * @param {object} elem
	 * @returns {object} d3 selection pointing to root svg of this graph
	 */
	function __setGraphRoot(elem)
	{

		var thisNode = elem.node();
		while(thisNode.nodeName !== 'svg')
			thisNode = thisNode.parentElement;
		__graphRoot = d3.select(thisNode);
		return __graphRoot;
	}

	/**
	 * return all the children for passed complex
	 * @param {object} elem d3 selection of target complex
	 * @returns array of d3 selection consisting children of this complex
	 */
	function __getAllChildrenOfComplex(elem){
		return (__graphRoot || __setGraphRoot(elem)) //dirty hack but not seeing any way around this
					.selectAll('.species-node')
					.filter(function(d){
						return d.sParentComplex === elem.datum().sId});
	}

	/**
	 * returns all the children ( species,complexes,reaction nodes and compartments)
	 * @param {Object} elem d3 selector pointing to compartment
	 * @returns {[Object]} array of d3 selector containing all children of this compartment
	 */
	function __getAllChildrenOfCompartment(elem){
		/**
		 * Select All group elements in the root g
		 * this gives reference of all the selectable elements i.e. no edges will be selected
		 */
		//this is temp
		return (__graphRoot || __setGraphRoot(elem))
				.select('g') //gives the root g
				.selectAll('g')//gives all the compartments , species and reactions
				.filter(function(d){if(d) return d.sParentCompartment === elem.datum().sId;})
	}
	/**
	 * returns list of all edges of this reaction node
	 */
	function __getEdgesOfReaction(elem){
		//links follow the state of reaction node
		//var thisReaction = node;
		return (__graphRoot || __setGraphRoot(elem)).selectAll('.link')
				.filter(function(thisLink){
					var _source = thisLink.source;
					var _target = thisLink.target;
					var thisID = elem.datum().sId;
					return _source.sId === thisID || _target.sId === thisID;
				});
	}
    function triggerSelectionEvent(){
        var selectionEventData = {};
        var _sel = scomosSelections.getCopiableSelection();
        var isCopiable  = false;
        var isDeletable = false;
        if(_sel.species.length > 0 || _sel.reactions.length > 0){
            isCopiable = true;
        }
        if(Object.keys(__selections.getAllItems()).length > 0){
            isDeletable = true;
        }
        selectionEventData['isCopiable']    = isCopiable;
        selectionEventData['isDeletable']   = isDeletable;
        // var showProperties = d3.selectAll('.selected').size() == 1;
        // selectionEventData['showProperties'] = showProperties;
        // var selectedNode =  d3.select('.selected');
        // if(showProperties) {
        //     selectionEventData['selectedNode'] = selectedNode.node();
        //     selectionEventData['nodeData'] = selectedNode.datum();
        // }

        //eskinDispatch.selectionEvent({isCopiable:isCopiable,showProperties:showProperties});
        //setTimeout(function(){
            eskinDispatch.selectionEvent(selectionEventData);
        //},10);
    }
    /** scomos selections object to be return as instance of this object **/
	var scomosSelections ={};
	// methods to add various model graph nodes to selections
	/**
	 * adds passed species and its children( if complex) to selection
	 * @param {object} d3 selection object pointing to species node
	 * @returns
	 */
	scomosSelections.addSpecies = function addSpecies(elem){
		var that = this;
		__selections.add(elem);
		//make this elem the last selected
		__lastSelected = elem;
		//if this is the complex species add its child to set
		if(elem.datum().sType === 'Complex'){
			console.log("adding complex" + elem.datum().sId)
			//get all species form this complex and add them to selection
			__getAllChildrenOfComplex(elem).each(function(){
				//__selections.add(d3.select(this));
					that.addNode(d3.select(this))
				});
		}
	}

	/**
	 * adds passed covalent modification to selection
	 * @param {object} d3 selection object pointing to covalent modification node
	 * @returns
	 */
	scomosSelections.addModifier = function addModifier(elem){
		var that = this;
		__selections.add(elem);
		//make this elem the last selected
		__lastSelected = elem;
	}

	/**
	 * adds passed reaction and its edges to the selection set
	 * @param {object} d3 selection object pointing to reaction node
	 * @returns
	 */
	scomosSelections.addReaction = function addReaction(elem){
		__selections.add(elem);
		//make this elem the last selected
		__lastSelected = elem;
		//add reaction edges to the selection
		__getEdgesOfReaction(elem).each(function(){__selections.add(d3.select(this))});
	}
	/**
	 * adds passed edge to the selection set
	 * @param {object} d3 selection object pointing to reaction node
	 * @returns
	 */
	scomosSelections.addEdge = function addEdge(elem)
	{
		__selections.add(elem);
		//make this elem the last selected
		__lastSelected = elem;
	}

	/**
	 * adds passed compartment and all its children to the selection
	 * @parent {object} d3 selection pointing to the compartmetn
	 * @returns
	 */
	scomosSelections.addCompartment = function addCompartment(elem){
		console.log("adding Compartment "+elem.datum().sId)
		var that = this;
		//add this compartment to selection
		__selections.add(elem);
		//make this elem the last selected
		__lastSelected = elem;
		//add all nodes with thisCompartment as as sParentCompartment
		__getAllChildrenOfCompartment(elem)
			.each(function(){
				var thisElem = d3.select(this);
				//__selections.add(d3.select(this))
				// successively run addNode method on all childrens of this
				console.log("adding child "+thisElem.datum().sId)
				//if selection does not have this node preAdded
				if(!that.getNode(thisElem.datum().sId))
					that.addNode(thisElem);
			});
	}

	/**
	 * broker method checks element type and calls appropriate function
	 * @param {object} elem d3 selector pointing to the node to be added to selection
	 * @returns
	 */
	scomosSelections.addNode = function addNode(elem){
		//check if compartment
		if(elem.classed('compartment'))
			this.addCompartment(elem);
		//check if species
		else if(elem.classed('species-node'))
			this.addSpecies(elem);
		else if(elem.classed('reaction-node'))
			this.addReaction(elem);
		else if(elem.classed('link'))
			this.addEdge(elem);
		else if(elem.classed('modifier-node'))
			this.addModifier(elem);
		else{
			//TODO: use logger to log this
			console.log("invalid selector passed ");
		}
        triggerSelectionEvent();
	}

	/**
	 * removes the species form selection if it exists
	 * removal wont happen if species is selected or any of its parent is all ready in selection
	 * @param {Object} speciesId speciesId to be removed
	 * @returns {Object} a removed d3 selection
	 */
	scomosSelections.removeSpecies = function removeSpecies(speciesId){
		var thisSpecies = this.getNode(speciesId);
		//not found return empty
		if(!thisSpecies){
			console.log("not valid selector to remove species")
			return null;
		}
		//check if parent of this species are in selected set
		var thisData = thisSpecies.datum();

		if( (thisData.sParentCompartment && this.getNode(thisData.sParentCompartment)) || (thisData.sParentComplex && this.getNode(thisData.sParentComplex)) )
			{
			console.log("parent exists not deleteing");
			return null;
			}
		console.log("continuing with species deletion");
		var returnThis = __selections.remove(thisSpecies);
		//if this is complex remove its  unselected children
		if(thisSpecies.datum().sType === 'Complex'){
			//get all species form this complex and add them to selection
			__getAllChildrenOfComplex(thisSpecies).each(function(){
				var thisElem = d3.select(this);
				//remove if not selected
				if(!thisElem.classed('selected'))
					__selections.remove(thisElem);
				});
		}
		return returnThis;
	}

	/**
	 * removes compartment and all its unselected children from selection
	 */
	scomosSelections.removeCompartment = function removeCompartment(compartId)
	{
		console.log("removing compartment "+compartId);
		var that = this;
		var thisCompartment = this.getNode(compartId);
		//not found return empty
		if(!thisCompartment)
			return null;
		var returnThis = __selections.remove(thisCompartment);
		console.log("compartment "+compartId +" removed successfully");
		//remove all unSelected children
		__getAllChildrenOfCompartment(thisCompartment).each(function(){
			var thisElem = d3.select(this);
				//remove if not selected
				if(!thisElem.classed('selected')){
					//__selections.remove(thisElem);
					//call remove method of each component seperately
					console.log("removing "+thisElem.datum().sId);
					that.removeNode(thisElem);
				}
		});
		return returnThis;
	}

	/**
	 * removes the reaction node and all its edges from the selection
	 */

	scomosSelections.removeReaction = function removeReaction(reactionId){
		var thisReaction = this.getNode(reactionId);
		//not found return empty
		if(!thisReaction)
			return null;
		var returnThis = __selections.remove(thisReaction);
		//remove all the edges belonging to this node
		__getEdgesOfReaction(thisReaction).each(function(){__selections.remove(d3.select(this))});

		return returnThis;
	}
	/**
	 * a broker method for all remove selection methods
	 */
	scomosSelections.removeNode = function removeNode(elem){
		//remove only if valid node
		if(!elem && !elem.datum){
			console.log("invalid selector passed ");
			return null;
		}
		var thisData = elem.datum();
		//check if compartment
		if(elem.classed('compartment'))
			this.removeCompartment(thisData.sId);
		//check if species
		else if(elem.classed('species-node'))
			this.removeSpecies(thisData.sId);
		else if(elem.classed('reaction-node'))
			this.removeReaction(thisData.sId);
		else if(elem.classed('link'))
			this.removeLink(thisData.sId);
		else{
			//TODO: use logger to log this
			console.log("invalid selector passed ");
		}
        triggerSelectionEvent();
	}

	/**
	 * removes all the selection from this selection
	 * @param nothing
	 * @returns cleans up internal selection structure
	 */
	scomosSelections.clear = function clear(){
		//that way old instance will be freed up by the javascript GC
		__selections =  new scomosSelectionSet();
        triggerSelectionEvent();
	}
	//methods to get selection states and statics( if any)

	//methods to get selections
	/**
	 * returns node form current selection based on the needle ( could be a string or an object)
	 * @param {(string|object)} needle - look for needle or needle.datum().sId
	 * @returns {object} returns found node from selection otherwise null
	 */
	scomosSelections.getNode = function getNode(needle){
		if(objectHelper.isString(needle))
			return __selections.getItem(needle);
		//must be object get needle and return
		return needle.hasOwnProperty('datum')?__selections.getItem(needle.datum().sId):null;
	}
	/**
	 * return last selected node( selected by user click)
	 * @returns {Object} d3 selection pointing to last selected
	 */
	scomosSelections.getLastSelectedNode = function getLastSelectedNode(){
		return __lastSelected;
	}

	/**
	 * returns the draggable selection from current selection
	 * @returns {[object]} psudeo d3 selector pointing to all dragable elements
	 */
	scomosSelections.getDraggableSelection = function getDraggableSelection(){
		var returnThis = [];
		var allSelected = __selections.getAllItems();
		for(var item in allSelected){
            //remove edges from active selection if any as edges are not draggable
			if(allSelected[item].datum().getEntityType() !== 'Edge'){
                returnThis.push(allSelected[item]);
            }
		}
		return returnThis;
	}

    /**
     * returns the destructible selection categoriwise
     * @return {'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]} destructible selection categoriwise
     */
    scomosSelections.getDestructableSelection = function(){
        var returnThis = {'compartments':[],'species':[],'reactions':[],'edges':[],'modifications':[]};
        var dSelection = d3.values(__selections.getAllItems());
        dSelection.map(function(node){
                var d = node.datum();
                var edgesSIds = returnThis.edges.map(function(e){return e.sId});
                switch (d.getEntityType()) {
                    case 'Compartment':
                        returnThis.compartments.push(d);
                        break;
                    case 'Species':
                        returnThis.species.push(d);
                        d.getAllEdges().map(function(edge){
                                if(edgesSIds.indexOf(edge.sId) == -1)
                                    returnThis.edges.push(edge)
                            });
                        break;
                    case 'Reaction':
                        returnThis.reactions.push(d);
                        d.getAllEdges().map(function(edge){
                                if(edgesSIds.indexOf(edge.sId) == -1)
                                    returnThis.edges.push(edge)
                            });
                        break;
                    case 'Edge':
                        if(edgesSIds.indexOf(d.sId) == -1)
                            returnThis.edges.push(d);
                        break;
                    case 'Modification':
                        returnThis.modifications.push(d);
                        break;
                    default:
                        __logger.warn('scomosSelections : invalid node type : ' + d.getEntityType() +'in getDestructableSelection');
                }
            }
        );
        //update destructible selection by looking at reactions that needs to be deleted by inference
        //IMPORTANT : this is soft delete operations to figure out which reactions needs to be removed as there mendatory edges are removed
        /**Store edges ids reaction wise **/
        var rEdgeGroup = {};
        returnThis.edges.forEach(function(edge){
            //dont process modifiers
            if(edge.role !== 'MODIFIER'){
                var rNode = edge.getParentReaction();
                if(!rEdgeGroup[rNode.sId])
                    rEdgeGroup[rNode.sId] = [];
                rEdgeGroup[rNode.sId].push(edge);
            }
        });
        console.log(rEdgeGroup);
        //for every array in edge group get reference reaction
        //get sIds of all mendatory edges verify count and sIds
        //if mathched add this reaction to deletion selection
        //add all edges(mendatory are allredy added add modifiers) of this reaction to deletion also

        d3.values(rEdgeGroup).forEach(function(arrEdges){
            var thisReaction = arrEdges[0].getParentReaction();
            var arrEdgesSids = arrEdges.map(function(edge){return edge.sId}).sort();
            var medatoryEdges = thisReaction.getProductEdges().concat(thisReaction.getReactantEdges());
            var mendatoryEdgesSids = medatoryEdges.map(function(edge){return edge.sId}).sort();
            if(objectHelper.compareStringArray.call(arrEdgesSids,mendatoryEdgesSids)){
                console.log(thisReaction);
                var reactionsIds = returnThis.reactions.map(function(r){return r.sId});
                if(reactionsIds.indexOf(thisReaction.sId) == -1){
                    returnThis.reactions.push(thisReaction);
                }
                var edgesSIds = returnThis.edges.map(function(e){return e.sId});
                thisReaction.getAllEdges().map(function(edge){
                        if(edgesSIds.indexOf(edge.sId) == -1) returnThis.edges.push(edge)
                });
            }
            else {
                console.log('Reaction not affected '+thisReaction.sId);
            }
        })
        return returnThis;
    }
    /**
     * returns the copiable seleciton
     * @return {{species:[Speceis],reactions:[Reaction]}} returns copiable seleciton, usable by clipboard module.
     */
    scomosSelections.getCopiableSelection = function(){
        var returnThis = {'species':[],'reactions':[]};
        //get all nodes
        //copy all species
        //copy all reactions
        //copy all reaction species.
        var dSelection = d3.values(__selections.getAllItems());
        dSelection.map(function(node){
                var d = node.datum();
                if(!d) {console.warn(d); return;}
                switch (d.getEntityType()) {
                    case 'Species':
                        if(!objectHelper.isNodeInArray(returnThis.species,d.sId))
                            returnThis.species.push(_OH.deepCopyNodeObject(d));
                        break;
                    case 'Reaction':
                        if(!objectHelper.isNodeInArray(returnThis.reactions,d.sId)){
                            returnThis.reactions.push(_OH.deepCopyNodeObject(d));
                            d.getAllconnectedSpecies().map(function(species){
                                if(!objectHelper.isNodeInArray(returnThis.species,species.sId)){
                                    returnThis.species.push(_OH.deepCopyNodeObject(species));
                                }
                            });
                        }
                        break;
                    default:
                        //no need to do anything here. just ignore invalid nodes.
                }
        });
        return returnThis;
    }
	/**
	 * updates dragable selections parent child property
	 * TODO: is this the right place for thsi function
	 * @param {object} object of modeldata
	 * @returns updates dragable selection
	 */
	scomosSelections.updateDraggableSelection = function updateDraggableSelection(__modelDataApi){
		/*
		 * Algo :
		 *		Step 1: construct update selection
		 *			if parent of this not in selection add to updatable selection
		 *		setp 2: update nodes in updatable selection
		 */
		var modelData =  __modelDataApi || __modelDataApi.getModelData();
		var updateThis = [];
		var allItems = __selections.getAllItems();
		console.log(allItems);
		var validateAll = false;
		for(var sId in allItems){
			//console.log(this.getNode(d3.select(allItems[sId]).datum()));
			var thisNode = allItems[sId];
			var thisNodeData = allItems[sId].datum();
			try{
				if(thisNodeData.sParentCompartment && !this.getNode(thisNodeData.sParentCompartment)){
					updateThis.push(thisNode);
					if(thisNode.classed('compartment'))
						validateAll = true;
				}
			}
			catch(err) {
			  console.log("failed to add "+thisNode.sId + " to selection");
			}
		}
		//add all compartment whose parent is not selected
		if(validateAll){
			var that = this;
			__graphRoot.selectAll('.compartment').filter(function(d){
				if(d.sParentCompartment && !that.getNode(d.sParentCompartment))
					updateThis.push(d3.select(this));
			});
			//add all species whose paernt is not in selected
			__graphRoot.selectAll('.species-node').filter(function(d){
				if( (d.sParentCompartment && !that.getNode(d.sParentCompartment)) ||( d.sParentComplex && !that.getNode(d.sParentComplex)))
					updateThis.push(d3.select(this));
			})

			//add all reactions whose parent is not in selected
			__graphRoot.selectAll('.reaction-node').filter(function(d){
				if(d.sParentCompartment &&!that.getNode(d.sParentCompartment))
					updateThis.push(d3.select(this));
			})
		}

		//run following only if update selectin contains the compartment
		var flagUpdateAll = false;

		updateThis.forEach(function(thisNode){
			//call updater based on type
			//TODO: refactor to one broker method
			try{
				var thisData = thisNode.datum();
				//check if compartment
				if(thisNode.classed('compartment')){
					modelValidator.updateComptParents(modelData.mapCompartmentLayouts,thisData);
					flagUpdateAll = true;
				}
				//check if species
				else if(thisNode.classed('species-node'))
					modelValidator.updateSpeciesParents(modelData.mapCompartmentLayouts,modelData.mapSpeciesLayouts,thisData);
				else if(thisNode.classed('reaction-node'))
					modelValidator.updateReactionParents(modelData.mapCompartmentLayouts,thisData);
				else if(thisNode.classed('link'))
					console.log("Not updating edges");//do nothing
				else{
					//TODO: use logger to log this
					console.log("invalid selector passed ");
				}
			}
			catch(err){
				console.log("failed parent update on "+thisData.sId + err)
			}
		});
		//if (flagUpdateAll){ __modelDataApi.updateAllParents(true);}
	}
	/**
	 * added to support select refresh mode
	 */
	scomosSelections.markSelected = function(){
		var allSelected = __selections.getAllItems();
		for(var prop in allSelected){
			if(allSelected.hasOwnProperty(prop)){
				try {
					var selected = allSelected[prop]
					if (!selected.classed('selected')){
						break;
					}
					var selData= selected.datum();
					//find this in current canvas and mark it selected
					var thisClass = selected.attr('class').split(' ')[0];
					d3.selectAll('.'+thisClass)
						.filter(function(d){
							return d.sId === selData.sId;
						})
						.classed('selected',true);
				}
				catch (e){
					console.log("error while applying selection"+e.message);
				}
			}
		}
		//now clear the selection and add selected to set again
		__selections.clear();//clear the selection
		var that = this;
		d3.selectAll('.selected').each(function(){
			var thisNode = d3.select(this);
			//add this to this to newly formed selection set
			that.addNode(thisNode);
		})
	}
    /**
     * returns the visually selected items.
     * @return {D3 selection} selection with all vusally selected nodes.
     */
    scomosSelections.getSelectedNodes = function(){
        return __graphRoot.selectAll('.selected');//TODO: fix it. Shuld return from selection set.
    }
    /** return scomosSelections object **/
	return scomosSelections;
}
