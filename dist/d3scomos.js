(function (window) {
    'use strict';
  
/**
 * Defines global d3Scomos object for export 
 */
//var d3scomos = d3.scomos = {version: "0.0.1"}; //library version
var d3scomos = {version: "0.0.1"}; //library version

/** private method to init library instance with dependencies
 * @param {Object} config object with options defined
 */
function __initInternals(thisLib,config)
{
	var $$ = thisLib;
	/** add d3 to current scope **/
	$$.d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require("d3") : undefined;
	$$.options = config.options || {};
	$$.modelData = config.modelData ||{};
}
/**
 * initializes the d3scomos library with passed config object
 * @param accepts config json has format {options,modelData}
 */
d3scomos.init = function(config)
{
	//init base dependencies
	/** default config options add new as required **/
	var __options = {height:1000,width:1000,
					 autoSizeOnDrag:true,
					 onStartScaleToFit:true
				 	}
	var __config = {options: config.options || __options , modelData :config.modelData || {} }
	__initInternals(this,__config);
}
/** d3scomos modeldata handling apis 
 * Creates various lists and provides setters and getters to access model data
 * @constructor
 * @param modelData {object} valid scomos model json
 **/
     
  function ModelDataApi (__modelData) {
	/** private holds data for current graph **/
	  var __speciesList,
	  	__compartmentList,
	 	__reactionList,
	 	__productList,
	 	__reactantList;
	  
	  var __graphHeight, __graphWidth;
	  
	 if(__modelData)	 
		 __initLists();
	
	/**
	 * process the __modelData to initialize various lists
	 * 
	 * @param 
	 * @returns
	 * 
	 */
	function __initLists()
	{
		__speciesList = {}, 
		__compartmentList = {},
	 	__reactionList = {},
	 	__productList = {},
	 	__reactantList = {};
		//before initializing lists validate data
		//TODO : should log any discrepancies found in the data while validating
		/** validate compartment : init compartments parent propety **/
		modelValidator.setComptParents(__modelData.mapCompartmentLayouts);
		/** set parents of reaction nodes **/
		//TODO refactor these ad hoc model changes to another function
		modelValidator.setReactionParents(__modelData.mapReactionLayouts, __modelData.mapCompartmentLayouts);
		//create __speciesList
		var speciesData = __modelData.mapSpeciesLayouts;
		__speciesList = arrayUtil.objectToArray(speciesData);
		
		var compartmentsData = __modelData.mapCompartmentLayouts;
		__compartmentList = arrayUtil.objectToArray(compartmentsData);
		
		var reactionsList = __modelData.mapReactionLayouts;
		__reactionList = arrayUtil.objectToArray(reactionsList);
		
		//set height and width from default compartment
		updateHeightWidth();
	}
	
	/** gets height and width form default compartment **/
	function updateHeightWidth()
	{
		var defaultCompartment = __modelData.mapCompartmentLayouts["default"];
		
		//if there is no default compartment
		//take extreme boundary points and use them
		
		/**
		 * TODO : until we figure out better way this is dirty hack
		 * 
		 */
		if(!defaultCompartment){
			//add defualt compartment
			var defCompart = {};
			var boundaryPoints = this.getBoundaryPoints();
			defCompart["position"]["iPostionX"] = boundaryPoints.xNeg;
			defCompart["position"]["iPostionY"] = boundaryPoints.yNeg;
			
			defCompart.iWidth = boundaryPoints.xPos - boundaryPoints.xNeg;
			defCompart.iWidth = boundaryPoints.yPos - boundaryPoints.yNeg;
			//add this to default list
			__modelData.mapCompartmentLayouts["default"] = defCompart;
			//reinit defCompart
			defaultCompartment = __modelData.mapCompartmentLayouts["default"];
		}
		else{
			__graphHeight = defaultCompartment.iHeight;
			__graphWidth = defaultCompartment.iWidth;
			}
	}
	/** exports this **/
	var dataApi ={};
	/**
	 * updates current modelData with the passed data
	 * and updates dependent lists
	 */
	dataApi.setData = function(modelData)
	{
		__modelData = modelData;
		//update lists with new Data
		__initLists();
	}
	
	/**
	 * get modeldata
	 * @returns {object} a model data
	 */
	dataApi.getModelData =function()
	{
		return __modelData;
	}
	dataApi.getSpeciesList = function() {
		return __speciesList;
	};
	
	dataApi.getCompartmentList = function(){
		return __compartmentList;
	};
	
	dataApi.getReactionList = function(){
		return __reactionList;
	};
	
	dataApi.getHeight = function()
	{
		return __graphHeight;
	}
	dataApi.getWidth = function()
	{
		return __graphWidth;
	}
	//TODO add tests for these functions
	
	dataApi.getBoundaryPoints = function()
	{
		var _xPos = 0,_xNeg = 0,_yPos = 0,_yNeg = 0;
		
		for(var s in __speciesList)
			{
			  var curr = __speciesList[s];
			  
			  if(curr.position.iX>0)
				  _xPos = curr.position.iX > _xPos ? curr.position.iX:_xPos;
			  else
			  {
				  _xNeg = curr.position.iX < _xNeg ? curr.position.iX:_xNeg;
			  }
			  
			  if(curr.position.iY>0)
				  _yPos = curr.position.iY > _yPos ? curr.position.iY:_yPos;
			  else
			  {
				  _yNeg = curr.position.iY < _yNeg ? curr.position.iY:_yNeg;
			  }
			}
		//do this for compartments
		for(var cId in __compartmentList)
		{	
		  var curr = __compartmentList[cId];
		  
		  if(curr.position.iX>0)
			  _xPos = curr.position.iX > _xPos ? curr.position.iX:_xPos;
		  else
		  {
			  _xNeg = curr.position.iX < _xNeg ? curr.position.iX:_xNeg;
		  }
		  
		  if(curr.position.iY>0)
			  _yPos = curr.position.iY > _yPos ? curr.position.iY:_yPos;
		  else
		  {
			  _yNeg = curr.position.iY < _yNeg ? curr.position.iY:_yNeg;
		  }
		}
		/*var extremeXs ={xPos:,xNeg:};
		var extremeYs ={yPos:,yNeg:};*/
		return {xPos:_xPos,xNeg:_xNeg,yPos:_yPos,yNeg:_yNeg};
	}
	dataApi.getModelStats = function()
	{
		return {species : __speciesList.length,
				reactions : __reactionList.length,
				edges : d3.selectAll('.link')[0].length,/* because we are not tracking edge count*/
				compartments : __compartmentList.length
			};
	}
	
	dataApi.updateAllParents = function updateAllParents(updateSpecies){
		updateSpecies = updateSpecies || false;
		//before initializing lists validate data
		//TODO : should log any discrepancies found in the data while validating
		/** validate compartment : init compartments parent propety **/
		modelValidator.setComptParents(__modelData.mapCompartmentLayouts);
		/** set parents of reaction nodes **/
		//TODO refactor these ad hoc model changes to another function
		modelValidator.setReactionParents(__modelData.mapReactionLayouts, __modelData.mapCompartmentLayouts);
		//update species 
		//__modelData.mapSpeciesLayouts.forEach(function)/
		if(updateSpecies){
			for(var sId in __modelData.mapSpeciesLayouts){
				modelValidator.updateSpeciesParents(__modelData.mapCompartmentLayouts,__modelData.mapSpeciesLayouts,__modelData.mapSpeciesLayouts[sId]);
			}
		}
	}
	/**
	 * store scomos selection object in model json to maintain states on redraw
	 * @param {scomosSelection} selection
	 */
	dataApi.storeScomosSelection = function(selection){
		var scomosData = __modelData['scomosData'] = __modelData['scomosData'] ||  {};
		scomosData['selection'] = selection;
	}
	dataApi.getScomosSelection = function(){
		var scomosData = __modelData['scomosData']
		if(scomosData)
			return scomosData['selection'];
		return null;
	}
	dataApi.storeZoom = function(zoomString){
		var scomosData = __modelData['scomosData'] = __modelData['scomosData'] ||  {};
		scomosData['zoomString'] = zoomString;
	}
	dataApi.getZoom = function(){
		var scomosData = __modelData['scomosData']
		if(scomosData)
			return scomosData['zoomString'];
		return null;
	}
	dataApi.setOnetime = function(oneTime){
		var scomosData = __modelData['scomosData'] = __modelData['scomosData'] ||  {};
		scomosData['oneTime'] = oneTime;
	}
	dataApi.getOnetime = function(){
		var scomosData = __modelData['scomosData']
		if(scomosData)
			if (scomosData['oneTime'] === undefined)
				{
				scomosData['oneTime'] = true;
				}
			return scomosData['oneTime']
		return null;
	}
	
	/** export dataModelAPIs **/
	return dataApi;
};
/**
 * eskin clip board module.
 * handles the copying of SBML nodes .
 * Assumptions :
 * 	1) only sbml nodes will be stored.
 * 	2) Only sbml Noes of Species and reaction type will be supported.
 */

/**
 * clipboard module for d3scomos library. ( this is completely privtate module wont be shared outside library.)
 * @param  {[type]} function( [description]
 * @return {clipboard}        instantiates the eskin clipboard module.
 */
var clipboard = (function(){
    /**
     * eskin clipboard data.
     * @type {{specis:[Species],reactions:[Reaction]}}
     */
    var _data = {species:[],reactions:[]};
    var isCopiable = false;
    function triggerClipboardEvent(){
        if(_data.species.length > 0 || _data.reactions.length > 0){
            isCopiable = true;
        }
        eskinDispatch.clipbaordEvent({hasData : isCopiable});
    }
    function getDeepCopyOfClipBoard(){
        var _species = _data.species.map(objectHelper.deepCopyNodeObject);
        var _reactions = _data.reactions.map(objectHelper.deepCopyNodeObject)
        return {species:_species,reactions:_reactions};
    }
    return {
        clear : function(){
            _data = {species:[],reactions:[]};
            triggerClipboardEvent();
        },
        /**
         * stores the provided selection in clipboard.
         * @param  {{species:[Species],Reactions:[Reaction]}} toBeCopied selection that is to be stored in clipboard.
         * @return {}            [description]
         */
        copy : function(toBeCopied){
            //TODO: add vaidations to check if seleciton is in correct format.
            _data = toBeCopied;
            triggerClipboardEvent();
        },
        /**
         * returns copiable collection by applying proper transform
         * @param  {[type]} startAt [description]
         * @return {[type]}         [description]
         */
        paste : function(){
            triggerClipboardEvent();
            return getDeepCopyOfClipBoard();
        },
        triggerClipboardEvent : function(){
            triggerClipboardEvent();
        },
        hasPastables : function(){
            if(_data.species.length > 0 || _data.reactions.length > 0){
                return true;
            }
        }
    }
    })();

/**
 * Scomos Error module : contains custom error
 */
/**
 * validation error : thrown when invalid data is passed to library 
 */
//expose these custome errors so that can be used while unit testing
var customErrors = d3scomos.customErrors = {};

customErrors.ValidationError = function ValidationError(message){
	this.name = "ValidationError";
	this.message = (message || "");
	}
customErrors.ValidationError.prototype = Error.prototype;
/**
 * d3scomos core : contains business logic functionality 
 */
//TODO : add internal json conversion and handling layer
/**
 * A keyStore module generates various keys required for construction
 **/
var eSkinkeyStore = d3scomos.keyStore = function(){

	var speciesIndex = 0;
	var compartmentIndex = 0;
    var reactionIndex = 0;
	var keys = [];//TODO: change this to object i.e. hashtable
    var ksConsts = keyStoreConstants;
    /**
     * wheather key exists in keys array
     * @param  {String} sKey key to be searched
     * @return {boolean}      key found status true if key found
     */
    function keyExists(sKey){
        return keys.indexOf(sKey) != -1;
    }

    function incrementIndex(sKey){
        //split sKey on _
        //first group is prefix second group is index
        //first group must be string and second group must be a positive integer
        var tokens = sKey.split(ksConsts.keySeperator);
        if(tokens.length ==2){
            var prefix = tokens[0].trim();
            var index  = tokens[1].trim();
            //are these valid
            if(objectHelper.isAlphabetsOnly(prefix) && objectHelper.isInteger(index)){
                var index = parseInt(index);
                if(prefix === ksConsts.speciesPrefix){
                    if(speciesIndex <index) speciesIndex = index;
                }
                else if(prefix === ksConsts.compartmentPrefix){
                    if(compartmentIndex <index) compartmentIndex = index;
                }
                else if(prefix === ksConsts.reactionPrefix){
                    if(reactionIndex <index) reactionIndex = index;
                }
            }
        }
    }
    /**
     * key to be added
     * @param {String} sKey a key to be added to the keyStore
     */
	function __addKey(sKey){
		if(sKey && objectHelper.isString(sKey)){
            if(!keyExists(sKey)){
                //increment index appropriately
                incrementIndex(sKey);
                return keys.push(sKey);
            }
            else
                throw new customErrors.ValidationError("Unique Index violation : " + sKey+ " allready exists");
        }
		else
			throw new customErrors.ValidationError("Invalid Key : " + sKey+ " . Must be valid string");
	}

    function _removeKey(sKey){
        if(keyExists(sKey)){
            return keys.splice(keys.indexOf(sKey),1)[0];
        }
        __logger.warn('KeyStore : removeKey failed. Key - ',sKey + ' is not in KeyStore.')
    }

	return {
		/**
		 * clears the keyStore
		 */
		clear : function(){
			speciesIndex = 0;
			keys = [];
		},
        /**
         * returns next species sId
         * @return {String} next valid eskin sId
         */
		getNextSpecies : function(){
			speciesIndex += 1;
            return ksConsts.speciesPrefix + ksConsts.keySeperator+speciesIndex;
		},
        /**
         * returns next compartment sId
         * @return {String} Next valid eskin compartment sId
         */
        getNextCompartment : function(){
			compartmentIndex += 1;
            return ksConsts.compartmentPrefix + ksConsts.keySeperator+compartmentIndex;
		},
        /**
         * returns next reaction sId
         * @return {String} next valid eskin reaction sId
         */
        getNextReaction : function(){
			reactionIndex += 1;
            return ksConsts.reactionPrefix + ksConsts.keySeperator+reactionIndex;
		},
		/**
		 * adds molecules key to keystore
		 * @param {String} mkey key to be inserted
		 * @throws {ValidationError} validation error if this key already exists
		 * @return return this key
		 */
		addSpecies:function (sKey){
			//TODO: logic to increment species index
			__addKey(sKey);
		},
		/**
		 * adds compartment key to keystore
		 * @param {String} mkey key to be inserted
		 * @throws {ValidationError} validation error if this key already exists
		 * @return return this key
		 */
		addCompartment:function (sKey){
			//TODO: logic to increment species index
			__addKey(sKey);
		},
		/**
		 * adds reaction key to keystore
		 * @param {String} mkey key to be inserted
		 * @throws {ValidationError} validation error if this key already exists
		 * @return return this key
		 */
		addReaction:function (sKey){
			//TODO: logic to increment species index
			__addKey(sKey);
		},
		/**
		 * TODO: Important use this method and this method only to add keys. Specialized add methods will be removed later
		 * addsKey to keystore Note : avoid using this method use only if keys are category less and unIndexed
		 * @param {String} key key to be added to keyStore
		 * @throws {customErrors.ValidationErro} unique violation
		 * @return return this key
		 *
		 */
		addKey : function(sKey){
			__addKey(sKey);
		},
        /**
         * check if passed in needle allredy exists in keyStore
         * @param  {String} needle key to be searched
         * @return {boolean}        key found status
         */
        hasKey : function(needle){
            return keyExists(needle);
        },
        /**
         * returns the current values of counters/indexes ( Method added mostly to ease Testing)
         * @return {{species:Number,compartment:Number,reaction:Number,count:Number}} current counter status
         */
        getCurrentCounters : function(){
            return {species:speciesIndex,compartment:compartmentIndex,
                    reaction:reactionIndex,count:keys.length};
        },
        /**
         * remove the key from keyStore
         * @param  {string} sKey Key to be removed
         * @return {string | null}  returns this key if found else null
         */
        removeKey : function(sKey){
            return _removeKey(sKey);
        }
	}
};

/**
 * contains various string messages used throughout the library
 * this will help in localizing the library and also reduce the in broswer memory footprint
 */

/**
 * eskin messages object provides static messages
 *TODO: look into possibility of customizing these messages as required with passed params
 */
var eskinMessages = {
		/** add all error messages here **/
		error : {
					/** validation error messages **/
					validation_sId_empty : "Invalid sId : sId is not optional",
					validation_sId_does_not_exist : "Invalid sId : sId does not exist in SBML Model.",
					validation_iHeight_empty : "Invalid iHeight : iHeight is not optional",
					validation_iHeight_not_number : "Invalid iHeight : iHeight must be a number",
					validation_iWidth_empty : "Invalid iWidth : iWidth is not optional",
					validation_iWidth_not_number : "Invalid iWidth : iWidth must be a number",

					validation_position_empty : "Invalid Position : Position value is not optional",
					validation_position_iX_not_number : "Invalid Position : Position.iX must be a number",
					validation_position_iY_not_number : "Invalid Position : Position.iY must be a number"
				}
}

/**
 * Model data model data api wont be public anymore
 * it is now private to operation and operations will provide convenient wrappers as needed
 *  Most of the code in this module is either copied or re-factored from apiData.js
 *  TODO: the module apiData is supposed to go away after restructuring 
 */

var modelData = function(){
	//ASSUMPTIONS
	// if passed data have a invalid values for def params they will assume the defaults
	//TODO: make this configurable
	var model = null; //must be initialized explicitely by call
	var returnThis = {};
	
	/**
	 * initModel with passed model data
	 * @param {SBMLModel} model
	 */
	returnThis.initModel = function(_model){
		//assumption is we are gettting weMade model form operations
		model = _model;
	}
	/**
	 * adds a molecule to the model data(creates new molecule object)
	 * @param {JSON} moleculeJson containing molecule data
	 * @returns {Molecule} returns a molecule object  
	 */
	returnThis.addSpecies = function addSpecies (moleculeJson){
		//construct molecule 
		//var molecule =
	}
	return returnThis;
}
/**
 * collection of various utility function to validate/ initialize scomos model data
 */
var modelValidator = d3scomos.modelValidator = {};

/**
 * adds and sets up the sParentCompartment property of the compartments
 * since sbml v3 outsideCompartment property is removed so added new sParentCompartment property
 * @param {object} compartment map
 * @retuns updates/adds sParentCompartment property
 */
modelValidator.setComptParents = function setComptParents(compartmentMap){
	/**
	 * Algorithm : findChildren recursively
	 * for each node inside this node find its children recursively find their children compartments
	 * algo works on asumption that all compartment will have default as their parent which ensure all them will be visited by their immediate
	 * parent first
	 */
		__findAllChildComptRecur(compartmentMap["default"], compartmentMap);
	//}
	return compartmentMap;
}

/**
 * adds and sets up the sParentCompartment property of the compartments
 * @param {object} compartment map
 * @param {object} compartment object to be updated
 * @returns updates sParentCompartment property of compartment
 */
modelValidator.updateComptParents = function updateComptParents(compartmentMap,compartment){
	//so the update will happen
	//console.log("delete" + delete compartment["sParentCompartment"]);
	compartment["sParentCompartment"] = undefined;
	//this.setParentCompartment(compartmentMap, needle);
	//this.setComptParents(compartmentMap);
	modelValidator.setParentCompartment(compartmentMap, compartment);
	if(!compartment.sParentCompartment){ //if not set
	console.info("failed to set compartment "+compartment.sId + "reverting to default")
		compartment.sParentCompartment = "default";
	}
}
/**
 *sParentCompartmentets up the reaction nodes parent property for the first time
 * @param {Object} map of reaction nodes
 * @param {Object} compartmentMap map of all the compartments
 * @returns sets sParentCompartment of reaction node
 */
modelValidator.setReactionParents = function setReactionParents(reactionNodeMap,compartmentMap){
	for(var rId in reactionNodeMap ){
		modelValidator.setParentCompartment(compartmentMap, reactionNodeMap[rId]);
	}
}

/**
 * update reaction nodes parent property
 * @param {Object} compartmentMap map of compartment
 * @param {Object} reaction object needle to be searched
 * @returns sets sParentCompartment of reaction node
 */

modelValidator.updateReactionParents = function updateReactionParents(compartmentMap,reaction){
	delete reaction["sParentCompartment"] ;
	modelValidator.setParentCompartment(compartmentMap, reaction);
	if(!reaction.sParentCompartment) //if not set
		reaction.sParentCompartment = "default";
}

/**
 * update species complex parent and compartment property
 * @param {Object} compartmentMap map of all compartments
 * @param {Object} speciesMap map of all species
 * @param {species} a species to be updated
 * @returns updates the values of sParentCompartment and sCompex
 */
modelValidator.updateSpeciesParents = function updateSpeciesParents(compartmentMap,speciesMap,species){
	/**
	 * find which complex this species belongs to update
	 * find which compartment it belongs to and update
	 *TODO : optimize if complex has valid parent cmpt species should simply use that instead of finding anew
	 */
	//set complex parent
	//delete species["sParentCompartment"];//this will force setParent to update the value
	//delete species["sParentComplex"];
	species["sParentCompartment"] = undefined;
	species["sParentComplex"] = undefined;
	__setComlexParentSpecies(speciesMap, species);
	//update compartment
	//TODO : fix it
	//this is a hack
	modelValidator.setParentCompartment(compartmentMap, species);
	if(!species.sParentCompartment) //if not set
		species.sParentCompartment = "default";
}
/**
 * recursively find children of compartment
 * @param cParent
 * @param comptMap
 */
function __findAllChildComptRecur(cParent,compartmentMap){

	var pId = cParent.sId;
	for(var cId in compartmentMap )
	{
		if(pId !== cId){
			if(shapeUtil.hitTest(compartmentMap[pId], compartmentMap[cId])){
				//console.log(cId + ' is inSide '+pId);
				//dont update if allready set
				//if compartment have default set as parent but still passed the hit the test
				// it is case of inner compartment tested before outer
				//TODO: can be optimized by blocking recursive call in this case
				// run it recursively
				if(compartmentMap[cId]["sParentCompartment"] === 'default' || compartmentMap[cId]["sParentCompartment"] === "" || compartmentMap[cId]["sParentCompartment"] === undefined){
					//valid compartment update
					compartmentMap[cId]["sParentCompartment"] = compartmentMap[pId].sId;
					//run this function recursively
					__findAllChildComptRecur(compartmentMap[cId], compartmentMap);
				}
			}
		}
	}
}

/**
 * finds parent compartment of any given species
 * @param {Object} compartmentMap map of all the compartment
 * @param {Object} needle elem to be checked for its
 **/
modelValidator.setParentCompartment = function getParentCompartment(compartmentMap,needle){
	//start with default this insure all the compartments will be visited at least once
	//sanitise the needle
	//TODO this is not the place to do this
	if(!needle.iHeight || needle.iHeight === 0 )
		needle.iHeight = 20;
	if(!needle.iWidth || needle.iWidth === 0 )
		needle.iWidth = 20;
	__findParenCompartment(compartmentMap, compartmentMap['default'], needle);
}

/**
 * private function that recursively sets up the parents of passed node
 * @param {object} compartmentMap map of all the compartments
 * @param {Object} compartment current compartment in consideration
 * @param {Object} findThis object to be tested for inside test
 */
function __findParenCompartment(compartmentMap,compartment,findThis){
	/**
	 * Algo :
	 * for Each compt in this compt call __findParenCompartment
	 * if findThis.sCompart is not set
	 * 		run hitTest(compartment,findThis)
	 * 			upate on success
	 */
	for(var cId in compartmentMap){
		//recurse if this compartment is child of compartMent
		if(compartment.sId === compartmentMap[cId]["sParentCompartment"]){
			//console.log("going recursive for "+cId);
			__findParenCompartment(compartmentMap,compartmentMap[cId],findThis);
		}
	}
	if( !findThis["sParentCompartment"] || findThis["sParentCompartment"] === "default"){
		if(shapeUtil.hitTest(compartment, findThis)){
			//update
			findThis["sParentCompartment"]=compartment.sId;
			//console.log(findThis.sId + " is in " + compartment.sId);
			return;
		}
		//console.log(findThis.sId + " is not in " + compartment.sId);
	}
}
/**
 * private function that updates sParentComplex property of the passed species
 * @param {object} speciesMap
 * @param {object} species needle to be updated
 */
function __setComlexParentSpecies(speciesMap,species){
	/**
	 *TODO: implementation is not assuming case of inner complexes
	 * to handle inner complexes it will need recursive implementation
	 */
	for(var sId in speciesMap){
		if(speciesMap[sId]["sType"] === 'Complex'){
			//perform the hit test if passed then update and return
			if(shapeUtil.hitTest(speciesMap[sId], species))
				species["sParentComplex"] = sId;
		}
	}
}

/****** following functions are added after library restructure (third Iteration )******/

/**
 * validates molecule for required fields and optional fields if passed
 */

/**
 * validates if sId is formed correctly or not
 * @param {String} sId
 * @returns {Boolean} wheather sId is valid or not
 * @throws {customErrors.ValidationError} throws validation error describing validation issue
 */
modelValidator.validate_sId = function(sId){
	//TODO name validation later
	if(!sId){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_sId_empty);
	}
	return true;
}

/**
 * validate iHeight parameter
 * @param {Number} iHeight
 * @returns {Boolean} weather iHeight is well formed
 * @throws {customErrors.ValidationError} throws validation error describing validation issue
 */
modelValidator.validate_iHeight = function(iHeight){
	if(!iHeight){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_iHeight_empty);
	}
	else if(isNaN(iHeight)){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_iHeight_not_number);
	}
	return true;
}

