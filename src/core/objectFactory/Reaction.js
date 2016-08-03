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
