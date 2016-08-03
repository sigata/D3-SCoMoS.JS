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
