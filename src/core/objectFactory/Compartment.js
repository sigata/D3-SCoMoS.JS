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
