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