/**
 * validate iWidth parameter
 * @param {Number} iWidth
 * @returns {Boolean} weather iWidth is well formed
 * @throws {customErrors.ValidationError} throws validation error describing validation issue
 */
modelValidator.validate_iWidth = function(iWidth){
	if(!iWidth){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_iWidth_empty);
	}
	else if(isNaN(iWidth)){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_iWidth_not_number);
	}
	return true;
}

/**
 * validate position parameter
 * @param {Object} position {iX:Number,iY:Number}
 * @returns {Boolean} weather position is valid and well formed
 * @throws  {customErrors.ValidationError} throws validation error describing validation issue
 *
 */
modelValidator.validate_position = function(position){

	if(!position){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_position_empty);
	}
	if(isNaN(position.iX)){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_position_iX_not_number);
	}
	if(isNaN(position.iY)){
		throw  new customErrors.ValidationError(eskinMessages.error.validation_position_iY_not_number);
	}
	return true;
}

/**
 * validates base object parameters
 * @param {Object} options base constructor params
 * @returns {Boolean} weather options have valid non optional parameters
 * @throws {customErrors.ValidationError} throws validation error describing validation issue
 * @throws {TypeError} throws type error if required key is missing
 *
 */
modelValidator.validateBase = function(options){
	this.validate_sId(options.sId);

	this.validate_iHeight(options.iHeight);
	this.validate_iWidth(options.iWidth);

	this.validate_position(options.position);

	return true;
}

/**
 * Validates if Edge params are correct
 * @param {Species|Reaction} source
 * @param {Species|Reaction} target
 * @returns {Boolean} true
 * @throws  {customErrors.ValidationError} throws validation error describing validation issue
 */
modelValidator.validateEdge = function(source,target){

	//object must be of type either Species or Reaction
	var allowedObjectTypes = ["Species", "Reaction"];

	if(allowedObjectTypes.indexOf(source.constructor.name) === -1 ){
		throw customErrors.ValidationError("Object of Type : "+source.constructor.name + " cannot be source");
	}
	if(allowedObjectTypes.indexOf(target.constructor.name) === -1 ){
		throw customErrors.ValidationError("Object of Type : "+target.constructor.name + " cannot be target");
	}

	// source and target must not be same objects
	if(source.constructor.name ===  target.constructor.name){
		throw customErrors.ValidationError("Source and target are of same type "+source.constructor.name);
	}
	return true;
}

/**
 * finds the parent and children of current needleCompartment and return the array of indexes of same
 * @param {{sId: Compartment}} compartmentMap map of compartments
 * @param {Compartment} needle compartment whose parent and children are to be searched
 * @returns {{parent : {String}, children : [{String}]}} object containing parent and children of this compartment
 */
modelValidator.getParentAndChildrenOfCompartment = function (compartmentMap,needle){
	/**
	 * Algo : for children id default do
	 * 			if needle in thisChild
	 * 				add this as a parent
	 * 						repeat this for children of thisChild
	 * 						break if thisChild have no more children to validated
	 * 			else if thisChild in needle
	 * 				add thisChild.sId as child of needle
	 * 		  repeat.
	 */

	var returnThis = {parent: "default",children :[]};
	var parentFound = true;

	while(parentFound){
		parentFound = false;
		//test until you find the parent
		var children = compartmentMap[returnThis.parent].getAllChildren();
		for(var sId in children)
		{
			console.log("in for of  find children");
		   var thisCompartment = compartmentMap[children[sId]];
		   if (!thisCompartment) continue; //if this child is not compartment continue

		   if(shapeUtil.hitTest(thisCompartment, needle)){
			   returnThis.parent = thisCompartment.sId;
			   parentFound = true;
			   break;
		   }
		   else if(shapeUtil.hitTest(needle,thisCompartment)){
			   //case of other way around add this as a child
			   returnThis.children.push(thisCompartment.sId);
		   }
		}
	}
	return returnThis;
}

/**
 * returns parents of passed Species ( complex and compartment)
 * @param {{sId: Compartment}} compartmentMap map of Compartment
 * @param {{sId: Species}} speciesMap map of Species
 * @param {Species} needle species of which parents are to be searched
 * @returns returns complex
 */
modelValidator.getSpeciesParents = function(compartmentMap,speceisMap,needle){

	//------------------------------

	//Add type precondtions
	//algo for finding parents for species ( complex or otherwise)
	/**
	 * 	find complex parent first if found to be in complex parent use its sParentCompt
	 *  if not inside the complex find its compartment it belongs to marking it as sParent
	 */
	var returnThis = {sParentCompartment:null,sParentComplex:null};
	var complexParent = speceisMap[needle.sParentComplex];
	//case one
	if(needle.sParentComplex && complexParent){
		returnThis.sParentComplex = complexParent.sId;
		returnThis.sParentCompartment = complexParent.sParentCompartment;
		return returnThis;
	}
	else{
		//find the complex it belongs
		//TODO: for now complex inside complex is not allowed
		var complexSpecies = d3.values(speceisMap).filter(function(d){return d.sType === "Complex"});
		for(var complId in complexSpecies){
			var complex = complexSpecies[complId];

			if(shapeUtil.hitTest(complex, needle)){
				returnThis.sParentComplex = complex.sId;
				returnThis.sParentCompartment = complex.sParentCompartment;
				return returnThis;
			}
		}
	}

	//standard flow
	var returnThis = {sParentCompartment:"default",sParentComplex:null};
	var parentFound = true;

	while(parentFound){
		parentFound = false;
		//test until you find the parent
		var children = compartmentMap[returnThis.sParentCompartment].getAllChildren();
		for(var sId in children)
		{
		   var thisCompartment = compartmentMap[children[sId]];
		   if (!thisCompartment) continue; //if this child is not compartment continue
		   if(shapeUtil.hitTest(thisCompartment, needle)){
			   returnThis.sParentCompartment = thisCompartment.sId;
			   parentFound = true;
			   break;
		   }
		}
	}
	return returnThis;
}

/**
 * genenric find parent method : finds parent compartment of any node
 * @param {{sId: Compartment}} compartmentMap map of compartments
 * @param {Species|Compartment|Reaction} needle  node whose parent and children are to be searched
 */
modelValidator.findParentCompartmentOfNode = function (compartmentMap,needle){
	var returnThis = {sParentCompartment: "default"};
	var parentFound = true;

	while(parentFound){
		parentFound = false;
		//test until you find the parent
		var children = compartmentMap[returnThis.sParentCompartment].getAllChildren();
		for(var sId in children)
		{
		   var thisCompartment = compartmentMap[children[sId]];
		   if (!thisCompartment) continue; //if this child is not compartment continue
		   if(shapeUtil.hitTest(thisCompartment, needle)){
			   returnThis.sParentCompartment = thisCompartment.sId;
			   parentFound = true;
			   break;
		   }
		}
	}
	return returnThis;
}

'use strict'
/**
 * Scomos Selection Set
 * Implementation for simple set in javascript which will support scomos graph specific selection
 * This is not generic set implementation. This is very specific to scomos model data structure.
 */
// selection set holds the reference to various d3 selections
// also has all basic method a set should have plus has method
// specific to handle needs of the scomos graph model for drawing
// various interactions. Also helps in optimizing events and interactions
/**
 * Creates instance of the selection set
 * @constructor
 * @this selectionSet
 * @param data {object or array of object} to be added to current set
 * @param hashFunction {function} optional parameter user can pass custom hash function in case non scomos data
 *
 */
var scomosSelectionSet = d3scomos.selectionSet = function selectionSet(hashFunction){

	/**
	 * implementation is based on the fact that all the javascript objects are hash maps under the hood
	 */
	//could be attached to this instance but we want to keep this private (why?)
	var __set = {};
	var __length=0;

	/** set up hasFunction for set **/
	hashFunction = hashFunction || __scomosHash;

	function __scomosHash (obj){

		var returnThis;
		if(typeof obj.datum === 'function'){
            if(obj.datum().hasOwnProperty('sId'))
                returnThis = obj.datum().sId;
            else
                returnThis = objectHelper.getStringHash.apply(JSON.stringify(obj.datum()));
        }
		else
			{
				var str = JSON.stringify(obj);
				var hash = 0, i, chr, len;
				if (str.length == 0) return hash;
				for (i = 0, len = str.length; i < len; i++) {
					chr   = str.charCodeAt(i);
					hash  = ((hash << 5) - hash) + chr;
					hash |= 0; // Convert to 32bit integer
				}
				returnThis = hash;
			}
		return returnThis;
		};
	/**
	 * inserts passed to object to set not a array!important
	 * @param obj {object} object to be inserted
	 * @returns add and return this obj if this obj does not exist else returns previous object
	 */
	function __add(obj)
	{
		var hash = hashFunction(obj);
		//add if not contain
		if(!__contains(obj)){
			__set[hash] = obj;
			//update length
			__length+=1;
			return __set[hash];
		}
		var previousObject = __set[hash];
		//add object to set
		__set[hash] = obj;
		return previousObject||__set[hash];//handles case of pre array being empty
	}

	/**
	 * removes the passed object from set
	 * @param obj {object} object to be removed from the set
	 * @returns {object} returns the removed object if any or null
	 */
	function __remove(obj){
		var returnThis = null;
		if(obj && __contains(obj)){
			returnThis = __set[hashFunction(obj)];
			delete __set[hashFunction(obj)];
			//update length
			__length -=1;
		}
		return returnThis;
	}

	/**
	 * return set element matching with needle if any
	 */
	function __getItem(needle){
		var returnThis = null;
		if(needle && __set[needle])
			returnThis = __set[needle];
		return returnThis
	}
	/**
	 * check weather element exist in the set
	 * @param needle {object} check if this object exist in the selection set
	 * @return {boolean} whether key exist in the set
	 */

	function __contains(needle)
	{
		return __set.hasOwnProperty(hashFunction(needle));
	}

	//exports
	var selectionSet = {};

	/**
	 * get length of the set
	 * @returns length {Number}
	 */
	selectionSet.length =function length(){
		return __length;
	}
	/**
	 * adds passed object or array of object to the set
	 * @param obj {Array} an object or array of objects
	 * @returns add and return this obj if this obj does not exist else returns previous object
	 */
	selectionSet.add = function add(obj){
		var returnThis;
		/*if(objectHelper.isObject(obj))
			{
			console.log(" is object ")
				returnThis = __add(obj);
			}
		if(objectHelper.isArray(obj))
			{
			console.log(" is object ")
				for(index in obj){
					returnThis = __add(obj[index]);
				}
			}*/
		//implementation will treat all data as object and try and add it
		//it is callers responsibility pass appropriate hash function if needs support for arrays
		returnThis = __add(obj);
		return returnThis;
	}

	/**
	 * removes passed object from set if exists
	 * TODO: should there be key based removal also?
	 * @param obj {Object} object to be removed
	 * @returns {Object} removed object if removal succeded otherwise null
	 */
	selectionSet.remove = function remove(obj){
		return __remove(obj);
	}
	/**
	 * retrieves object based on the passed needle
	 * @param needle {String} objectHash to be searched
	 * @returns found item if any or null
	 */
	selectionSet.getItem = function getItem(needle){
		return __getItem(needle);
	}

	/**
	 * applies passed function on each element of selection and returns the selection
	 * @param fn {function} function to be applied on set elements
	 * @returns {[Object]} array of objects from set
	 */
	selectionSet.each = function(fn){
		var returnThis = [];
		for(var p in __set)
			{
			  if (__set.hasOwnProperty(p)){
				  //apply function
				  __set[p] = function(obj){
					  			fn(obj);
				  				return obj;
				  				}(__set[p]);

				  returnThis.push(__set[p])
			  }
			}
		return returnThis;
	}
	/**
	 * remove all the element and return array of all removed elements
	 */
	selectionSet.clear = function clear()
	{
		var returnThis = [];
		for(var p in __set)
		{
		  if (__set.hasOwnProperty(p)){
			  returnThis.push(__set[p]);
			  //remove property from set
			  delete __set[p];
		  }
	    }
		//update length
		__length=0;
		return returnThis;
	}

	//this method is just for testing purposes
	selectionSet.getAllItems = function getAllItems(){
		return __set;
	}
	return selectionSet;
}

'use strict'
/**
 * scomosTree : Generic tree implementation
 */

/**
 * Creates instance of the scomosTree
 * @constructor
 * @this scomosTree
 * @param {string} rootNode string value of root node if not passed uses 'default' string
 */
var scomosTree = d3scomos.scomosTree = function scomosTree(rootNode){
	/**
	 * node structure to store tree nodes
	 * @class treeNode
	 * @Constructor
	 * @param {string} node.value
	 * @returns a tree node with node.value set and empty list of children
	 */
	function treeNode(value)
	{
		this.val = value;
		/**{[treeNode]}**/
		this.children = [];
		
		//add handling methods
		treeNode.prototype.getValue = function getValue(){
			return this.val;
		}
		//add children
		/**
		 * adds treeNode as children to this node
		 * @param {[treeNode]} array of treeNode
		 */
		treeNode.prototype.addChild = function addChild(treeNode){
				if(treeNodes)
					this.children.push(treeNodes);
		}
		/** removes passed treeNode if exists in children
		 * @param {treeNode} treeNode object to be removed
		 * @returns this treeNode if successful deletion else null
		 */
		treeNode.prototype.removeChild = function removeChild(treeNode)
		{
			return arrayUtil.removeElement(this.children, treeNode);
		}
	}
	
	//init some defaults
	rootNode = rootNode || 'default';
	//tree node internals
	var __root = new treeNode(rootNode);
	var __length = 1;
	
	//internal functions
	/**
	 * will traverse the tree in preOrder and will return
	 * @returns level Traversed array
	 */
	function __traverseBFS(){
		//init empty queue
		var q = [];
		var visited  = [];
		//visit root
		visited.push(__root);
		//add root to queue;
		q.push(__root);
		
		while(q.length !==0 ){
			var thisNode = q.shift();//retrieve front of the queue
			//visit thisNode
			visited.push(thisNode);
			//add its children to queue
			thisNode.children.forEach(function(node) {
				q.push(node);
			});
		}
		return visited;
	}
	
	/**
	 * find in level Traverse
	 * @param {array} array of traversed tree nodes
	 * @returns {Number} index found at or -1 if ot found
	 */
	function __findNodeInArray(needle,traversedArray){
		var foundAt = -1;
		for(var i in traversedArray){
			if(traversedArray[i].val === needle){
				foundAt = i;
				break;
			}
		}
		return foundAt;
	}
	/** export this object **/
	var scomosTree = {};
	
	/**
	 * return the reference of the root element
	 * @returns {treeNode} returns the treeNode object
	 */
	
	scomosTree.getRoot = function getRoot(){
		return __root;
	}
	
	/**
	 * appends the newNode to parentNode
	 * @param {string}  newNodeVal value to create new Node with
	 * @param {string}  value of parent node to add to tree if null add to __root
	 */
	scomosTree.addNode = function addNode(newNodeVal,parentVal){
		//set parentNode to point to root
		parentVal = parentVal || __root.val;
		//add new node
		var newNode = new treeNode(newNodeVal);
		//traverse tree and add node if found match
		scomosTree.findNode(parentVal, function(node){console.log("adding child to");console.log(node);node.children.push(newNode)});
		__length +=1;
	}
	
	/**
	 * traverses the tree to find node applies passed function on the found node
	 * @param {String} needle node value to be searched in tree
	 * @param {Function} fn function to applied on found elem
	 * @returns {treeNode} returns the found element after applying the passed function or undefined
	 */
	scomosTree.findNode = function findNode(needle,fn)
	{
		//TODO make it better we are traversing the whole tree
		var levelNodes = __traverseBFS();
		var index = __findNodeInArray(needle, levelNodes);
		
		console.log("found the at index "+index )
		if(objectHelper.isFunction(fn)){
			//apply function
			fn(levelNodes[index]);
		}
		return levelNodes[index];
	}
	/** return scomos tree object **/
	return scomosTree;
}
/**
 * Undo manager module
 * Implementation of command pattern in javascript
 * TODO: add documentation explaining pattern implementation.
 **/

    function removeFromTo(array, from, to) {
        array.splice(from,
            !to ||
            1 + to - from + (!(to < 0 ^ from >= 0) && (to < 0 || -1) * array.length));
        return array.length;
    }
    function dispatchUndoManagerEvent (){
        eskinDispatch.undoManagerEvent(this);
    }
    var undoManager = d3scomos.undoManager = function() {

        var commands = [],
            index = -1,
            limit = 15, //defaults to fifteen
            isExecuting = false,
            callback,

            // functions
            execute;

        execute = function(command, action) {
            if (!command || typeof command[action] !== "function") {
                return this;
            }
            isExecuting = true;

            command[action]();

            isExecuting = false;
            return this;
        };
        return {

            /*
            Add a command to the queue.
            */
            add: function (command) {
                if (isExecuting) {
                    return this;
                }
                // if we are here after having called undo,
                // invalidate items higher on the stack
                commands.splice(index + 1, commands.length - index);

                commands.push(command);

                // if limit is set, remove items from the start
                if (limit && commands.length > limit) {
                    removeFromTo(commands, 0, -(limit+1));
                }

                // set the current index to the end
                index = commands.length - 1;
                if (callback) {
                    callback();
                }
                return this;
            },

            /*
            Pass a function to be called on undo and redo actions.
            */
            setCallback: function (callbackFunc) {
                callback = callbackFunc;
            },

            /*
            Perform undo: call the undo function at the current index and decrease the index by 1.
            */
            undo: function () {
                var command = commands[index];
                if (!command) {
                    return this;
                }
                execute(command, "undo");
                index -= 1;
                if (callback) {
                    callback();
                }
                dispatchUndoManagerEvent.call(this);
                return this;
            },

            /*
            Perform redo: call the redo function at the next index and increase the index by 1.
            */
            redo: function () {
                var command = commands[index + 1];
                if (!command) {
                    return this;
                }
                execute(command, "redo");
                index += 1;
                if (callback) {
                    callback();
                }
                dispatchUndoManagerEvent.call(this);
                return this;
            },

            /*
            Clears the memory, losing all stored states. Reset the index.
            */
            clear: function () {
                var prev_size = commands.length;

                commands = [];
                index = -1;

                if (callback && (prev_size > 0)) {
                    callback();
                }
                dispatchUndoManagerEvent();
            },

            hasUndo: function () {
                return index !== -1;
            },

            hasRedo: function () {
                return index < (commands.length - 1);
            },

            getCommands: function () {
                return commands;
            },

            setLimit: function (l) {
                limit = l;
            }
        };
    };

/**
 * a private module  provides one point access to various validation rules 
 */
/** a validation rules object **/
var validationRules = {};

//add validation rules to this object
/**
 * Base object from which other SBML entities will extend
 * Note : this is not compliant with SBML class hierarchy
 *
 **/

/**
 *Construct sBase Object using options(sId,sName,position,height,width,color)
 *@constructor
 *@param {Object} options this contains various optional and non-optional params
 *@returns {sBase} sBaseObject
 *@throws {customErrors.ValidationError} for invalid input params
 *@throws {TypeError} if expected key is missing in object
 */
