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
