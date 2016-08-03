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