function Base(options){
	//assumptions
	//non-optional parameters : sId,iHeight,iWidth,position[iX,iY]
	//optional-fields :sName,sParentCompartment

	/** validate non optional fields **/
	modelValidator.validateBase(options);
	//seems all is fine build the object
	this.sId = options.sId;
	this.sName = options.sName || this.sId;
	this.iHeight = options.iHeight;
	this.iWidth = options.iWidth;
	this.position = options.position;
	//TODO: bit fishy. Should this be reported?
	this.sParentCompartment = options.sParentCompartment || "default";
	return this;
}
Base.prototype.getEntityType = function(){
    if(this.constructor.name)
        return this.constructor.name;

    /**
     * Hack for IEs lack of function name property
     * @param  {[type]} [^(]{1,} [description]
     * @return {[type]}          [description]
     */
    var funcNameRegex = /function\s([^(]{1,})\(/;
    var results = (funcNameRegex).exec((this.constructor).toString());
    return (results && results.length > 1) ? results[1].trim() : "";
}

/**
 * Class : Compartment
 */

//inherits from Base
/**
 * Constructs the Compartment object
 * @constructor
 * @param options
 * @returns {Compartment}
 */
function Compartment(options){
	//call to super constructor
	Base.call(this,options);

	/*
	 * 	bConstant: false
		color: {iRed: 242, iGreen: 242, iBlue: 192, iAlfa: 255}
		dSize: 1
		iHeight: 1987 -->Base
		iSpatialDimensions: 3
		iWidth: 2083 -->Base
		position: {iX: -249, iY: 78} -->Base
		sId: "C_1" -->Base
		sName: "CELL" -->Base
		sNote: ""
		sParentCompartment: "default" -->Base
		sRepresents: "CellType"
		sType: "RECTANGULAR"
		sUnit: ""
	 */

	this.bConstant = options.bConstant || false;
	this.color = options.color || {iRed: 219, iGreen: 224, iBlue: 224, iAlfa: 255};
	this.dSize = options.dSize || 1;
	this.iSpatialDimensions = options.iSpatialDimensions || 3;//TODO:verify assumptions
	this.sNote = options.sNote || "";
	this.sRepresents = options.sRepresents || "CellType";
	this.sQuantityType = options.sQuantityType || "Concentration";
	this.sUnit = options.sUnit || "litre (Pathway Map Default)";
	//TODO : verify this assumption
	//also should this be alerted to user?
	this.sType = options.sType || "RECTANGULAR";

	/** hidden properties **/

	var children = []; /** not a SBML property **/

	this.getAllChildren = function(){return children;}
	this.addChild = function(sId){
		return children.indexOf(sId) === -1 ?children.push(sId):-1;
	}
	this.removeChild = function(sId){
		if(children.indexOf(sId) !== -1)
			return children.splice(children.indexOf(sId), 1);
		return null;
	}
}

//setup inheritance ( prototype chain )
Compartment.prototype = Object.create(Base.prototype);
Compartment.prototype.constructor = Compartment; // Reset the constructor from Base to Compartment

/**
 * Class : Edge
 * Edge class not derived form Base as this is not standard SBML construct
 * Also this has considerable difference than other View Object
 */
/**
 * Construct a Edge object using the Source and Target ( can be either species or reaction)
 * @constructor
 * @param {Species|Reaction} source
 * @param {Species|Reaction} target
 * @param {String} role
 * @param {{options}} options additional options for initializing the edge
 * @returns {Edge} returns the edge object
 * @throws {customErrors.ValidationError} throws error if invalid edge data
 */
function Edge(source,target,role,options){
	//validates param
	/*assumptions
	 * source and target can be either species or reaction
	 * but they cannot be same i.e. cannot have edge between two species or reaction
	 * sId will be constructed source->sId_target->sId
	 */
	//validate parmas
	modelValidator.validateEdge(source,target);

	this.sId = source.sId+":"+target.sId;
	this.role = role.toUpperCase();
	this.source = source;
	this.target = target;
	this.color = options.color || SBMLConstants.objectDefaults.edgeColor;
    this.speciesName = options.speciesName;

	this.getColorString = function(){
		//return "rgb("+this.color.iRed+","+this.color.iGreen+","+this.color.iBlue+")";
		return SBMLConstants.colorConstants[this.getParentReaction().sType.toUpperCase()];
	}
	//TODO: Edge object needs to be conditionally initialized
	//i.e. based on role of edge it will have more property setters
	//like modifier will not have setConstant property
	if(this.role === 'PRODUCT' || this.role === 'REACTANT'){
			//TODO: what are the meaningful defaults for following varibales
			this.rStoichiometry = options.rStoichiometry || 1;
			this.bConstant = options.bConstant || false;
			if(this.role === 'REACTANT'){
				//set up reversible this property is available for reactioants only
				this.isReversible = options.isReversible || false;
				//setter for isReversible
				/**
				 * sets isReversible property of the edge
				 * @param  {Boolean} val
				 * @return {Boolean} returns the updates value
				 * @throws {customErrors.ValidationError} if invalid value is passed
				 */
				this.setReversible = function(val){
					//TODO: add validation
					this.isReversible = value;
					this.target.isReversible = value;
					return this.isReversible;
				}
			}
			//setters
			/**
			 * updates the stoichiometry constant value
			 * @param  {Number} value stoichiometry constant
			 * @return {Number}  rturns newly set value
			 * @throws {customErrors.validation} if invalid constant value provied throws the error
			 */
			this.setStoichiometry = function(value){
				//TODO: add validation
				this.rStoichiometry = value;
				if(this.role === 'PRODUCT'){
					this.source.rStoichiometry = value;
				}
				else if(this.role === 'REACTANT'){
					this.target.rStoichiometry = value;
				}
				return this.rStoichiometry;
			}
			/**
			 * setConstant set the bConstant value
			 * @param  {Boolean} value
			 * @return {Boolean}  returns the updted value
			 * @throws {customErrors.validation} if invalid constant value provied throws the error
			 */
			this.setConstant = function(value){
				//TODO: add validation
				this.bConstant = value;
				if(role === 'PRODUCT'){
					this.source.bConstant = value;
				}
				else if(role === 'REACTANT'){
					this.target.bConstant = value;
				}
				return this.bConstant;
			}
	}
	else if(this.role === 'MODIFIER'){
		this.sModifierType    = options.sModifierType
        //TODO: add vaidations to see if this is valid modifierType
        this.setModifierType  = function(newModifierType){
            this.getParentReaction().mapModifiers[this.getParentSpecies().sId]
                                    .sModifierType = newModifierType;
        }
	}
    //whenever a edge is created add back references
    this.source.addEdge(this);
    this.target.addEdge(this);
	return this;
}

//TODO: add helper methods to help draw and manipulate edges
Edge.prototype.getEntityType = function(){
    if(this.constructor.name)
        return this.constructor.name;

    /**
     * Hack for IEs lack of function name property
     * @param  {[type]} [^(]{1,} [description]
     * @return {[type]}          [description]
     */
    var funcNameRegex = /function\s([^(]{1,})\(/;
    var results = (funcNameRegex).exec((this.constructor).toString());
    return (results && results.length > 1) ? results[1].trim() : "";
}
/**
 * remove this edge references from its parents
 * @return {} remove edge from parents
 */
Edge.prototype.removeFromParents = function(){
    this.target.removeEdge(this);
    this.source.removeEdge(this);
}
Edge.prototype.addEdgeToParents = function(){
    this.source.addEdge(this);
    this.target.addEdge(this);
}
/**
 * get the parent reaction node for this edge
 * @return {Reaction} parent reaction node
 */
Edge.prototype.getParentReaction = function(){
    // if(this.role === 'REACTANT')
    //     return this.target;
    // return this.source;
    return this.source.getEntityType() === 'Reaction'? this.source:this.target;
}
/**
 * get the parent species node for this edge
 * @return {Species} parent species node
 */
Edge.prototype.getParentSpecies = function(){
    // if(this.role === 'REACTANT')
    //     return this.source;
    // return this.target;
    return this.source.getEntityType() === 'Species'? this.source:this.target;
}

/**
 * Class : Reaction
 *
 */

/**
 * Creates the Reaction object. (Inherits form Base)
 */
function Reaction (options){
	//call to super constructor
	Base.call(this,options);
	 /**
	  *	bIsReactionFast: false
			bIsReversible: false
			color: {iRed: 0, iGreen: 0, iBlue: 0, iAlfa: 255}
			mapModifierIdToModifierType: {}
			mapModifiers: {}
			mapProducts: {S_3: {bConstant: false, rStoichiometry: 1, sSpeciesRole: "Product", sModifierType: ""}}
			mapReactants: {S_1: {bConstant: false, rStoichiometry: 1, sSpeciesRole: "Reactant", sModifierType: ""},…}
			position: {iX: 576, iY: 270}
			sId: "R_1"
			sKineticLaw: ""
			sName: "R_1"
            this.sNote = ""
			sType: "GENERALREACTION"
		**/
	//private data variable to store edges
	/**
	 * stores all the edges related to this reactions by categoreis
	 * @type {{modifiers:[Edge],products:[Edge],reactants:[Edge]}}
	 */
	var edges = {
					modifiers:[],
					products:[],
					reactants:[]
				}
/**
 * Builds the edge map and updates the edges structure
 * @return {} builds edges structure
 * @param {map[speceis]} speciesMap
 * @throws {customErrors.ValidationError} if edges is missing required params or is breaking edge formation rules
 *
 */
	var buildEdgeMap = function(speciesMap){
		//build modifiers map
		//build products
		//reset the edge collection.
		edges.modifiers   = [];
        edges.products     = [];
        edges.reactants    = [];
		var thisReaction = this;

		var _color = "rgb("+thisReaction.color.iRed+","+thisReaction.color.iGreen+","+thisReaction.color.iBlue+")";
		//assume this node as source node
		// find product nodes and add them as targets
		//mapProducts: {Species_2: {bConstant: true, rStoichiometry: 1, sSpeciesRole: "Product", sModifierType: ""}}
		var mapProducts = thisReaction.mapProducts;
		for(var sId in mapProducts){
			var _targetNode = speciesMap[sId];
			if(!_targetNode)
					throw new customErrors.ValidationError("Reaction : build edge failed. Reason : target Species "+sId + " does not exist in specis map.");
			var thisEdge = mapProducts[sId];
			//add sName of __sourceNode to map
			thisEdge['sName'] = _targetNode.sName;

			//var sId = thisReaction.sId+':'+_targetNode.sId;
			var _role = thisEdge['sSpeciesRole'];
			var _stoichiometry = thisEdge['rStoichiometry'];
			var _constant = thisEdge['bConstant'];
			//build product edge
			var options = {
										'rStoichiometry':_stoichiometry,
										'bConstant':_constant,
										'color':thisReaction.color,
                                        'speciesName': thisEdge['sName']
										}
			var pEdge = new Edge(thisReaction,_targetNode,_role,options);
			edges.products.push(pEdge);
			}
		//build reactants
		var mapReactants = thisReaction.mapReactants;
		for(var sId in mapReactants){
			var _sourceNode = speciesMap[sId];
			if(!_sourceNode)
					throw new customErrors.ValidationError("Reaction : build edge failed. Reason : source Species "+sId + " does not exist in specis map.");
			var thisEdge = mapReactants[sId];

			//add sName of __sourceNode to map
			thisEdge['sName'] = _sourceNode.sName;
			//var _sId = _sourceNode.sId+':'+thisReaction.sId;
			var _role = thisEdge['sSpeciesRole'];
			var _stoichiometry = thisEdge['rStoichiometry'];
			var _constant = thisEdge['bConstant'];
			var _isReversible = thisEdge['isReversible'] || false;
			//build product edge
			var options = {
										'rStoichiometry':_stoichiometry,
										'bConstant':_constant,
										'isReversible':_isReversible,
										'color':thisReaction.color,
                                        'speciesName': thisEdge['sName']
										}
			var rEdge = new Edge(_sourceNode,thisReaction,_role,options);
			edges.reactants.push(rEdge);
		}
		//build modifiers
		var mapModifiers = thisReaction.mapModifiers;
		for(var sId in mapModifiers){
			var _sourceNode = speciesMap[sId];
			if(!_sourceNode)
					throw new customErrors.ValidationError("Reaction : build edge failed. Reason : source Species "+sId + " does not exist in specis map.");
			var thisEdge = mapModifiers[sId];
			//add sName of __sourceNode to map
			thisEdge['sName'] = _sourceNode.sName;
			//var _sId = _sourceNode.sId+':'+thisReaction.sId;
			var _role = thisEdge['sSpeciesRole'];
			var _modifierType = thisEdge['sModifierType'];
			//build product edge
			var options = {
											'color':thisReaction.color,
											'sModifierType':_modifierType,
                                            'speciesName': thisEdge['sName']
										}
			var mEdge = new Edge(_sourceNode,thisReaction,_role,options);
			edges.modifiers.push(mEdge);
		}
	}

	this.bIsReactionFast   = options.bIsReactionFast || false;
	this.bIsReversible     = options.bIsReversible || false;
	this.color             =  options.color || {iRed: 0, iGreen: 0, iBlue: 0, iAlfa: 255} ;//this is for general reactions only

	//TODO : following three params need validation
	this.mapModifiers      = options.mapModifiers || {};
	this.mapProducts       = options.mapProducts || {};
	this.mapReactants      = options.mapReactants || {};

	this.mapModifierIdToModifierType = options.mapModifierIdToModifierType || {}
	this.sKineticLaw       = options.sKineticLaw || "";
	//TODO : this value drives the color value add handler function
	this.sType             = options.sType || "General";
    this.sNote             = options.sNote || "";
    // [{id:String,title:string,journal:string,volume:String,pages:String,dop:string,author:string}]
    this.sPubMedReferences = options.sPubMedReferences || [];
	this.updateEdges = function(speciesMap){
		if(!speciesMap)
			throw  new customErrors.ValidationError("Reaction - method updateEdges :missing non optional param speciesMap");
		buildEdgeMap.call(this,speciesMap);
	}
	this.getReactantEdges = function(){
		return edges.reactants;
	}
	this.getProductEdges = function(){
		return edges.products;
	}
	this.getModifierEdges = function(){
		return edges.modifiers;
	}
	this.getAllEdges = function(){
    	var returnThis = [];
    	edges.reactants.forEach(function(edge){returnThis.push(edge)});
    	edges.products.forEach(function(edge){returnThis.push(edge)});
    	edges.modifiers.forEach(function(edge){returnThis.push(edge)});
    	return returnThis;
	}
    /**
     * returns all the connected species
     * @return {[Species]} returns all the connected species.
     */
    this.getAllconnectedSpecies = function(){
        return this.getAllEdges().map(function(edge){return edge.getParentSpecies()});
    }
	/**
	 * returns ID of all the connected species to this reactions.
	 * @return {[String]} [description]
	 */
	this.getAllConnectedSpeciesId = function(){
		var returnThis=[];
		returnThis = returnThis.concat(d3.keys(this.mapProducts));
		returnThis = returnThis.concat(d3.keys(this.mapModifiers));
		returnThis = returnThis.concat(d3.keys(this.mapReactants));
		return returnThis;
	}
    /**
     * returns if said sId exists as part of any of the interaction on this reaction.
     * @param  {String} sId sid to be checked.
     * @return {Boolean}     species exists or not.
     */
    this.checkSpeicesId = function(sId){
        return this.getAllConnectedSpeciesId().indexOf(sId) != -1;
    }
    /**
     * adds edge to the reaction edgeList.
     * @param  {Edge} edge edge object to be added.
     * @return {}      Adds edge to appropriate collection.
     */
    this.addEdge = function(edge){
        //find the type of edge and push edge accordingly if it does not exist
        //build the object to add
        var _edgeObj = {bConstant: edge.bConstant, rStoichiometry: edge.rStoichiometry,
                        sSpeciesRole:edge.role, sModifierType: edge.sModifierType,
                        sName: edge.speciesName
                    }
        var source = edge.source;
        var target = edge.target;
        switch (edge.role) {
            case 'PRODUCT':
                //{bConstant: false, rStoichiometry: 1, sSpeciesRole: "Product", sModifierType: "", sName: "H2O"}
                if(!this.mapProducts.hasOwnProperty(target.sId)){
                    this.mapProducts[target.sId] = _edgeObj;
                    edges.products.push(edge);
                }
                break;
            case 'REACTANT':
                //{bConstant: false, rStoichiometry: 1, sSpeciesRole: "Reactant", sModifierType: "", sName: "GSH"}
                if(!this.mapReactants.hasOwnProperty(source.sId)){
                    this.mapReactants[source.sId] = _edgeObj;
                    edges.reactants.push(edge);
                }
                break;
            case 'MODIFIER':
                //{bConstant: false, rStoichiometry: -1, sSpeciesRole: "Modifier", sModifierType: "Activator", sName: "GPX4"}
                //{bConstant: false, rStoichiometry: 1, sSpeciesRole: "Reactant", sModifierType: "", sName: "GSH"}
                if(!this.mapModifiers.hasOwnProperty(source.sId)){
                    this.mapModifiers[source.sId] = _edgeObj;
                    edges.modifiers.push(edge);
                }
                break;
            default:
                __logger.warn('Reaction - addEdge failed. Reason - Invalid Edge Role type : '+edge.role);
        }
        //console.warn('added edge  '+this.getAllEdges().map(function(d){return d.sId}));
    }
    /**
     * remove edge from this reaction based on the edge sId
     * @param  {Edge} sId edge id to be removed
     * @return {Edge}     removed edge or undefined if not found
     */
    this.removeEdge = function(edge){
        var spliced;
        var source = edge.source;
        var target = edge.target;
        console.warn(edge.role);
        switch (edge.role) {
            case 'PRODUCT':
                //{bConstant: false, rStoichiometry: 1, sSpeciesRole: "Product", sModifierType: "", sName: "H2O"}
                if(this.mapProducts.hasOwnProperty(target.sId)){
                    var isProductDeleted = delete this.mapProducts[target.sId];
                    __logger.warn('Reaction removeEdge : Delete Product '+target.sId + ' status : '+isProductDeleted);

                    var edgeCollection = edges.products;
                    for(var i = 0; i < edgeCollection.length; i++) {
                        if(edgeCollection[i].sId === edge.sId) {
                            spliced = edgeCollection.splice(i, 1);
                            break;
                        }
                    }
                }
                break;
            case 'REACTANT':
                //{bConstant: false, rStoichiometry: 1, sSpeciesRole: "Reactant", sModifierType: "", sName: "GSH"}
                if(this.mapReactants.hasOwnProperty(source.sId)){
                    var isReactantDeleted = delete this.mapReactants[source.sId];
                    __logger.warn('Reaction removeEdge : Delete Reactant '+source.sId + ' status : '+isReactantDeleted);
                    var edgeCollection = edges.reactants;
                    for(var i = 0; i < edgeCollection.length; i++) {
                        if(edgeCollection[i].sId === edge.sId) {
                            spliced = edgeCollection.splice(i, 1);
                            break;
                        }
                    }
                }
                break;
            case 'MODIFIER':
                console.warn('deleting MODIFIER');
                //{bConstant: false, rStoichiometry: -1, sSpeciesRole: "Modifier", sModifierType: "Activator", sName: "GPX4"}
                //{bConstant: false, rStoichiometry: 1, sSpeciesRole: "Reactant", sModifierType: "", sName: "GSH"}
                if(this.mapModifiers.hasOwnProperty(source.sId)){
                    var isModifierDeleted = delete this.mapModifiers[source.sId];
                    __logger.warn('Reaction removeEdge : Delete Modifier '+source.sId + ' status : ' + isModifierDeleted);
                    var edgeCollection = edges.modifiers;
                    for(var i = 0; i < edgeCollection.length; i++) {
                        if(edgeCollection[i].sId === edge.sId) {
                            spliced = edgeCollection.splice(i, 1);
                            break;
                        }
                    }
                }
                break;
            }
        console.warn(spliced);
        return spliced;
    }
    /**
     * add new product to this reaction.
     * @param  {Object} options add product options.
     * @return {} adds the product to the reaction.
     * @throws {customErrors.ValidationError} if sId is not passed TODO: need to validate if sId actully exists in the model.
     */
    this.addProduct = function(options){
        //bConstant:false rStoichiometry:1 sModifierType:""  sSpeciesRole: "Product"
        if(!options.hasOwnProperty('sId'))
            throw new customErrors.ValidationError(eskinMessages.validation_sId_empty);
        if(this.checkSpeicesId(options.sId))
            throw new customErrors.ValidationError("Interaction with sId : " + options.sId + " allready exists.");
        //init defaults
        var _options = {};
        _options.bConstant = options.bConstant || false;
        _options.rStoichiometry = options.rStoichiometry || 1;
        _options.sModifierType = "";
        _options.sSpeciesRole = "Product";

        this.mapProducts[options.sId] = _options;
    }
    /**
     * removes the specified product from the reactions product map.
     * @param  {String} productSId product to be removed.
     * @return {Object | null}            Removed product object, null if product no t found.
     */
    this.removeProduct = function(productSId){
        var thisProduct = this.mapProducts[productSId];
        if(thisProduct){
            if(delete this.mapProducts[productSId]){
                return thisProduct;
            }
        }
        return null;
    }
    /**
     * add new reactant to this reaction.
     * @param  {Object} options add reactant options.
     * @return {} adds the reactant to the reaction.
     * @throws {customErrors.ValidationError} if sId is not passed TODO: need to validate if sId actully exists in the model.
     */
    this.addReactant = function(options){
        //bConstant:false rStoichiometry:1 sModifierType:""  sSpeciesRole: "Product"
        if(!options.hasOwnProperty('sId'))
            throw new customErrors.ValidationError(eskinMessages.validation_sId_empty);
        if(this.checkSpeicesId(options.sId))
            throw new customErrors.ValidationError("Interaction with sId : " + options.sId + " allready exists.");
        //init defaults
        var _options = {};
        _options.bConstant = options.bConstant || false;
        _options.rStoichiometry = options.rStoichiometry || 1;
        _options.sModifierType = "";
        _options.sSpeciesRole = "Reactant";

        this.mapReactants[options.sId] = _options;
    }
    /**
     * removes the specified reactant from the reactions reactin map.
     * @param  {String} reactantSId reactant to be removed.
     * @return {Object | null}            Removed reactant object, null if product no t found.
     */
    this.removeReactant = function(reactantSId){
        var thisReactant = this.mapReactants[reactantSId];
        if(thisReactant){
            if(delete this.mapReactants[reactantSId]){
                return thisReactant;
            }
        }
        return null;
    }
    /**
     * adds the modifier.
     * @param  {{sId:String,sSpeciesRole:string}} options options to construct this modifier. SID is cumpolsory others are optional
     * @return {} adds new entry to modifer map.
     */
    this.addModifier = function(options){
        //bConstant:false rStoichiometry:-1 sModifierType: "Activator" sName : "GSTA4" sSpeciesRole : "Modifier"
        if(!options.hasOwnProperty('sId'))
            throw new customErrors.ValidationError(eskinMessages.validation_sId_empty);
        if(this.checkSpeicesId(options.sId))
            throw new customErrors.ValidationError("Interaction with sId : " + options.sId + " allready exists.");
        //init defaults
        var _options = {};
        _options.bConstant = options.bConstant || false;
        _options.rStoichiometry = options.rStoichiometry || -1;
        _options.sModifierType = options.sModifierType || "Activator"; //if other type of modifier is required please specify in the options.
        _options.sSpeciesRole ="Modifier";
        this.mapModifiers[options.sId] = _options;
    }
    /**
     * removes the specified Modifier from the reactions modifier map.
     * @param  {String} modifierSId modifier to be removed.
     * @return {Object | null}            Removed modifier object, null if product no t found.
     */
    this.removeModifier = function(modifierSId){
        var thisModifier = this.mapModifiers[modifierSId];
        if(thisModifier){
            if(delete this.mapModifiers[modifierSId]){
                return thisModifier;
            }
        }
        return null;
    }
}
//setup inheritance ( prototype chain )
Reaction.prototype = Object.create(Base.prototype);
Reaction.prototype.constructor = Reaction; // Reset the constructor from Base to Reaction

/**
 * Implementation of Factory pattern to create various objects required
 * for eskin model construction
 **/

//TODO figure out how to unit test factory pattern
var SBMLFactory = d3scomos.SBMLFactory = function SBMLFactory (){
	/** return this **/
	var factory = {};
	var factoryProto = factory.prototype;

	/**
	 * SBMLModel
	 */
	factory.getSBMLModel = function(options){
		return new SBMLModel(options);
	}

	/** expose the SBML object constructors **/

	factory.getBase = function(options){
		return new Base(options);
	}

	factory.getSpecies = function(options){
		return new Species(options);
	}

	factory.getCompartment = function(options){
		return new Compartment(options);
	}
	factory.getReaction = function(options){
		return new Reaction(options);
	}

    factory.getEdge = function(source,target,role,options){
        return new Edge(source,target,role,options);
    }
	return factory;
}

/**
 * creates minimal sbmlModel Object
 * @constructor
 * @param {Object} options init params for sbml model
 * @throws ValidationError {@link Error}
 * @returns a SBMLModel Object
 */
function SBMLModel(options){
    //validate fields here first
    modelValidator.validate_sId(options.sId);

    this.sId = options.sId;
    this.sName = options.sName || this.sId;
    this.lstFunctionDefinitions = options.lstFunctionDefinitions || [];
    this.lstGlobalParameters = options.lstGlobalParameters || [];
    this.lstSBMLErrorMessage = options.lstSBMLErrorMessage || [];

    //default compartment received in json will be ignored
    //instead library will create its own default compartment and keep updating bounds as new elems are added
    var defCompart = SBMLFactory().getCompartment({sId:"default",iHeight:500,iWidth:500,position:{iX:0,iY:0}});
    this.mapCompartmentLayouts = {"default":defCompart};

    this.mapReactionLayouts = {};
    this.mapSpeciesLayouts = {};
    this.modelUnitDefination = options.modelUnitDefination || {};
    this.sModelAttachments = options.sModelAttachments || "";
    this.sNotes = options.sNotes || "";
    this.sOrganismType = options.sOrganismType || "Homo sapiens";
    return this;
}
/** additional methods to the SBML model will go here **/

SBMLModel.prototype.getEntityType = function(){
    return "SBMLModel";
}
/**
 * Adds species object to species map
 * @param {Species} species
 * @throws {TypeError} if parameter of non species type is passed
 */
SBMLModel.prototype.addSpecies = function(species){

    //{sParentCompartment:null,sParentComplex:null};
    var parents = modelValidator.getSpeciesParents(this.mapCompartmentLayouts,this.mapSpeciesLayouts,species);
    var complexParent = this.mapSpeciesLayouts[species.sParentComplex];

    //case has parentComplex
    if(parent.sParentComplex){
        if(species.sParentCompartment!==parents.sParentCompartment)
            __logger.info("changed parent compartment of Species  "+species.sId + " From " + species.sParentCompartment + " to "+parents.sParentCompartment);
    }
    //case no parent complex
    else{
        if(species.sParentComplex !== parents.sParentComplex)
            __logger.info("changed complex parent of Species "+species.sId + " From " + species.sParentComplex + " to "+parents.sParentComplex);
        if(species.sParentCompartment!==parents.sParentCompartment)
            __logger.info("changed parent of Species "+species.sId + " From " + species.sParentCompartment + " to "+parents.sParentCompartment);
    }

    species.sParentCompartment = parents.sParentCompartment;
    species.sParentComplex   = parents.sParentComplex;
    this.mapCompartmentLayouts[species.sParentCompartment].addChild(species.sId);
    this.mapSpeciesLayouts[species.sId] = species;
    __logger.info("Species with sID : " + species.sId + " added successfully.");
}

/**
 * Adds Compartment object to Compartment map
 * @param {Compartment} compartment
 * @throws {TypeError} if parameter of non species type is passed
 */
SBMLModel.prototype.addCompartment = function(compartment){
    //precondition parentCompartment validation ( no compartment means default )
    var tree = modelValidator.getParentAndChildrenOfCompartment(this.mapCompartmentLayouts, compartment);
    //log in case change of parent
    if(compartment.sParentCompartment!==tree.parent)
        __logger.info("changed parent of compartment "+compartment.sId + " From " + compartment.sParentCompartment + " to "+tree.parent);

    compartment.sParentCompartment = tree.parent;
    this.mapCompartmentLayouts[tree.parent].addChild(compartment.sId);
    for(var sId in tree.children){
        compartment.addChild(sId)
    };

    this.mapCompartmentLayouts[compartment.sId] = compartment;
    //post processing(validation)
    //validate parents
    __logger.info("Compartment with sID : " + compartment.sId + " added successfully.");
}

/**
 * Adds reaction object to reaction map
 * @param {Reaction} reaction
 * @throws {TypeError} if parameter of non species type is passed
 */
SBMLModel.prototype.addReaction = function(reaction){
    //Precondition : find parent of this reaction
    var parent = modelValidator.findParentCompartmentOfNode(this.mapCompartmentLayouts,reaction);
    reaction.sParentCompartment = parent.sParentCompartment;
    this.mapReactionLayouts[reaction.sId] = reaction;
    __logger.info("Reaction with sID : " + reaction.sId + " added successfully.");
    reaction.updateEdges(this.mapSpeciesLayouts);
}

/**
 *Builds edges (could end up removing some reaction if they happen to be invalid);
 */
SBMLModel.prototype.buildEdges = function(){
    //TODO: put builds
}

/**
 * Updates default compartment boundaries
 * @return {[type]} [description]
 */
SBMLModel.prototype.updateModelBoundaries = function(stickyChanges){
    var margin = 15;
    stickyChanges = stickyChanges || false;
    var chldrnOfDefault = [];
    // function getChldrenOfDefault(arrNodes){
    //     var returnThis = [];
    //     arrNodes.map(function(node){if(node.sParentCompartment === 'default') returnThis.push(node)});
    //     return returnThis;
    // }
    //get all children of default
    //compartment
    d3.values(this.mapCompartmentLayouts).map(function(node){if(node.sParentCompartment === 'default' && node.sName !== 'default') chldrnOfDefault.push(node)});
    //speceis
    d3.values(this.mapSpeciesLayouts).map(function(node){if(node.sParentCompartment === 'default') chldrnOfDefault.push(node)});
    //Reaction
    d3.values(this.mapReactionLayouts).map(function(node){if(node.sParentCompartment === 'default') chldrnOfDefault.push(node)});
    //and calculate exreme boundsn
    var defCompart = this.mapCompartmentLayouts['default'];
    //{sId:"default",iHeight:500,iWidth:500,position:{iX:0,iY:0}}

    var minTop             = defCompart.position.iX;
    var minLeft            = defCompart.position.iX;
    var minBottom          = defCompart.iWidth;
    var minRight           = defCompart.iHeight;
    //---------------------------
    /*
    int xMin = int32Rects.Min(s => s.X);
            int yMin = int32Rects.Min(s => s.Y);
            int xMax = int32Rects.Max(s => s.X + s.Width);
            int yMax = int32Rects.Max(s => s.Y + s.Height);
            var int32Rect = new Int32Rect(xMin, yMin, xMax - xMin, yMax - yMin);
     */
    var xMin = d3.min(chldrnOfDefault.map(function(d){return d.position.iX}))
    var xMax = d3.max(chldrnOfDefault.map(function(d){return d.position.iX + d.iWidth}))
    var yMin = d3.min(chldrnOfDefault.map(function(d){return d.position.iY}))
    var yMax = d3.max(chldrnOfDefault.map(function(d){return d.position.iY + d.iHeight}))
    var returnThis = {  top     : (xMin || 0) - 100,
                        left    : (yMin || 0) -100,
                        width   : d3.max([xMax - xMin,400]),
                        height  : d3.max([yMax - yMin,600]),
                    };
    if(stickyChanges){
        alert(stickyChanges)
        defCompart.iHeight  = d3.max([returnThis.height,700]);
        defCompart.iWidth   = d3.max([returnThis.width,500]);
        defCompart.position = {iX:returnThis.top,iY:returnThis.left};
        returnThis.width = defCompart.iWidth;
        returnThis.height = defCompart.iHeight;
    }
    //
    returnThis.width += 100;
    returnThis.height += 100;
    return returnThis;
}

/**
 * removes the node from mapSpeciesLayouts
 * @param  {string} sId sId of species to be removed
 * @return {boolean}    deletion status
 */
SBMLModel.prototype.removeSpecies = function(sId){
    var mapSpeciesLayouts = this.mapSpeciesLayouts;
    //if(mapSpeciesLayouts.hasOwnProperty(sId)){
    return delete mapSpeciesLayouts[sId];
    //}
    //return false;
}

SBMLModel.prototype.removeReaction =  function(sId){
    var mapReactionLayouts = this.mapReactionLayouts;
    //if(mapSpeciesLayouts.hasOwnProperty(sId)){
    //TODO: is it required to remove edge reference from invloved species node
    return delete mapReactionLayouts[sId];
}

SBMLModel.prototype.removeCompartment =  function(sId){
    var mapCompartmentLayouts = this.mapCompartmentLayouts;
    //if(mapSpeciesLayouts.hasOwnProperty(sId)){
    //TODO: is it required to remove edge reference from invloved species node
    return delete mapCompartmentLayouts[sId];
}
/**
 * Updates the reaction edge map
 * @param  {String}     sId     sId of reactio to be updated.
 * @return {Reaction}           updated reaction object
 * @throws {customErrors.ValidationError}              if invalid reaction sId is provided
 */
SBMLModel.prototype.updateReactionEdges = function(sId){
    var mapReactionLayouts = this.mapReactionLayouts;
    if(!mapReactionLayouts.hasOwnProperty(sId))
        throw  new customErrors.ValidationError(eskinMessages.error.validation_sId_does_not_exist);
    mapReactionLayouts[sId].updateEdges(this.mapSpeciesLayouts);
}
/**
 * Interates through all the nodes and corrects child parent relationship
 * @return {[type]} [description]
 */
SBMLModel.prototype.refreshNodeRelations = function(){
    for(var compartmentsId in this.mapCompartmentLayouts){
        //precondition parentCompartment validation ( no compartment means default )
        var compartment = this.mapCompartmentLayouts[compartmentsId];
        var tree = modelValidator.getParentAndChildrenOfCompartment(this.mapCompartmentLayouts, compartment);

        compartment.sParentCompartment = tree.parent;
        //TODO: figure this shit out. Why this goes in infinite loop
        //this.mapCompartmentLayouts[tree.parent].addChild(compartment.sId);
        // for(var sId in tree.children){
        //     compartment.addChild(sId)
        // };
        //
        //console.warn(tree);
    }

    for(var speciesId in this.mapSpeciesLayouts){
        var species = this.mapSpeciesLayouts[speciesId];
        species.sParentComplex = null;
        var parents = modelValidator.getSpeciesParents(this.mapCompartmentLayouts,this.mapSpeciesLayouts,species);
        var complexParent = this.mapSpeciesLayouts[species.sParentComplex];
        if(parents.sParentComplex){
                //console.warn(parents);
                //console.warn(species);
        }
        species.sParentCompartment = parents.sParentCompartment;
        species.sParentComplex   = parents.sParentComplex;
        this.mapCompartmentLayouts[species.sParentCompartment].addChild(species.sId);

    }
    for(var reactionsId in this.mapReactionLayouts){
        var reaction = this.mapReactionLayouts[reactionsId];
        var parent = modelValidator.findParentCompartmentOfNode(this.mapCompartmentLayouts,reaction);
        reaction.sParentCompartment = parent.sParentCompartment;
        this.mapReactionLayouts[reaction.sId] = reaction;
    }
}
/**
 * returns the object by sid if found.
 * @param  {String} sId sId of the node to be searched.
 * @return {instanceof Base} returns the object node if found.
 */
SBMLModel.prototype.getNodeObjectBySId = function(sId){
    //look for the node in species.
    //object could be model
    if(sId === this.sId) return this;
    //object could be edge
    if(sId.indexOf(':') > -1){
        //find reaction node
        var reactionParents = sId.split(':');
        var reactantSid     = this.mapReactionLayouts[reactionParents[0]] ?
                                        this.mapReactionLayouts[reactionParents[0]] : this.mapReactionLayouts[reactionParents[1]];
        return reactantSid.getAllEdges().filter(function(d){return d.sId === sId})[0];//filter returns array.
    }
    if(this.mapSpeciesLayouts.hasOwnProperty(sId)) return this.mapSpeciesLayouts[sId];
    if(this.mapCompartmentLayouts.hasOwnProperty(sId)) return this.mapCompartmentLayouts[sId];
    if(this.mapReactionLayouts.hasOwnProperty(sId)) return this.mapReactionLayouts[sId];

    return null;
}

/**
 * applys drag i.e. updates position and dimensions of nodes.
 * @param  {{sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}}  dragValues [description]
 * @return {}   finds the node in various maps and applies provided values.
 */
SBMLModel.prototype.applyDrag = function(dragValues){
    var speciesSIds = d3.keys(this.mapSpeciesLayouts);
    var compartmentSIds = d3.keys(this.mapCompartmentLayouts);
    var reactionSIds = d3.keys(this.mapReactionLayouts);
    var thisModel = this;
    d3.keys(dragValues)
        .forEach(function(sId){
            var thisNode;
            var dragNode = dragValues[sId]
            if(speciesSIds.indexOf(sId) != -1){
                thisNode = thisModel.mapSpeciesLayouts[sId];
            }
            else if(compartmentSIds.indexOf(sId) != -1){
                thisNode = thisModel.mapCompartmentLayouts[sId];
            }
            else if(reactionSIds.indexOf(sId) != -1){
                thisNode = thisModel.mapReactionLayouts[sId];
            }
            else{
                __logger.error('apply drag failed : Node with sId '+sId +" does not exists in model.")
                return;
            }
            //proces this node.
            thisNode.iHeight = dragNode.iHeight;
            thisNode.iWidth = dragNode.iWidth;
            thisNode.position = dragNode.position;
        });
}
/**
 * updates the node key value  to newval ( by applying required tranformations)
 * @param  {String} sId    sId of the node to be updated.
 * @param  {String} sKey   key to be updated in this node.
 * @param  {Object|String|Number} newVal new value to be updated.
 * @return {Species|compartment|Reaction}        updated node.
 * @throws {customErrors.ValidationError}
 */
SBMLModel.prototype.setNodeValueByKey = function(sId,sKey,newVal){
    if(!sId || !sKey){
        throw new customErrors.ValidationError('Missing cumpolsary parameter')
    }
    var thisNode = this.getNodeObjectBySId(sId);
    if(!thisNode){
        throw new customErrors.ValidationError(eskinMessages.validation_sId_does_not_exist);
    }
    if(!thisNode.hasOwnProperty(sKey))
        throw new customErrors.ValidationError('Property : '+sKey + ' does not exist.');
    //handle some special cases if any based on entityType
    switch (thisNode.getEntityType()) {
        case 'Edge':
            switch (sKey) {
                case 'rStoichiometry':
                    thisNode.setStoichiometry(parseFloat(newVal));
                    break;
                case 'bConstant':
                    //TODO: this setter must be passed only booleans.
                    thisNode.setConstant(newVal);
                    break;
                case 'sModifierType':
                    thisNode.setModifierType(newVal);
                    break;
                default:
            }
            break;
        default:

    }
    switch (sKey) {
        case 'position':
                newVal.iX = parseFloat(newVal.iX)
                newVal.iY = parseFloat(newVal.iY)
                modelValidator.validate_position(newVal);//this throws error if invalid position.
                thisNode[sKey] = newVal;
            break;
        case 'iHeight':
            //TODO: maintain aspect ration.
            newVal = parseFloat(newVal);
            thisNode[sKey] = newVal;
            break;
        case 'iWidth':
            //TODO: maintain aspect ration.
            newVal = parseFloat(newVal);
            thisNode[sKey] = newVal;
            break;
        default:
            thisNode[sKey] = newVal;
    }
}

//inherits from Base
/**
 * Constructs the Species object
 * @constructor
 * @param options
 * @returns {Species}
 */
function Species(options){
	//call to super constructor
	Base.call(this,options);

	//add species specific properties
	/*
	 * 	bBoundaryCondition: false
		bIsConstant: false
		color: {iRed: 0, iGreen: 0, iBlue: 168, iAlfa: 255}
		dInitialQuantity: 0
		iHeight: 40 -->base
		iWidth: 40 -->base
		position: {iX: 557, iY: 126} -->base
		sHasOnlySubtanceUnit: false
		sId: "S_1" -->base
		sModification: ""
		sName: "e-" -->base
		sParentCompartment: "C_1" -->base
		sParentComplex: ""
		sQuantityType: "Concentration"
		sSubstanceUnit: ""
        this.sNote = ""
		sType: "SIMPLECHEMICAL"
	 */
	this.bBoundaryCondition    = options.bBoundaryCondition || false;
	this.bIsConstant           = options.bIsConstant || false;
	this.color                 = options.color || {iRed: 0, iGreen: 0, iBlue: 168, iAlfa: 255};
	this.dInitialQuantity      = options.dInitialQuantity || 0;
	this.sHasOnlySubtanceUnit  = options.sHasOnlySubtanceUnit || false;
	this.sModification         = options.sModification || "";
	this.sParentComplex        = options.sParentComplex || null;
	this.sQuantityType         = options.sQuantityType || "Concentration";
	this.sSubstanceUnit        = options.sSubstanceUnit || "mole (Pathway Map Default)";
	//TODO : verify this assumption
	//also should this be alerted to user?
	this.sType                 = options.sType || "Gene";
	this.sSpeciesGroup         = options.sSpeciesGroup || "Group 2";
    this.sNote                 = options.sNote || "";
    // if Group 2 [{id:String,title:string,journal:string,volume:String,pages:String,dop:string,author:string}]
    this.sPubMedReferences     = options.sPubMedReferences ||  (this.sSpeciesGroup ==='Group 1'? "":[]);
	/** hidden properties **/
	//species will function as container only if it is of type COMPLEX

	if( this.sType === "Complex"){
		var children = []; /** not a SBML property **/
		this.getAllChildren = function(){return children;}
		this.addChild = function(sId){
			//TODO add validation here to check that added is not compartment
			return children.indexOf(sId) === -1 ?children.push(sId):-1;
		}
		/**
		 * removes child from a child list return array of deleted
		 */
		this.removeChild = function(sId){
			if(children.indexOf(sId) !== -1)
				return children.splice(children.indexOf(sId), 1);
			return null;
		}
	}
	/**
	 * Private variable stores overlayStatus of this Species
	 * @type {String} valid values = UR,DR,UA,ND
	 */
	var overlayStatus = '';
	/**
	 * returns or sets  the overlayStatus of this species
	 * @return {[type]} [description]
	 */
	this.overlayStatus = function(_overlayStatus){
		overlayStatus = _overlayStatus || overlayStatus;
		return overlayStatus;
	}

	//TODO: add edges to the speceis
	var edges = []
    /**
     * store the edge refrence of edge this species is part of
     * @param  {Edge} edge edge object of which this species is part of
     * @return {}      adds this edge to the edge list
     */
    this.addEdge = function(edge){
        if(!edge || edge.constructor.name !=='Edge')
            throw new Error('Species addEdge failed. Invalid edge object added');
        //var allEdgeSIds = edges.map(function(_edge){return _edge.sId});
        //if(allEdgeSIds.indexOf(edge.sId) == -1){
            edges.push(edge);
        //}
        //else{
            //edge allredy exists ignore this for now
            //console.warn('Edge ' + edge.sId + " Edge allready exists");
        //}
    }
    /**
     * remove edge from this species based on the edge sId
     * @param  {Edge} sId edge id to be removed
     * @return {Edge}     removed edge or undefined if not found
     */
    this.removeEdge = function(edge){
        var allEdgeSIds = edges.map(function(_edge){return _edge.sId});
        var spliced;
        if(allEdgeSIds.indexOf(edge.sId) !== -1){
            spliced = edges.splice(allEdgeSIds.indexOf(edge.sId),1);
        }
        return spliced;
    }
    /**
     * returns all the edges this species is part of.
     * @return {[Edge]} all the edges of this species
     */
    this.getAllEdges = function(){
        return edges;
    }

}
//setup inheritance ( prototype chain )
Species.prototype = Object.create(Base.prototype);
Species.prototype.constructor = Species; // Reset the constructor from Base to Species

/**
 * Scomos Logger : Scomos Logger Module
 * Maintains Various Logs,alerts errors etc. 
 * Logger will maintain logs and expose API's to access them systematically
 * 
 * Logger supports six levels of logging: TRACE < DEBUG < INFO < WARN < ERROR < FATAL
 * 
 * library will accept the external logger object which have above mentioned methods
 * in case external logger is not passed library will be use console.log ( Wont have FATAL)
 **/

/** default logger **/
function Logger(){
	var __logger = {};
	var logger = console;
	//setter to attach external logger
	__logger.setLogger = function(__logger){
		logger = __logger;
	}
	
	//add method wrappers to access log method of console or passed logger based on settings
	/**
	 * Method : trace 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.trace = function trace(message){
		if(logger.trace.constructor === Function)
			logger.trace(message);
		else
			console.trace(message);
	}
	
	/**
	 * Method : info 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.info = function trace(message){
		if(logger.info.constructor === Function)
			logger.info(message);
		else
			console.info(message);
	}
	
	/**
	 * Method : debug 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.debug = function debug(message){
		if(logger.debug.constructor === Function)
			logger.debug(message);
		else
			console.log(message);
	}
	
	/**
	 * Method : warn 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.warn = function warn(message){
		if(logger.warn.constructor === Function)
			logger.warn(message);
		else
			console.warn(message);
	}
	
	/**
	 * Method : error 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.error = function error(message){
		if(logger.error.constructor === Function)
			logger.error(message);
		else
			console.error(message);
	}

	/**
	 * Method : fatal 
	* @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.fatal = function fatal(message){
		if(logger.fatal.constructor === Function)
			logger.fatal(message);
		else
			//since console logger have no FATAL method
			console.error("FATAL: " + JSON.stringify(message));
	}
	return __logger;
};

/** expose logger object (console logger as default) **/
	var __logger = d3scomos.Logger = Logger(console); 
/**
 * various constants to be used with SBML object
 * creation etc
 */
var SBMLConstants = {};
SBMLConstants.defaults = {
                            'SIMPLECHEMICAL'        :{iHeight:40,iWidth:40},
                            'GENERICPROTEIN'        :{iHeight:40,iWidth:80},
                            'GENE'                  :{iHeight:40,iWidth:80},
                            'RNA'                   :{iHeight:40,iWidth:80},
                            'RECEPTOR'              :{iHeight:40,iWidth:60},
                            'PHENOTYPE'             :{iHeight:40,iWidth:80},
                            'PERTURBINGAGENT'       :{iHeight:40,iWidth:80},
                            'SOURCEORSINK'          :{iHeight:40,iWidth:40},
                            'LIGAND'                :{iHeight:40,iWidth:40},
                            'TRANSCRIPTIONFACTOR'   :{iHeight:40,iWidth:80},
                            'ENZYME'                :{iHeight:40,iWidth:80},
                            'COMPLEX'               :{iHeight:160,iWidth:130},
                            'RECTANGULAR'           :{iHeight:80,iWidth:160},
                            'CIRCULAR'              :{iHeight:80,iWidth:160},
                            //'REACTION'              :{iHeight:20,iWidth:20},
                            'GENERAL'               :{iHeight:20,iWidth:20},
                            'TRANSPORT'             :{iHeight:20,iWidth:20},
                            'TRANSCRIPTION'         :{iHeight:20,iWidth:20},
                            'TRANSLATION'           :{iHeight:20,iWidth:20},
                            'COMPLEXFORMATION'      :{iHeight:20,iWidth:20},
                            'COVALENTMODIFICATION'  :{iHeight:20,iWidth:20}
                        }
SBMLConstants.colorConstants = {
            'GENERAL'               :'rgb(0,0,0)',
            'TRANSPORT'             :'rgb(120,51,47)',
            'TRANSCRIPTION'         :'rgb(235,78,227)',
            'TRANSLATION'           :'rgb(70,116,163)',
            'COMPLEX FORMATION'     :'rgb(19,170,214)',
            'COVALENT MODIFICATION' :'rgb(254,148,6)',

}

SBMLConstants.objectDefaults = {
                                'edgeColor':{iRed: 0, iGreen: 0, iBlue: 0, iAlfa: 255}//equates to black color
                                }

/**
 * Various constants regarding the keystore functionalities
 */
var keyStoreConstants = {};

keyStoreConstants.speciesPrefix = 'S';
keyStoreConstants.compartmentPrefix = 'C';
keyStoreConstants.reactionPrefix = 'R';
keyStoreConstants.keySeperator = '_';

// all resizer constants shall go here

//TODO : constants are private. Should they be made public?
var  resizerConstants = {};
resizerConstants.handleHeight   = 7;
resizerConstants.handleWidth    = 7;

resizerConstants.minHeight = 14; // height of resized object shall not be less that this

//this tells what type of resizer for what type of node
//entries can be used to also enable disable the resizers
resizerConstants.typeAssociations = {'fourPoint' : ['speceis-node'],
                                     'eightPoint' : ['compartment']
                                    }

/** various constants for use within the custom library **/

/**
 * shape constants : JSON defines various shape drawing/ behavior specific constants
 */
var shapeConstants = d3scomos.shapeConstants = {};
    // constants to be used in the custom symbol drawing
    shapeConstants.GENERIC_PROTIEN_RECT_ROUNDNESS_FACTOR = 0.2;
    shapeConstants.SPECIES_SHAPE_OFFSET = 0.2;

    // constants for gene overlay gradient
    shapeConstants.gradient             = {}
    shapeConstants.gradient.species     = {firstFill:"rgb(255,255,255)",
                                            secondFill:'rgb(51, 33, 161)',
                                         };
     shapeConstants.gradient.GEOverlay  ={
                                          secondFill:'rgb(51, 33, 161)',
                                          disabledFill:'rgb(229, 229, 229)',
                                         }

/**
 * creates arrayUtil : set array data manip functions
 */
var arrayUtil = d3scomos.arrayUtil = {};

/**
 * function objectToArray : converts keyed json object to unkeyd data array
 */
arrayUtil.objectToArray = 
	function(data){
		var arrayOfObj = [];
		for(var key in data){
			arrayOfObj.push(data[key])
		}
		return arrayOfObj;
	};

/**
 * returns index of an object in array
 * @param {Array} arr array of objects
 * @param {Object} needle object to be searched in array
 * @returns {Number} return index of object if found ( 0 based) else -1 
 */
arrayUtil.getIndexOfObject = function getIndexOfObject(arr,needle)
{
	var foundAt = -1;
	if(arr && objectHelper.isArray(arr)){
		if(needle){
			//TODO forEach cannot broken so may be implement this with for loop instead
			arr.forEach(function(obj,index){
				if(JSON.stringify(needle) === JSON.stringify(obj))
					{
					foundAt = index;
					}
			});
		}
	}
	return foundAt;//not found
}

/**
 * removes (splice) the array element(object) if exists
 * @param {Array} arr array of objects
 * @param {Object} needle object to be searched in array
 * @returns {Number} returns array of deleted elements 
 */
arrayUtil.removeElement = function removeElement(arr,needle){
	var deleted = [];
	var pos = arrayUtil.getIndexOfObject(arr, needle);
	if(pos!== -1)
		deleted = arr.splice(pos, 1)
	return deleted;
}
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

/**
 * Contains various helper methods to test convert etc. javascript object
 */

var objectHelper = d3scomos.objectHelper ={};
/**
 * tests if passed is really an object
 * @param obj obj to be tested for being an object ( sounds weird) :;
 */
objectHelper.isObject = function isObject(obj){
	 return obj && (typeof obj  === "object");
}

/**
 * tests if passed is really an array
 * @param {Array} array to be tested for being an array
 * @returns
 */
objectHelper.isArray = function isObject(array){
	 //return array && (typeof array  instanceof Array);
	return array.constructor === Array
}

/** check if passed is really the string
 * @param {string} obj to be tested for being string
 */
objectHelper.isString = function isString(obj){
	return typeof obj === 'string';
}

/**
 * Checlk if passed is the function
 * @param {function} function to be tested for being function
 * @returns {Boolean} weather passed is a funcion or not
 **/
objectHelper.isFunction = function isFunction(functionToCheck) {
	 var getType = {};
	 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}
/**
 * returns hash for the string variable. Use apply or call pattern when calculating hash
 * @return {Number} 32 bit hash of this object
 */
objectHelper.getStringHash = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
/**
 * test if string contains only alphabets
 * @param {String} needle string to be tested
 * @param  {Boolean} uCase default true means only upper case allowed else only lower case allowed
 * @param {boolean} ignoreCase if passed first param will be ignored
 * @return {boolean}      wheather
 */
objectHelper.isAlphabetsOnly = function(needle,uCase,ignoreCase){
    if(typeof uCase === 'undefined') uCase = true; //default to upper
    if(typeof ignoreCase === 'undefined') ignoreCase = false;
    var regex;
    if(uCase == true)
        regex = /^[A-Z]+$/ ;
    else
        regex = /^[a-z]+$/;
    if(ignoreCase == true)
        regex = /^[A-Z a-z]+$/
    return regex.test(needle);
};
/**
 * return if passed needle in valid integer
 * @param  {String|Number} needle needle to be tested for integer
 * @return {[type]}        returns weather needle is integer or not
 *                         00001 is valid integer
 */
objectHelper.isInteger = function(needle){
    return /^[0-9]+$/.test(needle);
}
/**
 * Compare two string arrays. IMPORTANT : make sure arrays are valid JSON arrays i.e. no loops, methods etc.
 * @param  {[String]} target string array to be compared
 * @return {Boolean}        Boolean Stating equality. if invalid data is provided it will still return boolean i.e. false;
 */
//TODO: should it be set instead?
objectHelper.compareStringArray = function(target){
    if(!objectHelper.isArray(this) || !objectHelper.isArray(target))
        return false;
    var _source = this.map(function(d){return d});
    var _target = target.map(function(d){return d});
    //sort both arrays
    _source.sort();
    _target.sort();
    return JSON.stringify(_source) === JSON.stringify(_target);
}
/**
 * checks if the array has particular node. Assumes the array to have only sbmlNodes.
 * @param  {String} sId needle to be searched.
 * @return {boolean} weather node is in array or not.
 */
objectHelper.isNodeInArray = function(sourceArray,sId){
    if(!sourceArray || !sourceArray.length || sourceArray.length == 0 || !sId) return false;
    for(var nodeIndex in sourceArray){
        if(sourceArray[nodeIndex].sId === sId) return true
    }
    return false;
}
/**
 * deep copies the node object.
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
objectHelper.deepCopyNodeObject = function(node){
    try{
        return JSON.parse(JSON.stringify(node));
    }
    catch(parseErr){
        __logger.error('Node deep copy failed : ' + parseErr.message)
        return null;
    }
}
/**
 * deep copies the scomos selection object returned by various selection methods.
 * @param   {{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}} toBeDeepCopied object to be deep copied.
 * @return  {{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}}                [description]
 */
objectHelper.deepCopyScomosSelections = function(toBeDeepCopied){

}

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


/**
 * creates the resizer object
 * @return {Objects}         resizer object with Various helper methods.
 */
var resizer = d3scomos.resizer = (function(){
    /**
     * return the resize handle
     * @return {[type]} [description]
     */
     var dragSE = d3.behavior.drag()
        //.origin(Object)
        .on("dragstart",dragSEStart)
        .on("drag", dragSE)
        .on("dragend",dragSEEnd);
    var dragSEStart = function(d){
        d3.event.sourceEvent.stopPropagation();
        //console.warn('drag SE Started');
    }
    var dragSE = function(d){
        d3.event.stopPropagation();
        //console.warn('dragging SE');
        var thisNode = this;
        if(d3.event.dx  && d3.event.dy ){
            thisNode.attr('x', parseFloat(thisNode.attr('x')) + d3.event.dx);
            thisNode.attr('y',parseFlaot(thisNode.attr('y'))+d3.event.dy);
        }

    }
    var dragSEEnd = function(d){
        //console.warn('drag se eneded');
    }
    /**
     * Sets up the resizer around provided node.
     * @param  {D3 selector} node        d3 selector pointing node.
     * @param  {Number} resizerType resizer type value 0- 4 point ,1-8 point.
     * @return {}     sets up the resizer UI with provided settings.
     */
    var setupResizer = function (node,resizerType){
        //add group elem to the node with reisizer classed
        //add respective rects
        //add proper classes to these
        resizerType = resizerType || 0;
        var nodeData = node.datum();
        var rDimensions = node.select('path').node().getBBox();
        //console.warn(node.select('path').node().getBBox())
        var nodeH = rDimensions.height;
        var nodeW = rDimensions.width;
        var h = 7;
        var w = 7;
        //var resizerG = node.append('g').classed('resizer',true)
        //add NW
        var NWRect = node.append('rect').classed('resizer',true).classed('rNW',true)
                            .attr('x',-w).attr('y',-h)
                            .attr('height',h).attr('width',w);
        //add NE
        var NERect = node.append('rect').classed('resizer',true).classed('rNE',true)
                            .attr('x',nodeW).attr('y',-h)
                            .attr('height',h).attr('width',w);
        //add SE
        var SERect = node.append('rect').classed('resizer',true).classed('rSE',true)
                            .attr('x',nodeW).attr('y',nodeH)
                            .attr('height',h).attr('width',w);
        //add SW
        var SWRect = node.append('rect').classed('resizer',true).classed('rSW',true)
                            .attr('x',-w).attr('y',nodeH)
                            .attr('height',h).attr('width',w);
        if(resizerType == 1){
            var NRect = node.append('rect').classed('resizer',true).classed('rN',true)
                                .attr('x',nodeW/2).attr('y',-h)
                                .attr('height',h).attr('width',w);

            var ERect = node.append('rect').classed('resizer',true).classed('rE',true)
                                .attr('x',nodeW).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);

            var SRect = node.append('rect').classed('resizer',true).classed('rS',true)
                                .attr('x',nodeW/2).attr('y',nodeH)
                                .attr('height',h).attr('width',w);

            var WRect = node.append('rect').classed('resizer',true).classed('rW',true)
                                .attr('x',-w).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);
        }
    }
    /**
     * update resize handlers
     * @param  {D3 Selector} node d3 selector with resizer attached to it.
     * @return {}      updates the resizer based on the nwe sise data.
     */
    var updateResizer = function(node){

        if(!node)
            node = d3.select('.resizer');

        var nodeData = node.datum();
        var rDimensions = node.select('path').node().getBBox();
        //console.warn(node.select('path').node().getBBox())
        var nodeH = rDimensions.height;
        var nodeW = rDimensions.width;
        var h = 7;
        var w = 7;
        node.each(function(){
            var NWRect = node.select('.rNW')
                                .attr('x',-w).attr('y',-h)
                                .attr('height',h).attr('width',w);
            var NERect = node.select('.rNE')
                                .attr('x',nodeW).attr('y',-h)
                                .attr('height',h).attr('width',w);
            var SERect = node.select('.rSE')
                                .attr('x',nodeW).attr('y',nodeH)
                                .attr('height',h).attr('width',w);
            var SWRect = node.select('.rSW')
                                .attr('x',-w).attr('y',nodeH)
                                .attr('height',h).attr('width',w);

            var NRect = node.select('.rN')
                                .attr('x',nodeW/2).attr('y',-h)
                                .attr('height',h).attr('width',w);

            var ERect = node.select('.rE')
                                .attr('x',nodeW).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);

            var SRect = node.select('.rS')
                                .attr('x',nodeW/2).attr('y',nodeH)
                                .attr('height',h).attr('width',w);

            var WRect = node.select('.rW')
                                .attr('x',-w).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);
        })
    }
    /**
     * resizes the current shape based on the resizeStatus vlaues.
     * @param  {
     *         isResizing:Boolean ,activeResizeHandle:String,
     *         node:{D3 selector},
     *         event:{D3 drag event}}; resizeStatus params required to process this resize event
     * @return {}             handles the drag shape resize and redraw, transform etc for both
     *                        node shape and resize handlers
     */
    var processResize = function(resizeStatus){
        var thisNode = resizeStatus.node;
        var thisData = thisNode.datum();
        var event = resizeStatus.event;
        var aspectRatio = thisData.iWidth / thisData.iHeight;

        if(resizeStatus.activeResizeHandle === 'rN'){
            var oldHeight = thisData.iHeight;
            thisData.iHeight    -=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;

            thisData.position.iY -= thisData.iHeight - oldHeight;
        }
        else if(resizeStatus.activeResizeHandle === 'rE'){
            thisData.iWidth    +=  event.dx;
            if(thisData.iWidth < 10 ) thisData.iWidth = 10;
        }
        else if(resizeStatus.activeResizeHandle === 'rS'){
            thisData.iHeight    +=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
        }
        else if(resizeStatus.activeResizeHandle === 'rW'){
            var oldWidth = thisData.iWidth;
            thisData.iWidth    -=  event.dx;
            if(thisData.iWidth < 10 ) thisData.iWidth = 10;

            thisData.position.iX -= thisData.iWidth - oldWidth;
        }
        else if(resizeStatus.activeResizeHandle === 'rNE'){
            //rule width follows height
            thisData.iHeight    -=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;
            //thisData.position.iX += event.dx;
            thisData.position.iY += event.dy;
        }
        else if(resizeStatus.activeResizeHandle === 'rSE'){
            //rule width follows height
            thisData.iHeight    +=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;
            //thisData.position.iX += event.dx;
            //thisData.position.iY += event.dy;
        }
        else if(resizeStatus.activeResizeHandle === 'rSW'){
            //rule width follows height
            var oldWidth = thisData.iWidth;
            thisData.iHeight    +=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;

            thisData.position.iX += oldWidth - thisData.iWidth;
            //thisData.position.iY += event.dy;
        }
        else if(resizeStatus.activeResizeHandle === 'rNW'){
            //rule width follows height
            var oldWidth = thisData.iWidth;
            thisData.iHeight    -=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;

            thisData.position.iX -= thisData.iWidth - oldWidth;
            thisData.position.iY += event.dy;
        }

        modelHelper.updateNodeView(thisNode)
        updateResizer(thisNode);
        //update affecting links
        d3.selectAll('.link').attr('d', function(d){return shapeUtil.getPathCoordsForLine(d.source, d.target, d.role)});

    }
    /**
     * Finds removes any resizers on from the page
     * @return {D3 selection} selection of deleted resizers
     */
    var clearAllResizers = function(){
        return d3.selectAll('.resizer').remove();
    }
    return {
        /**
         * adds the resizer to the passed in node.
         * @param  {D3 selector} node vaid d3 selector to the target node.
         * @return {D3 selector} d3 selector pointing to this node.
         * @throws {Error} if invalid node is passed
         */
        addResizer:function(node){
            //console.warn(node);
            if(!node)
                throw new Error('Empty node value passed');
            if(! (node instanceof d3.selection))
                throw new Error('Pass valid d3 Selector');
            if(node.size() == 0)
                throw new Error('Empty d3 selctor passed');
            //remove resizers if any
            clearAllResizers();
            //construct resizer rects assuming
            if(node.datum().getEntityType() === 'Compartment')
                setupResizer(node,1);
            else
                setupResizer(node);
        },
        // /**
        //  * finds and updates all resizer handlers or only node if node is passed
        //  * @param  {D3 Selector} node d3 selector with resizer attached to it.
        //  * @return {}      updates the resizer based on the nwe sise data.
        //  */
        // updateResizer:function(node){
        //     updateResizer(node);
        // },
        /**
         * resizes the current shape based on the resizeStatus vlaues.
         * @param  {
         *         isResizing:Boolean ,activeResizeHandle:String,
         *         node:{D3 selector},
         *         event:{D3 drag event}}; resizeStatus params required to process this resize event
         * @return {[type]}              [description]
         * //NOTE: no need to rest this method seperately as this will be called internally by the
         * 			drag method, as resize and drag behaviours are now triggered from same handler
         */
        processResize:function(resizeStatus){
            //process this reszie if true resize
            //maybe validate resizeStatus params
            //TODO: add param validation here
            if(resizeStatus.isResizing == true){
                processResize(resizeStatus);
            }
        },
        /**
         * clears any resizer on the current page unless node is passed.
         * @return {D3 selector} d3 selector pointing to this node.
         */
        clearResizer:function(){
            return d3.selectAll('.resizer').remove();
        },
        /**
         * updates the resizer hanldes by readding them on selected node.
         * @return {} checks if only one node is selected and adds the resizer hanldes.
         */
        updateResizer:function(){
            this.clearResizer();
            var _selection = d3.selectAll('.selected');
            //proceed if only one item is selcted
            if ( _selection.size() == 1 && !_selection.classed('reaction-node') && !_selection.classed('link')){
                this.addResizer(_selection);
            }
        }
    }
})();

/**
 * Module : construction
 * Takes care various construction tasks
 * Has various setters and getters to set up construction configs
 * For more details on the assumptions and design considerations refer to Readme.txt
 */
/**
 * creates the eskin mapConstructor object
 * @constructor
 * @return {modelConstructor} a model constructor object
 */

 function modelConstructor(rootElem,keyStore,model,operations){
    var consConst = constructionConstants;
    var isEnabled = false;
    var factory = SBMLFactory();
    var reactionConstructor = {source:null,target:null};
    var isConstructingNode = false;
    var construnctionConfig = {
        buildingEdge    :false,
        buildingNode    :false,
        activeToolType  :'',//should be one of species,compartment edges
        activeTool      :'',// currently selected tool form active tool type
        mode            :'DISCONTINUOUS',//unset values means that mode is not continuous draw.
    }
    /**
     * any pending construnctin jobs will be flushed. s
     * @return {[type]} [description]
     */
    function clearConstrunction(){
        reactionConstructor.source = null;
        reactionConstructor.target = null;
        construnctionConfig.buildingEdge = false;
        construnctionConfig.buildingNode = false;
    }
    /**
     * Resets construciton tool setting
     * @return {} reset active to tool to none change construction mode etc
    */
     var resetTools = function(){
         if(!construnctionConfig.buildingEdge){
             construnctionConfig.activeToolType = ''
             construnctionConfig.activeTool = '';
             //TODO: expose the event informing node construnct config change for outer
            __logger.info('construnction disabled. No active tool')
            dispatchToolChange();
         }
         else{
             console.warn('not resetting tools as edge construnction is in progress.');
         }

     }
     var dispatchToolChange = function(){
        eskinDispatch.toolStateChanged(construnctionConfig);
     }
     function getNodeConstrunctionOptions(event){
         // based on current tool construct a new object with aboce co ordinates
         var SBMLConst = SBMLConstants.defaults[construnctionConfig.activeTool];
         var _position = modelHelper.getTransformedCordinates(rootElem,event);
         //normalize _position
         _position.iX -= SBMLConst.iWidth/2;
         _position.iY -= SBMLConst.iHeight/2;
         var options = {iHeight:SBMLConst.iHeight,
                        iWidth:SBMLConst.iWidth,
                        position:_position,
                        sType:getMappedStypeFromTool(construnctionConfig.activeTool)
                    };
        options.sSpeciesGroup = getMappedGroupFromStype(options.sType);
        return options;
     }
     function getReactionConstrunctionOptions(){
         var SBMLConst = SBMLConstants.defaults[construnctionConfig.activeTool];
         var _position = shapeUtil.getMidPoint(reactionConstructor.source,reactionConstructor.target);
         var options = {sId:keyStore.getNextReaction(),
                        iHeight:SBMLConst.iHeight,
                        iWidth:SBMLConst.iWidth,
                        position:_position,
                        sType:getMappedStypeFromTool(construnctionConfig.activeTool)
                    };
         var reaction  = factory.getReaction(options);
         reaction.addReactant(reactionConstructor.source);
         reaction.addProduct(reactionConstructor.target);
         return reaction;
     }
     /**
      * Adds node to model based on current event and construction settings
      * @param  {D3 event} event D3 event ( generally mouse down on canvas)
      * @return {}    adds node to model and to View sets up entry in undo manager
      */
     var _constructNode = function (event){
        if(!construnctionConfig.activeToolType){
            __logger.info('Construnction aborted : no active tool selected')
            return;
        }

        // add model
        // refresh View
        // update undo manager
        try{
            if(!construnctionConfig.buildingNode || construnctionConfig.buildingEdge ){
                construnctionConfig.buildingNode = true;//mark that Construnction is active
                switch (construnctionConfig.activeToolType) {
                    case 'SPECIES':
                        var options = getNodeConstrunctionOptions(event);
                        options.sId = keyStore.getNextSpecies();
                        operations.addSpecies(options);
                        //construnctionConfig.buildingNode = false;//construnction done.
                        operations.refreshView();
                        break;
                    case 'COVALENT':
                        //this operations is allowed only on species which are not complex
                        var thisTarget = d3.select(event.target);
                        var thisData = thisTarget.datum();
                        if(!thisData){
                            construnctionConfig.buildingNode = false;
                            return "";
                        }
                        var options = thisData; //so that sid could be returned
                        if(thisData.getEntityType() === 'Species' && thisData.sType !== 'Complex'){
                            operations.addCovalantModification(thisData.sId,construnctionConfig.activeTool);
                        }
                        //construnctionConfig.buildingNode = false;//construnction done.
                        break;
                    case 'COMPARTMENT':
                        var options = getNodeConstrunctionOptions(event);
                        options.sId = keyStore.getNextCompartment();
                        operations.addCompartment(options);
                        //construnctionConfig.buildingNode = false;//construnction done.
                        break;
                    case 'REACTION' :
                        var thisNode    = d3.select(event.target).datum();
                        if(!thisNode) return "";
                        var entityType  = thisNode.getEntityType();
                        if(!construnctionConfig.buildingEdge){
                            //record source.
                            if(verifytoolSource(construnctionConfig.activeTool,entityType)){
                                console.warn('Buildong reaction : ' + construnctionConfig.activeTool);
                                construnctionConfig.buildingEdge = true;
                                reactionConstructor.source = thisNode;
                                return "";//nothing to choose
                            }else{
                                console.warn('invalid source '+thisNode.sId + " for tool : "+construnctionConfig.activeTool);
                                clearConstrunction();
                                return "";//nothing to choose

                            }
                        }else{
                            //record target.
                            if(verifytoolTarget(construnctionConfig.activeTool,entityType)){
                                switch (construnctionConfig.activeTool) {
                                    case 'ADDPRODUCT':
                                        try{
                                            operations.addProduct(reactionConstructor.source.sId,{sId:thisNode.sId});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return reactionConstructor.source.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Product failed: '+err.message);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Product failed: '+err.message});
                                        }
                                        break;
                                    case 'ADDREACTANT':
                                        try{
                                            operations.addReactant(thisNode.sId,{sId:reactionConstructor.source.sId});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return thisNode.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Reaction failed: '+err);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Reactant failed: '+err.message});
                                        }
                                        break;
                                    case 'ACTIVATOR':
                                        try{
                                            operations.addModifier(thisNode.sId,{sId:reactionConstructor.source.sId,sModifierType:"Activator"});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return thisNode.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Modifier failed: '+err.message);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Modifier failed: '+err.message});
                                        }
                                        break;
                                    case 'INHIBITOR':
                                        try{
                                            operations.addModifier(thisNode.sId,{sId:reactionConstructor.source.sId,sModifierType:"Inhibitor"});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return thisNode.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Modifier failed: '+err.message);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Modifier failed: '+err.message});
                                        }
                                        break;
                                    default:
                                        //means source is allready recored. record target
                                        //and construnct reactions.
                                        construnctionConfig.buildingEdge = false;
                                        //construnctionConfig.buildingNode = false;//construnction done.
                                        reactionConstructor.target = thisNode;
                                        var options = getReactionConstrunctionOptions();
                                        operations.addReaction(options);
                                        //construnctionConfig.buildingNode = false;//construnction done.
                                }
                            }
                        }
                        break;
                    case 'MODIFIER':

                        break;
                    default:
                        console.warn('No active Tool :Construnction Aborted');
                }
            }
            //construnctionConfig.buildingNode = false;//construnction done.
            if(options) return options.sId;
            return "";
        }catch(err){
            construnctionConfig.buildingNode = false;//construnction done.
            construnctionConfig.buildingEdge = false;//construnction done.
            __logger.error("construct node operation failed. "+err.message);
            return "";
        }
     }
     /**
      * ToolName for active Tool
      * @param  {String} toolName
      * @return {string}          current active toolName
      * @throws {Error} throws error if invaid toolName specified
      */
     var _setActiveTool = function(toolName){
        //find category of this tool
        var toolFound = false;
        for( var category in consConst.tools){
            if(consConst.tools[category].indexOf(toolName)!== -1){
                //update config
                construnctionConfig.activeToolType = category.toUpperCase();;
                construnctionConfig.activeTool = toolName.toUpperCase();
                toolFound = true;
                clearConstrunction();
                break;
            }
        }
        if(!toolFound)
            throw new Error('Invalid toolName : '+toolName +". Not supported by library.")
        __logger.info(toolName + " is active tool.")
        dispatchToolChange();
     }
     /**
      * function checks if the event.target is valid i.e. allowed for construnction.
      * @param  {event}  event Event object to be validated.
      * @return {Boolean}       is valid target or not.
      */
     function isValidEventTarget(event){
        var target = event.target;
        if(!target) return false; //target must exist
        if(target.tagName === 'svg')
            return true;

        var thisData = d3.select(target).datum();
        if(construnctionConfig.activeToolType.toUpperCase() === 'COVALENT' && (thisData && thisData.getEntityType() === 'Species' && thisData.sType.toUpperCase() !== 'COMPLEX')){
            return true;
        }
        if(construnctionConfig.activeToolType.toUpperCase() === 'SPECIES' && (thisData && thisData.getEntityType() === 'Species' && thisData.sType.toUpperCase() === "COMPLEX")){
            return true
        }
        if(construnctionConfig.activeToolType.toUpperCase() === 'REACTION' )//|| (thisData && thisData.getEntityType() === 'Species' && thisData.sType.toUpperCase() === 'COMPLEX')
            return true;
        return false;
     }
     return {
        enable:function(){
            isEnabled = true;
        },
        disable:function(){
            isDisabled = false;
            //TODO: clear tools
        },
        /**
         * Adds node to model based on current event and construction settings
         * @param  {D3 event} event D3 event ( generally mouse down on canvas)
         * @return {}    adds node to model and to View sets up entry in undo manager
         */
        constructNode:function(event){
            var _sId ;
            if(isEnabled && isValidEventTarget(event)){
                _sId = _constructNode(event);
            }
                //mark this node selected
                var node;
                if(_sId){
                    switch (construnctionConfig.activeToolType) {
                        case 'SPECIES':
                            node = d3.selectAll(".species-node").filter(function(d){return d.sId === _sId});
                            break;
                        case 'COVALENT':
                            //TODO: figure out way to select the construncted covalent instead
                            node = d3.selectAll(".species-node").filter(function(d){return d.sId === _sId});
                            break;
                        case 'COMPARTMENT':
                            node = d3.selectAll(".compartment").filter(function(d){return d.sId === _sId});
                            break;
                        case 'REACTION' :
                            console.warn('Buildong reaction' + construnctionConfig.activeTool);
                            break;
                        default:

                    }
                    if(construnctionConfig.mode === 'DISCONTINUOUS'){
                        resetTools();
                    }
                    if(node)
                        modelHelper.triggerClickOnNode(node);
                        //this is IMPORTANT : don't reset this value before the node select is triggered. Other wise
                        //construnction will be triggered reslulting infinite loop
                        setTimeout(function(){
                            construnctionConfig.buildingNode = false;//construnction done.
                        })
                }

            else{
                __logger.warn("Construction mode not enabled");
            }
        },
        /**
         * set current active tool if construnction enabled
         * @param  {String} toolName [description]
         * @return {String}        current active toolName
         * @throws {Error} throws error if invaid toolName specified
         */
        setActiveTool:function(toolName){
            if(isEnabled)
                _setActiveTool(toolName);
        },
        /**
         * sets the construnction mode to correct values dispatches event informing said changed
         * @param  {String} mode valid values CONTINUOUS and  DISCONTINUOUS
         * @return {[type]}      [description]
         */
        setConstrunctionMode:function(mode){
            switch (mode) {
                case 'CONTINUOUS':
                    construnctionConfig.mode = mode;
                    break;
                case 'DISCONTINUOUS':
                    construnctionConfig.mode = mode;
                    break;
                default:
                    __logger.console.warn("invalid construnction mode : " +mode + "specified");
            }
            dispatchToolChange();
        },
        /**
         * returns the source object if reaction is being built else returns false;
         * @return { Species||Reaction || undefined} source object if constructing edge else undefined.
         */
        isConstructingEdge:function(){
            return construnctionConfig.buildingEdge;
        },
        /**
         * stops current construnction operation, without resetting the tools.
         * @return {[type]} [description]
         */
        stopCurrentOperation : function(){
            clearConstrunction();
        },
        /**
         * returns the private reactionConstructor varialbe which tracks sources and target for the edge to be drawn.
         * @return {{source:SBMLNode,target:SBMLNode}} [description]
         */
        getReactionConstructor:function(){
            return reactionConstructor;
        },
        updateRootElem : function(newRootElem){
            rootElem = newRootElem;
        },
        getDetails : function(){
            return construnctionConfig;
        }
     }
}

