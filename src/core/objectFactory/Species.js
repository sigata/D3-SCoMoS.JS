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
