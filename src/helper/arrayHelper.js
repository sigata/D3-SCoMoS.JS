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