/**
 * Will hold all the constants regarding the construction functionality.
 * make sure contants from this file are exclusively used inside the construction module only
 * as this file is part of conditional build.
 */

var constructionConstants = {};

constructionConstants.tools = {
    species:['SIMPLECHEMICAL','GENERICPROTEIN','GENE','RNA','RECEPTOR',
            'PHENOTYPE','PERTURBINGAGENT','SOURCEORSINK','LIGAND',
            'TRANSCRIPTIONFACTOR','ENZYME','COMPLEX'],
    compartment:['RECTANGULAR','CIRCULAR'],
    covalent:['PHOSPHORYLATION','LIPIDATION','UBIQUITINATION','GLYCOSYLATION','ACETYLATION','OTHER'],
    reaction:['GENERAL','TRANSPORT','TRANSCRIPTION','TRANSLATION','COMPLEXFORMATION','COVALENTMODIFICATION','ADDPRODUCT','ADDREACTANT','ACTIVATOR','INHIBITOR'],
}
constructionConstants.covalentToolMappings = {'PHOSPHORYLATION':'P','LIPIDATION':'L','UBIQUITINATION':'U',
                                              'GLYCOSYLATION':'G','ACETYLATION':'A','OTHER':'O'};

constructionConstants.toolToTargetMapping = {
        'GENERAL'           :{source:['Species'],target:['Species']},
        'TRANSPORT'         :{source:['Species'],target:['Species']},
        'TRANSCRIPTION'     :{source:['Species'],target:['Species']},
        'TRANSLATION'       :{source:['Species'],target:['Species']},
        'COMPLEXFORMATION'  :{source:['Species'],target:['Species']},
        'COVALENTMODIFICATION':{source:['Species'],target:['Species']},

        'ADDPRODUCT'    :{source:['Reaction'],target:['Species']},
        'ADDREACTANT'   :{source:['Species'],target:['Reaction']},
        'ACTIVATOR'     :{source:['Species'],target:['Reaction']},
        'INHIBITOR'     :{source:['Species'],target:['Reaction']},
}
var typeMappings = {
    //--species type mapping
    "Simple Chemical"    :"SIMPLECHEMICAL",
    "Generic Protein"    :"GENERICPROTEIN",
    "DNA (Gene)"         :"GENE",
    "RNA"               :"RNA",
    "Receptor"          :"RECEPTOR",
    "Phenotype"         :"PHENOTYPE",
    "Perturbing Agent"   :"PERTURBINGAGENT",
    "Source/Sink"       :"SOURCEORSINK",
    "Ligand"            :"LIGAND",
    "Transcription Factor":"TRANSCRIPTIONFACTOR",
    "Enzyme"            :"ENZYME",
    "Complex"           :"COMPLEX",
    "REACTION"          :"REACTION",
    "Invalid Molecule(s)":"GENE",
    //--- compartment type mappings
    "Rectangular"       :"RECTANGULAR",
    "Circular"          :"CIRCULAR",
    //-- following are reaction type mappings
    "General"           :"GENERAL",
    "Transport"         :"TRANSPORT",
    "Transcription"     :"TRANSCRIPTION",
    "Translation"       :"TRANSLATION",
    "Complex Formation" :"COMPLEXFORMATION",
    "Covalent Modification" : "COVALENTMODIFICATION",
}

