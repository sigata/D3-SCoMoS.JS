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
