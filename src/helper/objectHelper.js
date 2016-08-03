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