var groupMapping ={
    'Group 1':['Generic Protein','DNA (Gene)','RNA','Receptor','Transcription Factor','Enzyme'],
    'Group 2':['Simple Chemical','Phenotype','Perturbing Agent','Source/Sink','Ligand']
}
function getMappedGroupFromStype(sType){
    if(groupMapping['Group 1'].indexOf(sType) != -1) return 'Group 1';
    return 'Group 2';
}
function getMappedStypeFromTool(symbolVal){
    var typeKeys = d3.keys(typeMappings);
    for(var key in typeKeys){
        if(typeMappings[typeKeys[key]] === symbolVal)
            return typeKeys[key];
    }
}

function verifytoolSource(toolName,entityType){
    var toolMapping = constructionConstants.toolToTargetMapping[toolName];
    if(toolMapping){
        return toolMapping.source.indexOf(entityType) != -1;
    }
    else{
        __logger.warn('Invalid ToolType'+ toolName+' specified in toolMappings')
        return false;
    }
}

function verifytoolTarget(toolName,entityType){
    var toolMapping = constructionConstants.toolToTargetMapping[toolName];
    if(toolMapping){
        return toolMapping.target.indexOf(entityType) != -1;
    }
    else{
        __logger.warn('Invalid ToolType'+ toolName+' specified in toolMappings')
        return false;
    }
}

/**
* Barchart add on for d3 library 
*
**/ 
d3scomos.barChart = function module() {
    var margin = {top: 20, right: 20, bottom: 40, left: 40},
        width = 500,
        height = 800,
        gap = 0,
        ease = 'cubic-in-out';
    var svg, duration = 500;

    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data) {

            var chartW = width - margin.left - margin.right,
                chartH = height - margin.top - margin.bottom;

            var x1 = d3.scale.ordinal()
                .domain(_data.map(function(d, i){ return i; }))
                .rangeRoundBands([0, chartW], .1);

            var y1 = d3.scale.linear()
                .domain([0, d3.max(_data, function(d, i){ return d; })])
                .range([chartH, 0]);

            var xAxis = d3.svg.axis()
                .scale(x1)
                .orient('bottom');

            var yAxis = d3.svg.axis()
                .scale(y1)
                .orient('left');

            var barW = chartW / _data.length;

            if(!svg) {
                svg = d3.select(this)
                    .append('svg')
                    .classed('chart', true);
                var container = svg.append('g').classed('container-group', true);
                container.append('g').classed('chart-group', true);
                container.append('g').classed('x-axis-group axis', true);
                container.append('g').classed('y-axis-group axis', true);
            }

            svg.transition().duration(duration).attr({width: width, height: height})
            svg.select('.container-group')
                .attr({transform: 'translate(' + margin.left + ',' + margin.top + ')'});

            svg.select('.x-axis-group.axis')
                .transition()
                .duration(duration)
                .ease(ease)
                .attr({transform: 'translate(0,' + (chartH) + ')'})
                .call(xAxis);

            svg.select('.y-axis-group.axis')
                .transition()
                .duration(duration)
                .ease(ease)
                .call(yAxis);

            var gapSize = x1.rangeBand() / 100 * gap;
            var barW = x1.rangeBand() - gapSize;
            var bars = svg.select('.chart-group')
                .selectAll('.bar')
                .data(_data);
            bars.enter().append('rect')
                .classed('bar', true)
                .attr({x: chartW,
                    width: barW,
                    y: function(d, i) { return y1(d); },
                    height: function(d, i) { return chartH - y1(d); }
                })
                .on('mouseover', dispatch.customHover);
            bars.transition()
                .duration(duration)
                .ease(ease)
                .attr({
                    width: barW,
                    x: function(d, i) { return x1(i) + gapSize/2; },
                    y: function(d, i) { return y1(d); },
                    height: function(d, i) { return chartH - y1(d); }
                });
            bars.exit().transition().style({opacity: 0}).remove();

            duration = 500;

        });
    }
    exports.width = function(_x) {
        if (!arguments.length) return width;
        width = parseInt(_x);
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) return height;
        height = parseInt(_x);
        duration = 0;
        return this;
    };
    exports.gap = function(_x) {
        if (!arguments.length) return gap;
        gap = _x;
        return this;
    };
    exports.ease = function(_x) {
        if (!arguments.length) return ease;
        ease = _x;
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
/**
 * SBML graph : accepts the data in scomos model format and plots the basic force directed graph
 * 				using d3 force layout
 **/
//TODO: need to change file name once the library name is decided
/**
 * Exports scomosGraph : creates d3 force graph based scomos data model
 * 	this graph  is strictly bound the scomos model data structure
 */
d3scomos.scomosGraph = function scomosGraph() {

	/** Some defaults change them accordingly **/
    var margin = {top: 20, right: 20, bottom: 40, left: 40},
        width = 1500,
        height = 1500;
    var svg, duration = 500;
    var graphRoot;
    var oneTime =false;
    /** export  to hold data specific to this graph instance **/
    var data = new ModelDataApi();
    //set oneTIme falg
    /** scomos selections object to manage node selection logic **/
    var selection;
    /** pan mode **/
    var __panMode = "PAN";//defaults to PAN another valid values will be select

    var zoomString;
    /** custom event dispatcher **/
    var dispatch = d3.dispatch('speciesHover','speciesClick',
    						   	'reactionHover','reactionClick',
    						   	'linkHover','linkClick',
    						   	'compartmentHover','compartmentClick',
                  	'covalentModificationClick');

    /**
     * draws chart on current data
     * @param injectInto {String} fully qualified d3 selector
     * @returns draws scomos model in specified html element
     */
    function __generateChart( injectInto,mode){
    	mode=mode||'REDRAW';
    	//mode is redraw remove previous drawings and selections
    	if(mode==='REDRAW'){
    		console.info('Redraw operation triggered');
    		init();
    		update();
    	}
    	else if(mode==='UPDATE'){
    		console.info('Update operation triggered');
    		update();
    	}

 function init(){
	 graphRoot = injectInto;
 	/** init selections **/
 	//selection = selection || new scomosSelections(injectInto);

 	//if(!data.getScomosSelection()){
 	data.storeScomosSelection(new scomosSelections(injectInto))
 	//}
 	selection = data.getScomosSelection();

     // add svg canvas to page
 	if(svg)
 		d3.select(injectInto).selectAll('svg').remove();
     svg = d3.select(injectInto)
         .append('svg');

     //if no data return this is required if graph is generated by non angular scripts
     //also this makes function testable
     if(!data.getHeight()) return;
     shapeUtil.initGradients(injectInto);
 	var boundaries = data.getBoundaryPoints();
 	svg.attr("height","700")
		.attr("width","100%");
 svg.attr("viewBox",boundaries.xNeg + " " + boundaries.yNeg + " " + data.getWidth() + " " + data.getHeight())
 	.attr("preserveAspectRatio", "xMinYMin meet");

 svg = svg.append('g');
 //develop your graph here

	var force=d3.layout.force()
			.size([200,200])
			.nodes([])
			.links([]);
 }
        //update height and widht
        /*svg.attr("height",boundaries.yPos-boundaries.yNeg + 150)
        	.attr("width",boundaries.xPos-boundaries.xNeg + 150);
        */

		//update the graph

		function update(){
			var speciesNodes = data.getSpeciesList(); //objToArrayOfObj(speciesData);
			var reactionNodes = data.getReactionList();
			var links = modelHelper.getEdgeList(reactionNodes,speciesNodes);
			var compartmentNodes = data.getCompartmentList();
			//var covalentModifications = modelHelper.getModifierList(speciesNodes)
			//svg.remove();
			var compartments = svg.selectAll('.compartment')
				.data(compartmentNodes)
				.enter()
				.append('g')
				.attr("transform", function(d)
		    		{ return "translate(" + d.position.iX + "," + d.position.iY + ")"; })
				.attr('class',function(d){return d.sId !== 'default' ? 'compartment' : 'defCompartment'});

			compartments.append('path')
				.attr('class', 'compartment-path')
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
			//compartments.on('mousedown',mouseDownOnCompartment);
			compartments.on('click',mouseClickedOnCompartment);//there is no special click event handler here
			compartments.on('mouseover', dispatch.compartmentHover);

			compartments.append('text')
			    .attr('text-anchor','middle')
			    //TODO: used static spacing for text make this configurable
			    .attr('x',function(d){return 0;})
			    .attr('y',function(d){return d.iHeight + 15})
			    .text(function(d){return d.sName})
			    .attr('class', 'text-node');


			var link = svg.selectAll('.link')
			.data(links)
			.enter()
			.append('path')
			.attr('class', 'link')
			.attr('d', function(d){return shapeUtil.getPathCoordsForLine(d.source, d.target, d.role)})
		    .attr("style", function(d){
		    	var marker;
		    	switch(d.role){
		    	case "Reactant":
		    		if(d.reversible)
					  marker = "marker-mid:url(#filledArrow);";
					break;
		    	case "Product":
					marker = "marker-mid:url(#filledArrow);";
					break;
		    	case "Modifier":
		    		if(d.modifierType === 'Inhibitor')
		    			marker = "marker-mid:url(#Line);";
		    		else //defaults ot activator
		    			marker = "marker-mid:url(#hollowArrow);";

		    		break;
				case "modifier_Inhibitor":
					marker = "marker-mid:url(#Line);";
					break;
				case "modifier_Activator":
					marker = "marker-mid:url(#hollowArrow);";
					break;
				default:
					marker = "";
				}

		    	return marker+" stroke:"+d.color+";";

		    })
		    .on('mousedown', mouseDownOnLink);
			link.on('click', dispatch.linkClick)
				.on('mouseover', dispatch.linkHover);

			var node = svg.selectAll('.species-node')
			    .data(speciesNodes)
			    .enter()
			    //.append('circle')
			    .append('g')
			    .attr('class','species-node');

			//add shape
		    node.append('path')
			    .attr('d',function(d){
			    	/*var shapeName = shapeUtil.resolveShape(d.enTypes);*/
			    	return d3scomos.getSymbol(d.sType,d);
			    })
			    .attr('class', 'species-path')
		    	.attr('fill','url(#speciesLinear)');
			    /*<text text-anchor="middle"
	          		x="60" y="75">A</text>
			     */
		    //add text

			node.append('text')
			    .attr('text-anchor','middle')
			    //TODO: used static spacing for text make this configurable
			    .attr('x',function(d){return d.iWidth/2;})
			    .attr('y',function(d){return d.iHeight + 15})
			    .text(function(d){return d.sName})
			    .attr('class', 'text-node');



			node.on('mouseover', dispatch.speciesHover)
		    	.on('click', clickOnSpecies);
		    //node.on('click',dispatch.speciesClick);

		    //dispatch.on("speciesClick",clickOnSpecies);

			    //transform these nodes there right posistions
		    node.attr("transform", function(d)
		    		{ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });

		    //for each species-node, renders its COVALENT MODIFICATIONS
		    node.each(function(d){
				var thisNode = d3.select(this);
				var thisNodeData = d;
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
			});

		    var covalentModification = d3.selectAll('.modifier-node');
		    covalentModification.on('click', clickOnCovalentModification);
        //svg.selectAll('.reactionNode').remove();
			var reactions = svg.selectAll('.reaction-node')
				.data(reactionNodes)
				.enter()
				.append('g')
				.attr('class','reaction-node');

			reactions.append('path')
			    .attr('d',function(d){
			    	console.info("adding reaction : "+d.sId);
			    	return d3scomos.getSymbol('REACTION',d);
			    })
			    .attr('class', 'reaction-path')
				.attr('fill','url(#reactionLinear)');

			reactions.append('text')
			    .attr('text-anchor','start')
			    //TODO: used static locations assuming node size + 20 + 5 padding
			    .attr('x',function(d){return 25;})
			    //TODO: used static locations assuming node hiehgt + 20/2 + 5 padding
			    .attr('y',function(d){return 15})
			    .text(function(d){return d.sName})
			    .attr('class', 'text-node');

			reactions.attr("style", function(d){
											var reactionColor = "rgb("+d.color.iRed+","+d.color.iGreen+","+d.color.iBlue+")";
											return "fill: "+reactionColor+"; stroke: "+reactionColor+";";
										})
						 .on('mouseover', dispatch.reactionHover)
		    			 .on('click', clickOnReaction);
		    			 //.on('click', dispatch.reactionClick);


			//transform reaction nodes there positions
			reactions
				.attr("transform", function(d)
		    		{ return "translate(" + d.position.iX + "," + d.position.iY + ")"; });

			d3.select("svg").on('mousedown', mouseClickedOnSVG);

			d3.select("body")
			.on("keydown", function() {
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
			});
			var drag = d3.behavior.drag()
//		    .origin(function(d) {
//		    	return {x:d.position.iX,y:d.position.iY}; })
		    .on("dragstart", dragstarted)
		    .on("drag", dragged)
		    .on("dragend", dragended);

			//apply this drag on nodes
			node.call(drag);
			//apply this drag on reaction node
			reactions.call(drag);
			//apply drag to compartments
			compartments.call(drag);
			//apply drag to covalent modifications (these are not dragable; but used since selection logic is also part of drag logic)
			covalentModification.call(drag);
			//experimental zoom behaviour
			//TODO zoom bound are static make them configurable
			var zoomBehaviour = d3.behavior.zoom().
								scaleExtent([0.5, 10])
								.on("zoom", zoom);
			d3.select(injectInto).select('svg').call(zoomBehaviour);
		}


		function dragstarted(d) {
			d3.event.sourceEvent.stopPropagation();
			//treat drag started as the mouseDown event
			//do only selection logic in drag started no drag logic here
			//leave that to dragged method

			//ignore ctrl press in drag started
			if(!d3.event.sourceEvent.ctrlKey){
				//deselect all if this is not selected one
				//if selected this could be the case of the drag
				//so let dragged or clicked event handle further state
				if(!d3.select(this).classed('selected')){
					d3.selectAll('.selected').classed('selected',false);
					//clean up the selection
					selection.clear();
				}
				modelHelper.selectNode(d3.select(this));
				selection.addNode(d3.select(this));
			}
		}
		var isDragged = false;
		function dragged(d) {

			//process drag only if true drag
			if(d3.event.dx != 0 || d3.event.dy != 0)
			{
				isDragged = true;
				if(d3.event.sourceEvent.ctrlKey){
					//mark this as selected
					modelHelper.selectNode(d3.select(this));
					selection.addNode(d3.select(this));
				}
				/*//make all selected dragging
				d3.selectAll('.selected').classed('dragging',true);
				//drag all selected but links
				d3.selectAll('.dragging').filter(function(){
					//remove lines from this selection
					return !d3.select(this).classed('link');
				})
				.each(function(d){
					d.position.iX = d3.event.dx + d.position.iX;
					d.position.iY = d3.event.dy + d.position.iY;
					d3.select(this).attr("transform", "translate(" + d.position.iX + "," + d.position.iY + ")")
				});*/
				var dragables = selection.getDraggableSelection();
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
				svg.selectAll('.link').attr('d', function(d){return shapeUtil.getPathCoordsForLine(d.source, d.target, d.role)});
			}
		}

		function dragended(d) {
			if(isDragged){
				isDragged=false;
				console.log("drag ended");
				//do not handle any selection logic in drag end only dragging logic
				d3.selectAll(".dragging").classed("dragging", false);
				//update parent child relationShip of dragged elements
				selection.updateDraggableSelection(data);
			}

		}

		//Zoom behaviour experimental
		function zoom() {
			//zoomBehaviour.translate([d3.event.sourceEvent.x, d3.event.sourceEvent.y]);//reset translate if any
			if(__panMode.toUpperCase() === "PAN"){
				//d3.event.stopPropagation();
				d3.select(injectInto).select('g')
					.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				//store thsese zoom settings for refreshing the graph
				zoomString = "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")";
				data.storeZoom(zoomString);
			}
			if(__panMode.toUpperCase() === "SELECT"){
				d3.select(injectInto).select('g')
					.attr("transform","scale(" + d3.event.scale + ")");

				//store thsese zoom settings for refreshing the graph
				zoomString = "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")";
				data.storeZoom(zoomString);
				//.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				//draw/update a selection rect
				/*if(!d3.select("#selection-rect")[0][0]){
					//add a rect at this point
					*//**
					 * <rect x="10" y="10" width="100" height="100" stroke="blue" fill="purple"
       fill-opacity="0.5" stroke-opacity="0.8"/>
					 *//*
					d3.select(injectInto)
						.select('svg')
						.select('g')
						.append("rect")
						.classed("selection-rect",true)
						.attr("x",function(){return d3.event.sourceEvent.clientX})
						.attr("y",function(){return d3.event.sourceEvent.clientY})
						.attr("height","100")
						.attr("height","200");
					console.log(d3.select(".selection-rect"));
				}
				else
					{
					var selectionRect = d3.select(".selection-rect");
					//upate dimenstins
					selectionRect.attr("height",function(){selectionRect.attr("y")-d3.event.sourceEvent.clientY});
					selectionRect.attr("width",function(){selectionRect.attr("x")-d3.event.sourceEvent.clientX});
					}*/
			}
			//zoom irrespectively
		}
		//TODO : create node lookup structure so that force layout can perform its calculations
		//force.start();

		/** this is added here for testing
		 * TODO find way to refactor this to seperate file
		 */
		/**
		 * scomosGraphBehaviours : refactored from scomosGraph to minimize the file size
		 * Will contain :
		 * 		various event handler functions
		 * 		d3 behaviours(drag,zoom) and handlers
		 * All these are re factored from scomosGraph so will be very specific to scomosGraph.
		 * Note : no need to write seperate test for these as these functions will be tested from scomosGraph_tests.js
		 */

		//function mouseDownOnSpecies(d){
		function clickOnSpecies(d){
			d3.event.stopPropagation();
			if (d3.event.defaultPrevented) return;
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
			//dispatch.on("speciesClick");
			dispatch.speciesClick(d);
		}

		function clickOnCovalentModification(d,i){
			d3.event.stopPropagation();
			if (d3.event.defaultPrevented) return;

			var thisModification = d3.select(this);
			if(!d3.event.ctrlKey){
				d3.selectAll('.selected').classed("selected", false);
				//clean up the selection
				selection.clear();
				thisModification.classed("selected", true);
				//clean up the selection
				selection.addNode(thisModification);

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

            dispatch.covalentModificationClick(d,i)
		}

		//function mouseDownOnReaction(d){
		function clickOnReaction(d,i){
			d3.event.stopPropagation();
			if (d3.event.defaultPrevented) return;
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
			//dispatch click event for user defined hadlers
			dispatch.reactionClick(d,i);
		}

		function mouseDownOnLink(d){
		//function clickOnLink(d){
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

		function mouseDownOnCompartment(d,i){
			d3.event.stopPropagation();
			/*if (d3.event.defaultPrevented) return;*/

/*			//expose event to external click handler
			dispatch.compartmentClick(d,i);*/
		}

		function mouseClickedOnCompartment(d,i){
			console.info("compartment clikced "+d.sId);
			d3.event.stopPropagation();
			if (d3.event.defaultPrevented) return;
			//propagate this event one level above so that g element will handle it
			//fixes dragging problem
			//d3.event.stopPropagation();

			var thisCompartment = d3.select(this);

			if(!d3.event.ctrlKey){
				d3.selectAll('.selected').classed("selected", false);
				//clean up the selection
				selection.clear();
				thisCompartment.classed("selected", true);
				//clean up the selection
				selection.addNode(thisCompartment);
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
			selection.updateDraggableSelection(data);
			selection.updateDraggableSelection(data);
			dispatch.compartmentClick(d,i);
		}
		function mouseClickedOnSVG(d){
			if (d3.event.defaultPrevented) return;
			d3.event.stopPropagation();
			if(__panMode.toUpperCase() === "SELECT"){
				d3.selectAll('.selected').classed("selected", false);
				//clean up the selection
				selection.clear();
			}
		}

		/*function mouseDownOnCanvas(d){
			;
		}*/
		/** handle selection if select mode and selection rects are found **/

		function mouseUpOnCanvas(d)
		{
			var selectionRect = d3.select("#selection-rect");
			//selectionRect.remove();
			console.info("mouse up on canvas");
		}
		//TODO : this is a temporary fix to detect dropping in canvas
		//after the drawing is done aupdate all canvases to actual draw size

		if( false/*data.getOnetime()*/){
			console.info('running one time compartment adjustment fix')
			data.setOnetime(false);
			d3.select(injectInto)
			.selectAll('.compartment')
			.each(function(d){
			var thisCompartment = d3.select(this);
			var thisData = thisCompartment.datum();
			var rect = d3.select(this).node().getBBox();

			/*
			 * 	height: 2005.953125
				width: 2496.21240234375
				x: -15.8125
				y: -0.0000026172481284447713
			 */
			try{
				thisData.iHeight = rect.height;
				thisData.iWidth = rect.width;
				/*thisData.position.iX = rect.x;
				thisData.position.iY = rect.y;*/
			}catch(error){
				console.error("failed one time bound update for " + thisData.sId);
			}
		});
		}
    }

    /** process current selection
     * this is method more angular specific going ahead needs refactor
     */
    function exports() {
    	/**//** this check is added to support angular specific selection
    	 * which have both html element and data embeded into them
    	 *//*
    	if(_selection.hasOwnProperty('each'))
    		{
		        _selection.each(function(_data) {
		        	*//** init this chart instance with new data **//*
		        	if(!_data || _data ==="")
		        		return;
		        	data = new ModelDataApi(_data);
		        	//_selection.call(__generateChart(_selection));
		        	__generateChart(_selection[0][0]);
		        });
    		}
    	else{
    		//handles non angular init calls
    		//pass on the reference of current DOM element for injecting chart into
    		__generateChart(_selection);
    	}*/
    }
    exports.width = function(_x) {
        if (!arguments.length) return width;
        width = parseInt(_x);
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) return height;
        height = parseInt(_x);
        duration = 0;
        return this;
    };
    exports.ease = function(_x) {
        if (!arguments.length) return ease;
        ease = _x;
        return this;
    };
    exports.setPanMode = function(__mode){
    	__mode = __mode.toUpperCase();
    	switch (__mode) {
		case "PAN":
			__panMode = __mode;
			break;
		case "SELECT":
			__panMode = __mode;
			break;
		default:
			console.log("Invalid pan mode " + __mode + " defaulting mode PAN")
			__panMode = "PAN";
			break;
		}
    }
    /** accepts the modelData and initializes the modelData api with passed data **/
    exports.data = function(__modelData){
    	if(__modelData)
    		data.setData(__modelData);
    	return data;
    };

    /** accepts constructor param for selections object and exposes internal selection object **/
    exports.selections = function()
    {
    	return selection;
    }
    /** export chartGenerator **/
    exports.generate = function(__elem,__modelData){
    	if(__modelData)
    		data.setData(__modelData);
    	__generateChart(__elem);
    }
    exports.refresh = function(){
    	//this will select the nodes if any in selection
    	if(graphRoot){
    		console.info('Refresh operation triggered');
    		__generateChart(graphRoot,'UPDATE');
			selection.markSelected();
			if(svg){
				svg.attr("transform", data.getZoom());
			}
    	}

    }
    d3.rebind(exports, dispatch, 'on');
    return exports;
};

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

/**
* this file holds the common code snippets
* some declarations etc that needs to be shared across files
* and can be shared without breaking the design
**/

var eskinDispatch = d3.dispatch('speciesHover','speciesClick',
              'reactionHover','reactionClick',
              'linkHover','linkClick',
              'compartmentHover','compartmentClick','canvasClick',
              'covalentModificationClick','toolStateChanged',
              'undoManagerEvent','constructionError','clipbaordEvent','selectionEvent',
              'nodeDeleted','rendered');


var ed = d3.dispatch('speciesHover','speciesClick',
              'reactionHover','reactionClick',
              'linkHover','linkClick',
              'compartmentHover','compartmentClick',
              'covalentModificationClick');

/**
 * Re-factored from scomosGraph.js.
 * eskin model will follow following flow in general
 * all rendering should result from the construct operation making sure various operation will
 * follow the same path. This also makes it quite easier to validate data and manage model data
 * errors in more efficient manner.
 * TODO: Add design document specifying assumed design strategy and assumptions for eskin model.
 */

/**
 * Create the d3 force graph for eskin data model.
 * graph created is very strictly bound to the JSON data model of
 * the eskin sbml format
 * @constructor
 * @param {String} injectInto div to draw model into
 * @param {Object} eskinConfig config object to set def property for this model
 */
d3scomos.eskinModel = function eskinModel (injectInto,eskinConfig){

	/** module private variables **/
	var injectedInto;
	if(injectInto instanceof d3.selection){
			injectedInto = injectInto[0][0];//defaults to div with id eskinModel
	}
	else{
		 injectedInto = injectInto || "#eskinModel";//defaults to div with id eskinModel
		 injectedInto = "#"+injectInto;
	}

	//var modelData = new ModelDataApi();
	var eskinOps;
	/** initialize private variables **/

	// if(injectInto)
	// 	injectedInto = "#"+injectInto;

	/** default eSkinConfig **/
	var _defEskinConfig = {
			height : "500px",
			width : "100%",
			autoFit : true
	}
	//augment property on passed config with default config object
	if(eskinConfig){
		for( var prop in eskinConfig){
			if(eskinConfig.hasOwnProperty(prop))
				_defEskinConfig[prop] = eskinConfig[prop];
		}
	}

	//set def as new eskinConfig
	eskinConfig = _defEskinConfig;

	eskinOps = new eskinOperations(injectedInto,eskinConfig);

	var returnThis = {
		injectedInto : function getInjectedInto(){return injectedInto.slice(1)/** remove the # from tag**/},
		operations : eskinOps,
		config : eskinConfig,
		/**
		 * Accepts the Model JSON and generates the model object structure and renders it
		 * @param {JSON} modelDataJson
		 * @throws {ValidationError} if non optional params are missing for SBMLModel
		 */
		generate : function generate(modelDataJson){
            var startedAt = new Date();

            if(modelDataJson.constructor.name === 'SBMLModel'){}
			//add this to this modeldata
			//modelData.setData(modelDataJson || {});
			//draw the chart
			eskinOps.initModel(modelDataJson);
			//add compartment
			try{
					eskinOps.addCompartment(modelDataJson.mapCompartmentLayouts['default']);			}
			catch (err) {
				//if(err instanceof ValidationError){
				__logger.error("generate addCompartment : validation failed for default compartment"+err.message);
				//}
			}
			d3.values(modelDataJson.mapCompartmentLayouts)
				.map(function(compartment){
					//TODO Objects may throw errors here for now log them
					//Later there will be notification service to group msgs
					try{
							if(compartment.sId !== 'default')
								eskinOps.addCompartment(compartment);
					}
					catch (err) {
						//if(err instanceof ValidationError){
					  __logger.error("generate addCompartment : validation failed "+err.message);
						//}
					}
				});
			//add species
			//add complex Species first
			d3.values(modelDataJson.mapSpeciesLayouts)
			.filter(function(d){return d.sType === "Complex"})
			.map(function(species){
				try{
					eskinOps.addSpecies(species);
				}
				catch (err) {
					//if(err instanceof ValidationError){
				  __logger.error("generate addCompartment : validation failed "+err.message);
					//}
				}
			});
			//add non complex species later
			d3.values(modelDataJson.mapSpeciesLayouts)
			.filter(function(d){return d.sType !== "Complex"})
			.map(function(species){
				try{
					eskinOps.addSpecies(species);
				}
				catch (err) {
					//if(err instanceof ValidationError){
				  __logger.error("generate addCompartment : validation failed "+err.message);
					//}
				}
			});
			//add reaction
			d3.values(modelDataJson.mapReactionLayouts)
			.map(function(reaction){
				//TODO Objects may throw errors here for now log them
				//Later there will be notification service to group msgs
				try{
					eskinOps.addReaction(reaction);
				}
				catch (err) {
					//if(err instanceof ValidationError){
				  __logger.error("generate addReaction : validation failed "+err.message);
					//}
				}
			});
			//eskinOps.getModel().updateModelBoundaries();
			//clear undoManager
			eskinOps.undoManager.clear();
			eskinOps.fitToScreen();
            var finishedAt  = new Date();
            //$('body').removeClass('waiting');
            //rendering done inform outer listners
            eskinDispatch.rendered();
            console.info('Graph drawn in '+ (finishedAt - startedAt)/1000 + ' seconds.');
		},
		/**
		 * sets the zoom mode for view
		 * @param  {[type]} __mode [description]
		 * @return {[type]}        [description]
		 */
		setPanMode:function(__mode){
	    	eskinOps.setViewMode(__mode);
    },
		/**
		 * refresh the curretn model
		 * @return {[type]} [description]
		 */
		refresh:function(){
				eskinOps.refreshView();
		},
		/**
		 * accepts GEOData from external (outside library sources) adds to SBMLModel via operations
		 * @param  {GEOData} GEOData [description]
		 * @return {[type]}         [description]
		 * @throws {customErrors.ValidationError}
		 */
		loadGEOData:function(GEOData){
			eskinOps.loadGEOData(GEOData);
		}
	}
	//eskinModel.Constructor.prototype = new EventEmitter2();
	d3.rebind(returnThis, eskinDispatch, 'on');

	return  returnThis;
}

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

/**
 * gene Expression overlay module.
 * Deals with :
 * 	1) accepting the gene and there experiment values, cutoff status , and color shades
 * 	2) controlling gene appearance based on their cutoff status.
 * 	3) Creating and applying gradient fill to the said genes.
 * 	4) remembering the user state configurations during redraws
 * 	5) Settings restoration methods
 * 	etc
 */

//--------------------------------
//  -------- Design Assumptions---
//--------------------------------
/**
 * Gene Expression overlay will be the hidden part of the SBML model
 * i.e. will be accessible through the getter mehtods only
 * that way json wont get deformed
 * TODO:Another consideration is that input data format might change ( as it result of exposed API)
 * so there must be provision for external data configuration functions
 */
/**
 * Creates the GEOverlay Object
 * @constructor
 * @param  {{fileHeaderMap:[String],
 *         		 geneData:{'geneName':{
 *         		 			'inPathwayMap':"String",
 *         		 		 	expressionValues:[number]
 *         		 		  	visualData:{
 *         		 						overlayStateList:[overlaystate shortcode:String]
 *         		 										  colorList:[String]
 *         		 					 }
 *         	  			   }
 *         	            }
 *         }} GEOData overlay data produced by the eskin geneOverlay API]
 *@param {{
 *       	'currentExperiment':'expressionValue1',
 *       	'filters':['UR','DR',UA,ND]
 *       	}}
 * @return {[type]}             [description]
 */
var GEOverlay = function(GEOData,GEOConfig){
  /* GEOData format
  {
    "fileHeaderMap": {
      "expressionValue1": "Experiment  1",
      "expressionValue2": "Experiment 2",
      "expressionValue3": "Experiment 3"
    },
    "geneData":{
      "ACE": {
          "expressionValues": [230,21.75232,130],
          "overlayStateList": ["UR","UA","UR","ND"],
          "colorList": ["rbg(255,89,0)","rgb(255, 255, 0)","rbg(255,236,0)"]
      }
    }
}
   */
   var fileHeaderMap = GEOData.fileHeaderMap;
   //TODO : remove -1 once geneName is removed from the header map
   var noOfExperimentConditions = d3.keys(fileHeaderMap).length;//-1 as geneName is not experiment coidtions

   var colorConstants = shapeConstants.gradient;
  /**
   * buildDataSet for this experimentKey
   * @param  {string} experimentKey String header file key handler
   * @return {{'geneName':[expressionvalue,overlayStatus,colorstring]}}       processable array of gene name and Expression values
   */
   function buildDataSet(experimentKey){
     var _expIndex = parseInt(experimentKey.split('Value')[1])-1;
     var returnThis = {};
     Object.keys(GEOData.geneData).forEach(function(geneName){
       var thisGene = GEOData.geneData[geneName];
       if(thisGene.expressionValues.length === 0){
         returnThis[geneName] = [null,'ND',colorConstants.species.firstFill];
       }
       else {
         returnThis[geneName] = [ thisGene.expressionValues[_expIndex],
                  thisGene.overlayStateList[_expIndex],
                  thisGene.colorList[_expIndex]
                ];
       }
     });
    //  GEOData.geneData.forEach(function(geneName){
    //
    //  })
     return returnThis;
   }
   /**
    * returns graient ID stringify
    * @param  overlayStatus
    * @param  color
    * @param  gardientIdString
    * @return {String}      gradient ID to be applied
    */
   function getGradient(overlayStatus,color,gardientIdString){
     var gradientID;
     switch (overlayStatus) {
       case 'UR':
        gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       case 'DR':
         gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       case 'UA':
         gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       case 'ND':
         gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       default:
         throw new Error("Unknown overlay status : "+overlayStatus + " UR,DR,UA,ND are only valid values");
     }
     return gradientID;
   }
   /**
    * apply gene experssion data and color to genes(speceis) as per constructed data list-item
    * @param  {{'geneName':[expressionvalue,overlayStatus,colorstring]}}  thisExpData filtered data for curernt experiment
    * @return {}
    */
   function applyGEODataToSpecies(thisExpData){
     d3.selectAll('.species-node')
        //.filter(function(d){return d.sType !== 'COMPLEX'})
        .each(function(d,i){
           //if this d.sName is in thisExpData process
           var thisGene = thisExpData[d.sName.toUpperCase()];
           if(!thisGene)
                thisGene = [null,'ND',colorConstants.species.firstFill]

             var gradIdString = 'geoGrad_'+objectHelper.getStringHash.apply(d.sName);
             var gradientID = getGradient(thisGene[1],thisGene[2],gradIdString);
             d.overlayStatus(thisGene[1]);
             //apply gradient string
             d3.select(this).select('.species-path').attr('fill','url(#'+gradientID+')');
         })
   }
   /**
    * updates the gene Color based on new data and filter values
    * @return {[type]} [description]
    */
   function _updateGEOData(){
     var dataSet = buildDataSet(GEOConfig.currentExperiment);
    // console.info(dataSet);
     d3.selectAll('.species-node')
        //.filter(function(d){return d.sType !== 'COMPLEX'})
        .each(function(d,i){
           //if this d.sName is in thisExpData process
           var thisSpecies = d3.select(this);
           var thisGene = dataSet[d.sName.toUpperCase()];
           if(!thisGene )
             thisGene = [null,'ND',colorConstants.species.firstFill];
          //bind overlayStatus to species
           d.overlayStatus(thisGene[1]);
           // is this gene fitered out
           var isFiltered = GEOConfig.filters.indexOf(thisGene[1]) !== -1;
           //add remove disabled class accordingly
           thisSpecies.classed('disabled-node',isFiltered);
           var colr1 = isFiltered?shapeConstants.gradient.GEOverlay.disabledFill:thisGene[2];
           var colr2 = isFiltered?shapeConstants.gradient.GEOverlay.disabledFill:thisGene[2];
           var colr3 = isFiltered?shapeConstants.gradient.GEOverlay.disabledFill:shapeConstants.gradient.GEOverlay.secondFill;
           var gradIdString = '#geoGrad_' + objectHelper.getStringHash.apply(d.sName);
           //d3.select(gradIdString).select("stop")
           d3.select(gradIdString+' > stop:nth-child(1)')
              .transition()
              .attr("stop-color", colr1);
          d3.select(gradIdString+' > stop:nth-child(2)')
             .transition()
             .attr("stop-color", colr2);
         d3.select(gradIdString+' > stop:nth-child(3)')
            .transition()
            .attr("stop-color", colr3);
       })
       //update reaction colors accordingly
       updateReactionNodes();
   }

/**
 * helper functin for update edges
 * @param {Reaction} reaction reaction of which edges are to be updated for GEOverlay
 * @param {Boolean} isDisabled is this reaction node disabled
 * @return {} colors edges with there valid styles ignoring overlay status
 */
function colorReactionEdges(reaction,isDisabled,connectedSPecies_OVStatus){
  //make the edge follow fill style of reaction
   /**
    * sIds of all the edges of this reaction
    * @return {[String]}
    */
    var allReactionEdges = reaction.datum()
                      .getAllEdges()
                      .map(function(d){return d.sId});

   	var allLinks = d3.selectAll('.link')
          .filter(function(d){ return allReactionEdges.indexOf(d.sId) !== -1 });
    var markerPostFix = isDisabled == true?'_disabled':'';
    allLinks.attr("style", function(d){
      var marker;
      var colorString = isDisabled == true?colorConstants.GEOverlay.disabledFill : d.getColorString();
      /** handle this situation to activate edges partially **/
      if(!isDisabled){
        var species ;
        if(d.source.constructor.name === 'Species')
          species = d.source
        else
          species = d.target
        var isFiltered = GEOConfig.filters.indexOf(connectedSPecies_OVStatus[species.sId]) !== -1;
        if(isFiltered){
          colorString = colorConstants.GEOverlay.disabledFill;
          markerPostFix = '_disabled';
        }

      }
      switch(d.role){
        case "REACTANT":
          if(d.reversible) marker = "marker-mid:url(#filledArrow"+markerPostFix+");";
          else marker = "";//no arrow marker for this one
        break;
        case "PRODUCT":
          marker = "marker-mid:url(#filledArrow"+markerPostFix+");";
        break;
        case "MODIFIER":
          if(d.sModifierType === 'Inhibitor')
            marker = "marker-mid:url(#Line"+markerPostFix+");";
          else //defaults ot activator
            marker = "marker-mid:url(#hollowArrow"+markerPostFix+");";
          break;
        default:
          marker = "";
    }

    return marker+" stroke:"+ colorString +";";
  })
}
/**
 * find all the reaction node and apply the disabledFill.
 * @return {[type]} [description]
 */
var updateReactionNodes = function(){
  var allReactions = d3.selectAll('.reaction-node');
  var allSpeceis_OVstatus = {};
  d3.selectAll('.species-node')
    .each(function(d){
      allSpeceis_OVstatus[d.sId] = d.overlayStatus();
    });
  allReactions.each(function(d){
     var thisReaction = d3.select(this);
     var connectedSpecies = thisReaction.datum().getAllConnectedSpeciesId();
     var connectedSPecies_OVStatus ={};
     connectedSpecies.map(function(d){connectedSPecies_OVStatus[d] = allSpeceis_OVstatus[d]});

     var disableReaction = true;
     for(var index in connectedSpecies){
       //reactionFill_disabled
        if(GEOConfig.filters.indexOf(allSpeceis_OVstatus[connectedSpecies[index]]) == -1){
            disableReaction = false;
            break;
        }
    }
    //update reaction_border baseed on filter status
   thisReaction.classed('disabled-node',disableReaction);
   var currentFill =  thisReaction.select('path').attr('fill');
    if(disableReaction) {
       //change fill only if required
       if(currentFill !== 'url(#reactionFill_disabled)'){
          thisReaction.select('path').attr('fill','url(#reactionFill_disabled)');
       }
    }
    else{
       if(currentFill == 'url(#reactionFill_disabled)'){
         thisReaction.select('path').attr('fill',function(d){return shapeUtil.getReactionFill(d.sType)});
       }
    }
    //update edges of this reaction
    colorReactionEdges(thisReaction,disableReaction,connectedSPecies_OVStatus);
  });
}
/**
 * bootstraps the first GEORun
 * @return {[type]} [description]
 */
 var bootstrap = function(){
   applyGEODataToSpecies(buildDataSet(GEOConfig.currentExperiment));
   _updateGEOData();
 }
 //start GEO process
 bootstrap();
//TODO : add handler methods
 return {
   /**
    * Updates the data and GEO config used to draw GEOverlay. ALso animates the color change
    * @param  {{geneName:overlayStatus}} GEOData   GEOverlay data-
    * @param  {{currentExperiment:String}} GEOConfig GEOConfig data-
    * @return {}           changes the color and animates the change
    */
   updateGEOData:function(_GEOData,_GEOConfig){
     //update the GEO data if valid new data is passed
     //or retain previous values
     GEOData = _GEOData || GEOData
     GEOConfig = _GEOConfig || GEOConfig
     _updateGEOData();
     //bootstrap();
   }
 };
}

/**
 * This module contains various operations that will be
 * used in construction of the model Graph.
 */

/**
 * creates eskinOperations Object
 * @constructor
 * @param {String} rootElem fully qualified div selector
 * @param {Object} config a config object
 * @returns {Object} eskinOperations return eskinOperationsObject
 */
var eskinOperations = function(rootElem,config){
    //rootElem is compulsory parameter
    //if not passed will result in error

    var keyStore                = new eSkinkeyStore();
    var model                   = null;
    var view                    = null;
    var geneExpressionOverlay   = null;
    var construction            = null;
    var factory                 = SBMLFactory();
    var undoManager             = new d3scomos.undoManager();
    var contextHandler             = null;
    //---- add geo code ---
    //TODO: this is supposed to be removed once done with drag and drop
    var geoAdd ;
    //-----------
    if(!rootElem){
        d3scomos.Logger.error("eskin model operations rootElem not passed");
        return null;
    }
    //var thisSVG;
    /** return this object **/
    var operations = {
        undoManager : undoManager,
        initCanvas : function(){
            view.initCanvas();
        },
        /**
         * initializes the modelData object
         * @param {Object} data object with init params
         * @throws {ValidationError} if non optional params are missing
         **/
        initModel : function(data){
            //clear keyStore
            keyStore.clear();
            keyStore.addKey(data.sId);//
            //initModel data will loose any previous data
            model           = factory.getSBMLModel(data);
            construction    = new modelConstructor(rootElem,keyStore,model,this);
            contextHandler     = {cut:this.cut,copy:this.copy,paste:this.paste,delete:this.deleteSelected};
            view            = eskinView(rootElem,config,model,undoManager,construction,contextHandler);

        },
        /**
         * accepts molecule(species) data and adds it to model after validation
         * @param {Object} species data
         * @throws {ValidationError} if non optional params are missing
         **/
        addSpecies : function addSpecies (species){
            if(!species || species === {})
                throw new TypeError("Empty or no species data passed");
            //validate the data
            try{
                undoableOperations.constructSpecies(species,keyStore,model,view);
                undoManager.add({
                    undo:function(){
                        undoableOperations.destructSpecies(species.sId,keyStore,model,view);
                    },
                    redo : function(){
                        undoableOperations.constructSpecies(species,keyStore,model,view);
                    }
                })
            //console.warn(undoManager);
            //dispatch event informing undoManager is changed
            eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add species: validation failed "+err.message);
                }
                throw err;
            }
        },
        /**
         * deltes the current scomosSelections
         * TODO: for now only one species will be deleted i.e. does not support multi select delete
         * 		ALso does not support complex delete
         * @return {Boolean} deletion status
         */
        deleteSelected:function(){

            //deletethe selected species if any
            var currSelection = d3.selectAll('.selected');
            if(currSelection[0].length == 0)
                return;
            var confirmDelete = confirm("Please note that selected entity and all its children will be deleted. Do you wish to proceed with this action?");
            if(!confirmDelete) {
                __logger.info('Deletion aborted by user.')
                return;
            }
            try{
                var currSelection = view.getSelection().getDestructableSelection();
                undoableOperations.destructSelection(currSelection,model,view,keyStore);
                view.refresh();
                undoManager.add({
                    undo:function(){
                        undoableOperations.constructSelection(currSelection,model,view,keyStore);
                    },
                    redo : function(){
                        undoableOperations.destructSelection(currSelection,model,view,keyStore);
                    }
                });
                //console.warn(undoManager);
                //dispatch event informing undoManager is changed
                eskinDispatch.undoManagerEvent(undoManager);
                view.getSelection().clear();
                eskinDispatch.nodeDeleted();
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add species: validation failed "+err.message);
                }
                throw err;
            }

        },
        /**
         * adds species as part of GEO drag drop functionality
         * TODO: remove this method once drag drop is figured out
         * @param {Object} species Species object to be added. Position values passed in will be ignored.
         */
        addSpeciesGEO : function addSpeciesGEO (species){
            species.sId = keyStore.getNextSpecies();
            this.addSpecies(species);
            geneExpressionOverlay = null; //so that new data is loaded
        },
        /**
         * accepts compartment data and adds it to model after validation
         * @param {Object} compartment data
         * @throws {ValidationError} if non optional params are missing
         **/
        addCompartment : function addCompartment (compartment){
            if(!compartment || compartment === {})
                throw new TypeError("Empty or no Compartment data passed");

            try{
                undoableOperations.constructCompartment(compartment,keyStore,model,view);
                undoManager.add({
                    undo:function(){
                        undoableOperations.destructCompartment(compartment.sId,keyStore,model,view);
                    },
                    redo : function(){
                        undoableOperations.constructCompartment(compartment,keyStore,model,view);
                    }
                })
            //console.warn(undoManager);
            //dispatch event informing undoManager is changed
            eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add Compartment: validation failed "+err.message);
                }
                throw err;
            }
        },
        /**
         * accepts reaction data and adds it to model after validation
         * @param {Object} compartment
         * @throws {ValidationError} if non optional params are missing
         **/
        addReaction : function addReaction (reaction){
            if(!reaction || reaction === {})
                throw new TypeError("Empty or no species data passed");
            //reactions received from the eskin server lacks the iHeight and iWidth
            //add them
            reaction.iHeight = reaction.iHeight || 20;
            reaction.iWidth = reaction.iWidth || 20;
            try{
                undoableOperations.constructReaction(reaction,keyStore,model,view);
                undoManager.add({
                    undo:function(){
                        undoableOperations.destructReaction(reaction.sId,keyStore,model,view);
                    },
                    redo : function(){
                        undoableOperations.constructReaction(reaction,keyStore,model,view);
                    }
                })
            //console.warn(undoManager);
            //dispatch event informing undoManager is changed
            eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add Reaction: validation failed "+err.message);
                }
                throw err;
            }
        },
        /**
         * adds covalent modifier to species species
         * @param  {String} sId          [description]
         * @param  {String} modifierType modifier string. Must be valid string. Valid string list is available in construnctionConstants.
         * @return {String}              sModification returns updated sModification string.
         * @throws customErrors.ValidationError if invalid sId is passed
         */
        addCovalantModification:function(sId,modifierType){
            try{
                return undoableOperations.addCovalantModification(sId,modifierType,model,view)
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add covalentModification: Operation failed for sId"+sId+'.Reason ;'+err.message);
                }
                throw err;
            }
        },
        /**
         * adds the newModifier to the reaction.
         * @param  {String} reactionSId source reaction.
         * @param  {{sID:String,bConstant:boolean ... etc}} prouctOptions  product build options.
         * @return {}      adds the new product if valid, also puts the operation on undoManager.
         */
        addProduct : function(reactionSId,prouctOptions){
            try{
                undoableOperations.addProduct(reactionSId,prouctOptions,model,view);
                undoManager.add({
                    undo : function(){
                        undoableOperations.removeProduct(reactionSId,prouctOptions.sId,model,view);
                    },
                    redo : function(){
                        undoableOperations.addProduct(reactionSId,prouctOptions,model,view);
                    }
                })
                eskinDispatch.undoManagerEvent(undoManager);
            }catch(err){
                __logger.error('Add product Failed. Reason : ' + err.message);
                throw err;
            }
        },
        addReactant : function(reactionSId,reactantOptions){
            try{
                undoableOperations.addReactant(reactionSId,reactantOptions,model,view);
                undoManager.add({
                    undo : function(){
                        undoableOperations.removeReactant(reactionSId,reactantOptions.sId,model,view);
                    },
                    redo : function(){
                        undoableOperations.addReactant(reactionSId,reactantOptions,model,view);
                    }
                })
                eskinDispatch.undoManagerEvent(undoManager);
            }catch(err){
                __logger.error('Add Reactant Failed. Reason : ' + err.message);
                throw err;
            }
        },
        addModifier : function(reactionSId,modifierOptions){
            try{
                undoableOperations.addModifier(reactionSId,modifierOptions,model,view);
                undoManager.add({
                    undo : function(){
                        undoableOperations.removeModifier(reactionSId,modifierOptions.sId,model,view);
                    },
                    redo : function(){
                        undoableOperations.addModifier(reactionSId,modifierOptions,model,view);
                    }
                })
                eskinDispatch.undoManagerEvent(undoManager);
            }catch(err){
                __logger.error('Add Modifier Failed. Reason : ' + err.message);
                throw err;
            }
        },
        /**
         * provides node key value update hook for property explorer, so that undo redo will be supported.
         * @param  {string} sId    sId of the node to be updated.
         * @param  {string} sKey   key in this node that is to be updated.
         * @param  {String|Object} newVal newValue to be updated on this object. Mostly is string could be the Object somethimes.
         * @return {instanceof Base}        returns updated object.
         */
        setNodeValueByKey:function(sId,sKey,newVal){
            //check if key exists.
            try{
                var thisNode = model.getNodeObjectBySId(sId);
                var oldVal = thisNode[sKey];
                model.setNodeValueByKey(sId,sKey,newVal);
                view.refresh();
                resizer.updateResizer();
                undoManager.add({
                    undo:function(){
                        model.setNodeValueByKey(sId,sKey,oldVal);
                        view.refresh();
                        resizer.updateResizer();
                    },
                    redo:function(){
                        model.setNodeValueByKey(sId,sKey,newVal);
                        view.refresh();
                        resizer.updateResizer();
                    }
                });
                eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(error){
                __logger.error('setNodeValueByKey Falied : ' + error.message);
                throw error;
            }
        },
        getNodeNameBySId : function(sId){
            return model.getNodeObjectBySId(sId).sName;
        },
        /**
         * fits this view to the screen
         * @return {[type]} [description]
         */
        fitToScreen:function(){
                view.fitToScreen();
        },
        resetZoom : function(){
            view.resetZoom();
        },
        zoomIn : function(){
            return view.zoomIn();
        },
        zoomOut : function(){
            return view.zoomOut();
        },
        setViewMode:function(__mode){
            __mode = __mode.toUpperCase();
            var __panMode;
            switch (__mode) {
                    case "PAN":
                        __panMode = __mode;
                        break;
                    case "SELECT":
                        __panMode = __mode;
                        break;
                    default:
                        console.log("Invalid pan mode " + __mode + " defaulting mode PAN")
                        __panMode = "PAN";
                        break;
                }
            view.setPanMode(__panMode);
        },
        /**
         * provides direct access to underlying model object
         * avoid using this added to enable better testing
         **/
        getModel : function(){
            return model;
        },
        /**
         * loads the pre created SBML model instead of creating new one.
         * @param  {SBMLModel} _model Precreated SBML model.
         * @return {}     loads this model as the model.
         */
        loadSBMLModel : function(_model){

        },
        refreshView:function(){
            view.refresh();
            //if(geneExpressionOverlay) geneExpressionOverlay.refresh();
        },
        /**
         * initializes SBMLModel with this data and activates GEO functionalities for this Model
         * @param  {{fileHeaderMap:[String],
         *                  geneData:{'geneName':{
         *                              'inPathwayMap':"String",
         *                               expressionValues:[number]
         *                               visualData:{
         *                                  overlayStateList:[overlaystate shortcode:String]
         *                                  colorList:[String]
         *                                  }
         *                                }
         *                         }
         *         }} GEOData overlay data produced by the eskin geneOverlay API]
         * @return {[type]}         [description]
         * @throws {customErrors.ValidationError}
         */
        loadGEOData:function(GEOData,GEOConfig){
            //model.setGEOData(GEOData);
            //if(!geneExpressionOverlay)
                    geneExpressionOverlay = new GEOverlay(GEOData,GEOConfig);
                    view.enableOverlayMode();
            //else
                //geneExpressionOverlay.updateGEOData(GEOData,GEOConfig);
            //var GeoConfig = {'currentExperiment':'expressionValue1'};
            //geneExpressionOverlay = new GEOverlay(model,{'fileHeaderMap':fHeader,'geneData':mTestData},GeoConfig);
        },
        changeRootElem : function(newRootElem){
            rootElem = newRootElem;
            view.changeGraphRoot(rootElem);
            construction.updateRootElem(rootElem);
        },
        cut : function(){
            //copy content to the clip board
            clipboard.copy(view.getSelection().getCopiableSelection());
            _ops.deleteSelected();
            view.refresh();
            // trigger destructSelection
        },
        copy : function(){
            // copy contents to clipboard.
            clipboard.copy(view.getSelection().getCopiableSelection());
        },
        paste : function(){
            try{
                //means was triggered by contexMenu
                if(d3.event){
                    var pasteAt = modelHelper.getTransformedCordinates(rootElem,event);
                }
                var pastableSelection = modelHelper.getPastableSelection(clipboard.paste(),keyStore,pasteAt);
                model.updateModelBoundaries();
                console.warn(pastableSelection);
                undoableOperations.constructSelection(pastableSelection,model,view,keyStore,{markSelected:true});
                undoManager.add({
                    undo : function(){
                        undoableOperations.destructSelection(pastableSelection,model,view,keyStore);
                    },
                    redo : function(){
                        undoableOperations.constructSelection(pastableSelection,model,view,keyStore);
                    }
                });
                eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                __logger.error('Paste failed : '+err.message)
            }


        },
        checkClipboard : function(){
            clipboard.triggerClipboardEvent();
        },
        /**
         * selectes node based on the provied type.
         * @param  {String} nodeSId  node index to be selected.
         * @param  {String} nodeType node type seelcted.
         * @return {clickevent dispatch}    dispatches appropriate click event.
         */
        selectNode : function(nodeSId,nodeType,ctrlKey){
            //find the node and select.
            if(!ctrlKey) ctrlKey = false;
            else
                ctrlKey = true;
            var eventOptions = {ctrlPressed:ctrlKey};
            switch (nodeType) {
                case "Species":
                    var speciesNode = d3.selectAll(".species-node").filter(function(d){return d.sId === nodeSId});
                    modelHelper.handleExternalNodeSelection(speciesNode,view.getSelection(),ctrlKey);
                    eskinDispatch.speciesClick(speciesNode.datum(),speciesNode.node(),eventOptions);
                    break;

                case "Reaction":
                    var reactionNode =  d3.selectAll(".reaction-node").filter(function(d){return d.sId === nodeSId});
                    modelHelper.handleExternalNodeSelection(reactionNode,view.getSelection(),ctrlKey);
                    eskinDispatch.reactionClick(reactionNode.datum(),reactionNode.node(),eventOptions);
                    break;
                case "Compartment":
                    var compartmentNode =  d3.selectAll(".compartment").filter(function(d){return d.sId=== nodeSId});
                    modelHelper.handleExternalNodeSelection(compartmentNode,view.getSelection(),ctrlKey);
                    eskinDispatch.compartmentClick(compartmentNode.datum(),compartmentNode.node(),eventOptions);
                    break;
                default:

            }
        },
        /**
         * Wrapper for all construnction methods
         * @type {Object}
         */
        construction : {
            /**
             * sets the construction mode on/off.
             * @param  {Boolean} isEnabled enable or disable the construction mode
             * @return {}            [description]
             */
            enableConstruction:function(isEnabled){
                if(!construction)
                    throw new Error('Operation failed: Enable Construnction mode.')
                if(isEnabled == true)
                    construction.enable();
                else
                    construction.disable();
            },
            /**
             * returns all the construcion tools supported by the library
             * @return {[String]} Array of Tools names without categories
             */
            getAllTools:function(){
                return d3.values(d3.values(constructionConstants.tools)[0]);
            },
            /**
             * set the active tool
             * @param  {string} toolName active tool
             * @return {string}  current active tool
             * @throws {Error} throws error if invaid toolName specified
             */
            setActiveTool:function(toolName){
                construction.setActiveTool(toolName)
            },
            setConstrunctionMode : function(mode){
                return construction.setConstrunctionMode(mode);
            },
        }
    };
    var _ops = operations;//store refrence to self.
    return operations;
}

/**
 * Module will contain all the undoable operations.
 */
var undoableOperations = {
    /**
     * constructs a species object and adds it to the model and view.
     * @param  {Object} options  SBML object options.
     * @param  {KeyStoer} keyStore instance of Keystore.
     * @param  {SBMLModel} model    instance of active SBMLModel.
     * @param  {eskinView} view     instance of eskinView object.
     * @return {}          construcns a species node and adss to view and other relevent components.
     * @throws {customErrors.ValidationError} if invalid object params are provided.
     */
    constructSpecies : function(options,keyStore,model,view){
        try{
            //TODO handle construction mode here
            var speciesObj = SBMLFactory().getSpecies(options);//validates and throws exception if any

            keyStore.addSpecies(speciesObj.sId);
            //add this model to model
            model.addSpecies(speciesObj);
            //add this species to view
            view.addNode(speciesObj);
        }
        catch(err){
            if(err instanceof customErrors.ValidationError){
                __logger.error("add species: validation failed "+err.message);
            }
            throw err;
        }
    },
    /**
     * destructs  a species object and removes it to from model and view
     * @param  {Object} options  SBML object options
     * @param  {KeyStoer} keyStore instance of Keystore
     * @param  {SBMLModel} model    instance of active SBMLModel
     * @param  {eskinView} view     instance of eskinView object
     * @return {D3 selector}        removes species node from all relevent components and returns selector to deleted node.
     */
    destructSpecies : function(speciesId,keyStore,model,view){
        try{
            keyStore.removeKey(speciesId);
            //add this model to model
            model.removeSpecies(speciesId);
            //add this species to view
            return view.removeNode(speciesId,'Species');
        }
        catch(err){
                __logger.error("Delete species: Operation failed "+err.message);
            throw err;
        }
    },

    constructReaction : function(reaction,keyStore,model,view){
        //validate the data
        try{
            var reactionObj = SBMLFactory().getReaction(reaction);//validates and throws exception if any
            keyStore.addReaction(reaction.sId);
            model.addReaction(reactionObj);
            view.addNode(reactionObj);
        }
        catch(err){
            if(err instanceof customErrors.ValidationError){
                __logger.error("add reaction: validation failed "+err.message);
            }
            throw err;
        }
    },
    destructReaction : function(reactionsId,keyStore,model,view){
        try{
            keyStore.removeKey(reactionsId);
            //add this model to model
            model.removeReaction(reactionsId);
            //add this species to view
            return view.removeNode(reactionsId,'Reaction');
        }
        catch(err){
                __logger.error("Delete Reaction: Operation failed "+err.message);
            throw err;
        }
    },
    constructCompartment : function(compartment,keyStore,model,view){
        try{

            var compartmentObj = SBMLFactory().getCompartment(compartment);//validates and throws exception if any
            keyStore.addCompartment(compartment.sId);
            //add this model to model
            model.addCompartment(compartmentObj);
            view.addNode(compartmentObj);
        }
        catch(err){
            if(err instanceof customErrors.ValidationError){
                __logger.error("add compartment: validation failed "+err.message);
            }
            throw err;
        }
    },
    destructCompartment : function(compartmentsId,keyStore,model,view){
        try{
            keyStore.removeKey(compartmentsId);
            //add this model to model
            model.removeCompartment(compartmentsId);
            //add this species to view
            return view.removeNode(compartmentsId,'Compartment');
        }
        catch(err){
                __logger.error("Delete Compartment: Operation failed "+err.message);
            throw err;
        }
    },
    constructEdge : function(edge,view,model){
        edge.addEdgeToParents();
        //trigger edge update on model
        model.updateReactionEdges(edge.getParentReaction().sId);
        view.refresh();
    },
    destructEdge : function(edge,view){
        edge.removeFromParents();
        view.removeNode(edge.sId,edge.getEntityType());
    },
    descructModification : function(modificationNode){
        modificationNode.changeModificationType();
        console.warn('removed modificationNode : '+modificationNode.pos);
    },
    /**
     * construncts current selection methodically so that it can be rebuilt later
     * @param  {{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}} toBeBuilt scomos selection object
     * @param  {SBMLModel} model     current sbml model object
     * @param  {eskinView} view      Current eskinView object
     * @param  {Keystore} keyStore  current Keystore object
     * @param {{markSelected:Boolean}} options options to be used while carying out construct Selection operation.
     * @return {[Compartment|Species|Reaction|Edge`]}           set of construncted objects so that objects can be rebuild as required.
     */

    constructSelection : function(toBeBuilt,model,view,keyStore,options){
        if(toBeBuilt.hasOwnProperty('compartments'))
            toBeBuilt.compartments.
                forEach(function(compartment){undoableOperations.constructCompartment(compartment,keyStore,model,view)});
        if(toBeBuilt.hasOwnProperty('species'))
            toBeBuilt.species.
                forEach(function(species){undoableOperations.constructSpecies(species,keyStore,model,view)});
        if(toBeBuilt.hasOwnProperty('reactions'))
            toBeBuilt.reactions.
                forEach(function(reaction){undoableOperations.constructReaction(reaction,keyStore,model,view)});
        if(toBeBuilt.hasOwnProperty('edges'))
            toBeBuilt.edges
                .forEach(function(edge){undoableOperations.constructEdge(edge,view,model)});
        if(options && options.hasOwnProperty('markSelected') && options.markSelected){
            view.getSelection().clear();
            modelHelper.selectNodesByData(toBeBuilt);
        }
        return toBeBuilt;
    },
    /**
     * Destroys current selection methodically so that it can be rebuilt later
     * @param  {{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}} toBeDeleted scomos selection object
     * @param  {SBMLModel} model     current sbml model object
     * @param  {eskinView} view      Current eskinView object
     * @param  {Keystore} keyStore  current Keystore object
     * @return {[Compartment|Species|Reaction|Edge`]}           set of removed objects so that objects can be rebuild as required.
     */
    destructSelection : function(toBeDeleted,model,view,keyStore){
        /**
         * Algo :
         * 	1) getDraggableSelection s
         * 		for all edges in s remove edges from there parents and update view from the view.
         * 		for all species in s remove the species.
         * 		for all the reaction in s remove reaction.
         * 		for all the compartment in s remove compartment.
         */
        //var selection = view.getSelection();
        //{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}
        //var toBeDeleted = selection.getDestructableSelection();
        if(toBeDeleted.hasOwnProperty('edges'))
            toBeDeleted.edges
                .forEach(function(edge){undoableOperations.destructEdge(edge,view)});
        if(toBeDeleted.hasOwnProperty('modifications')){
            //sort the modification nodes in order of pos
            console.warn('before sort');
            console.warn(toBeDeleted.modifications);
            toBeDeleted.modifications.sort(function(ob1,ob2){return ob1.pos < ob2.pos;});
            console.warn(toBeDeleted.modifications);
            toBeDeleted.modifications.
                forEach(function(modification){undoableOperations.descructModification(modification)});
        }
        if(toBeDeleted.hasOwnProperty('species'))
            toBeDeleted.species.
                forEach(function(species){undoableOperations.destructSpecies(species.sId,keyStore,model,view)});
        if(toBeDeleted.hasOwnProperty('reactions'))
            toBeDeleted.reactions.
                forEach(function(reaction){undoableOperations.destructReaction(reaction.sId,keyStore,model,view)});
        if(toBeDeleted.hasOwnProperty('compartments'))
            toBeDeleted.compartments.
                forEach(function(compartment){undoableOperations.destructCompartment(compartment.sId,keyStore,model,view)});

        view.getSelection().clear();
        return toBeDeleted;
    },
    /**
     * adds the covalent modification to the passed species.
     * @param  {string} sId   species sid to add modifier to.
     * @param  {string} modifierType   modifierType to be appened.
     * @param  {SBMLModel} model SBMLModel instance.
     * @param  {eskinView} view  eskinView object.
     * @return {string}       Newly formed sModification string.
     * @throws  {customErrors.ValidationError} if invalid or non existent sId passed.
     */
    addCovalantModification:function(sId,modifierType,model,view){
        var thisData = model.mapSpeciesLayouts[sId];
        if(!thisData)
            throw  new customErrors.ValidationError(eskinMessages.error.validation_sId_does_not_exist);
        if(!thisData.sModification){
            thisData.sModification = constructionConstants.covalentToolMappings[modifierType];
        }
        else{
            thisData.sModification = thisData.sModification.concat('-'+ constructionConstants.covalentToolMappings[modifierType]);
        }
        view.updateSpeciesCovalantModification(sId);//update covalent mod for this species specifically;
        return thisData.sModification;
    },
    /**
     * adds the product to the reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {{sID:String,bConstant:boolean ... etc}} prouctOptions  product build options.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {String}             returns this reactions sid if successful.
     * @throws exception if invalid param i.e. trying to readd the product.
     */
    addProduct : function(reactionSId,prouctOptions,model,view){
        var productSId = prouctOptions.sId;
        var reactionNode = model.mapReactionLayouts[reactionSId];
        reactionNode.addProduct(prouctOptions);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return reactionSId;
    },
    /**
     * adds the product to the reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {String} productSId  target species sId.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {{removed product object}}             returns removed species object, to enable reconstruction if required.
     */
    removeProduct : function(reactionSId,productSId,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        var returnThis = reactionNode.removeProduct(productSId);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return returnThis;
    },
    /**
     * adds the reactant to the reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {{sID:String,bConstant:boolean ... etc}} prouctOptions  reactant build options.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {String}             returns this reactions sid if successful.
     * @throws exception if invalid param i.e. trying to readd the product.
     */
    addReactant : function(reactionSId,reactantOptions,model,view){
        var reactantSId = reactantOptions.sId;
        var reactionNode = model.mapReactionLayouts[reactionSId];
        reactionNode.addReactant(reactantOptions);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return reactionSId;
    },
    /**
     * removes the  reactant from reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {String} reactantSId  target species sId.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {{removed product object}}             returns removed reactant object, to enable reconstruction if required.
     */
    removeReactant : function(reactionSId,reactantSId,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        var returnThis = reactionNode.removeReactant(reactantSId);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return returnThis;
    },
    addModifier : function(reactionSId,modifierOptions,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        reactionNode.addModifier(modifierOptions);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return reactionSId;
    },
    removeModifier : function(reactionSId,modifierSId,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        var returnThis = reactionNode.removeModifier(modifierSId);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return returnThis;
    },
    /**
     * records drag event values in undo stack.
     * @param  {undoManager} undoManager active undoManager object to record this operatin on.
     * @param  {{sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}}  beforeDrag  [description]
     * @param  {{sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}}  afterDrag   [description]
     * @return {}    records drag event on provided undoManager.
     * //IMPORTANT this is the method gets reference of undoManager. We avoid doing this.
     * But here this operation is triggered by view entity which does not have access to operations object.
     */
    recordDrag : function(undoManager,model,beforeDrag,afterDrag){
        undoManager.add({
            undo:function(){
                model.applyDrag(beforeDrag);
                resizer.clearResizer()
            },
            redo:function(){
                model.applyDrag(afterDrag);
                resizer.clearResizer()
            }
        })
        eskinDispatch.undoManagerEvent(undoManager);
    },
    pasteSelection: function(toBePasted,model,view,keyStore){

    }
}

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


	/** private function customSymbol
	 *
	 */
var customSymbol = function(){
	  var type,
	  shapeObj;
	  function symbol(d,i) {
		  var customSymbol;
		  try {
			  customSymbol =  customSymbolTypes.get(type.call(this,d,i))(shapeObj.call(this,d,i));
		  }
		catch(err) {
		    console.log("invalid shape : "+type.call(this,d,i))
		    customSymbol =  customSymbolTypes.get('GENE')(shapeObj.call(this,d,i));
		    console.log(customSymbol);
		}
		return customSymbol;
	  }
	  symbol.type = function(_) {
	    if (!arguments.length) return type;
	    type = d3.functor(_);
	    return symbol;
	  };
	  symbol.shapeObj = function(_) {
	    if (!arguments.length) return shapeObj;
	    shapeObj = d3.functor(_);
	    return symbol;
	  };
	  return symbol;
	};

/** assumption : every passed object in shape must have following structure
 * Object :
 * 			iHeight : val,
 * 			iWidth	: val
 */
var getSymbol = d3scomos.getSymbol = function getSymbol(_type, shapeObj) {
		/** for standard shapes provided by the d3 they are assumed to be square **/
		shapeObj = shapeObj || {iHeight:128,iWidth:128};
		//size in case referenced the d3 shape
		var size = shapeObj.iHeight||shapeObj.iWidth; //both will be same in this case
		//all shape names are in all caps
		var type = "";
		if(_type !=undefined) type = symbolTypeMappings[_type.replace(/ /g,'')]//eval('typeMappings["'+_type+'"]')//typeMappings[''+_type];
		if (d3.svg.symbolTypes.indexOf(type) !== -1) {
			return d3.svg.symbol().type(type).size(size)();
		} else {
			return customSymbol().type(type).shapeObj(shapeObj)();
		}
	}
var symbolTypeMappings = {
    "SimpleChemical"    :"SIMPLECHEMICAL",
    "GenericProtein"    :"GENERICPROTEIN",
    "DNA(Gene)"         :"GENE",
    "RNA"               :"RNA",
    "Receptor"          :"RECEPTOR",
    "Phenotype"         :"PHENOTYPE",
    "PerturbingAgent"   :"PERTURBINGAGENT",
    "Source/Sink"       :"SOURCEORSINK",
    "Ligand"            :"LIGAND",
    "TranscriptionFactor":"TRANSCRIPTIONFACTOR",
    "Enzyme"            :"ENZYME",
    "Complex"           :"COMPLEX",
    "REACTION"          :"REACTION",
    "InvalidMolecule(s)":"GENE",
    "Rectangular"       :"RECTANGULAR",
    "Circular"          :"CIRCULAR",
    "General"           :"GENERAL"
}


/** export d3scomos **/
if (typeof define === 'function' && define.amd) {
        define("d3scomos", ["d3"], function () { return d3scomos; });
    } else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
        module.exports = d3scomos;
    } else {
        window.d3scomos = d3scomos;
    }
})(window);