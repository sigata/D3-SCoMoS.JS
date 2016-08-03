/**
 * creates minimal sbmlModel Object
 * @constructor
 * @param {Object} options init params for sbml model
 * @throws ValidationError {@link Error}
 * @returns a SBMLModel Object
 */
function SBMLModel(options){
    //validate fields here first
    modelValidator.validate_sId(options.sId);

    this.sId = options.sId;
    this.sName = options.sName || this.sId;
    this.lstFunctionDefinitions = options.lstFunctionDefinitions || [];
    this.lstGlobalParameters = options.lstGlobalParameters || [];
    this.lstSBMLErrorMessage = options.lstSBMLErrorMessage || [];

    //default compartment received in json will be ignored
    //instead library will create its own default compartment and keep updating bounds as new elems are added
    var defCompart = SBMLFactory().getCompartment({sId:"default",iHeight:500,iWidth:500,position:{iX:0,iY:0}});
    this.mapCompartmentLayouts = {"default":defCompart};

    this.mapReactionLayouts = {};
    this.mapSpeciesLayouts = {};
    this.modelUnitDefination = options.modelUnitDefination || {};
    this.sModelAttachments = options.sModelAttachments || "";
    this.sNotes = options.sNotes || "";
    this.sOrganismType = options.sOrganismType || "Homo sapiens";
    return this;
}
/** additional methods to the SBML model will go here **/

SBMLModel.prototype.getEntityType = function(){
    return "SBMLModel";
}
/**
 * Adds species object to species map
 * @param {Species} species
 * @throws {TypeError} if parameter of non species type is passed
 */
SBMLModel.prototype.addSpecies = function(species){

    //{sParentCompartment:null,sParentComplex:null};
    var parents = modelValidator.getSpeciesParents(this.mapCompartmentLayouts,this.mapSpeciesLayouts,species);
    var complexParent = this.mapSpeciesLayouts[species.sParentComplex];

    //case has parentComplex
    if(parent.sParentComplex){
        if(species.sParentCompartment!==parents.sParentCompartment)
            __logger.info("changed parent compartment of Species  "+species.sId + " From " + species.sParentCompartment + " to "+parents.sParentCompartment);
    }
    //case no parent complex
    else{
        if(species.sParentComplex !== parents.sParentComplex)
            __logger.info("changed complex parent of Species "+species.sId + " From " + species.sParentComplex + " to "+parents.sParentComplex);
        if(species.sParentCompartment!==parents.sParentCompartment)
            __logger.info("changed parent of Species "+species.sId + " From " + species.sParentCompartment + " to "+parents.sParentCompartment);
    }

    species.sParentCompartment = parents.sParentCompartment;
    species.sParentComplex   = parents.sParentComplex;
    this.mapCompartmentLayouts[species.sParentCompartment].addChild(species.sId);
    this.mapSpeciesLayouts[species.sId] = species;
    __logger.info("Species with sID : " + species.sId + " added successfully.");
}

/**
 * Adds Compartment object to Compartment map
 * @param {Compartment} compartment
 * @throws {TypeError} if parameter of non species type is passed
 */
SBMLModel.prototype.addCompartment = function(compartment){
    //precondition parentCompartment validation ( no compartment means default )
    var tree = modelValidator.getParentAndChildrenOfCompartment(this.mapCompartmentLayouts, compartment);
    //log in case change of parent
    if(compartment.sParentCompartment!==tree.parent)
        __logger.info("changed parent of compartment "+compartment.sId + " From " + compartment.sParentCompartment + " to "+tree.parent);

    compartment.sParentCompartment = tree.parent;
    this.mapCompartmentLayouts[tree.parent].addChild(compartment.sId);
    for(var sId in tree.children){
        compartment.addChild(sId)
    };

    this.mapCompartmentLayouts[compartment.sId] = compartment;
    //post processing(validation)
    //validate parents
    __logger.info("Compartment with sID : " + compartment.sId + " added successfully.");
}

/**
 * Adds reaction object to reaction map
 * @param {Reaction} reaction
 * @throws {TypeError} if parameter of non species type is passed
 */
SBMLModel.prototype.addReaction = function(reaction){
    //Precondition : find parent of this reaction
    var parent = modelValidator.findParentCompartmentOfNode(this.mapCompartmentLayouts,reaction);
    reaction.sParentCompartment = parent.sParentCompartment;
    this.mapReactionLayouts[reaction.sId] = reaction;
    __logger.info("Reaction with sID : " + reaction.sId + " added successfully.");
    reaction.updateEdges(this.mapSpeciesLayouts);
}

/**
 *Builds edges (could end up removing some reaction if they happen to be invalid);
 */
SBMLModel.prototype.buildEdges = function(){
    //TODO: put builds
}

/**
 * Updates default compartment boundaries
 * @return {[type]} [description]
 */
SBMLModel.prototype.updateModelBoundaries = function(stickyChanges){
    var margin = 15;
    stickyChanges = stickyChanges || false;
    var chldrnOfDefault = [];
    // function getChldrenOfDefault(arrNodes){
    //     var returnThis = [];
    //     arrNodes.map(function(node){if(node.sParentCompartment === 'default') returnThis.push(node)});
    //     return returnThis;
    // }
    //get all children of default
    //compartment
    d3.values(this.mapCompartmentLayouts).map(function(node){if(node.sParentCompartment === 'default' && node.sName !== 'default') chldrnOfDefault.push(node)});
    //speceis
    d3.values(this.mapSpeciesLayouts).map(function(node){if(node.sParentCompartment === 'default') chldrnOfDefault.push(node)});
    //Reaction
    d3.values(this.mapReactionLayouts).map(function(node){if(node.sParentCompartment === 'default') chldrnOfDefault.push(node)});
    //and calculate exreme boundsn
    var defCompart = this.mapCompartmentLayouts['default'];
    //{sId:"default",iHeight:500,iWidth:500,position:{iX:0,iY:0}}

    var minTop             = defCompart.position.iX;
    var minLeft            = defCompart.position.iX;
    var minBottom          = defCompart.iWidth;
    var minRight           = defCompart.iHeight;
    //---------------------------
    /*
    int xMin = int32Rects.Min(s => s.X);
            int yMin = int32Rects.Min(s => s.Y);
            int xMax = int32Rects.Max(s => s.X + s.Width);
            int yMax = int32Rects.Max(s => s.Y + s.Height);
            var int32Rect = new Int32Rect(xMin, yMin, xMax - xMin, yMax - yMin);
     */
    var xMin = d3.min(chldrnOfDefault.map(function(d){return d.position.iX}))
    var xMax = d3.max(chldrnOfDefault.map(function(d){return d.position.iX + d.iWidth}))
    var yMin = d3.min(chldrnOfDefault.map(function(d){return d.position.iY}))
    var yMax = d3.max(chldrnOfDefault.map(function(d){return d.position.iY + d.iHeight}))
    var returnThis = {  top     : (xMin || 0) - 100,
                        left    : (yMin || 0) -100,
                        width   : d3.max([xMax - xMin,400]),
                        height  : d3.max([yMax - yMin,600]),
                    };
    if(stickyChanges){
        alert(stickyChanges)
        defCompart.iHeight  = d3.max([returnThis.height,700]);
        defCompart.iWidth   = d3.max([returnThis.width,500]);
        defCompart.position = {iX:returnThis.top,iY:returnThis.left};
        returnThis.width = defCompart.iWidth;
        returnThis.height = defCompart.iHeight;
    }
    //
    returnThis.width += 100;
    returnThis.height += 100;
    return returnThis;
}

/**
 * removes the node from mapSpeciesLayouts
 * @param  {string} sId sId of species to be removed
 * @return {boolean}    deletion status
 */
SBMLModel.prototype.removeSpecies = function(sId){
    var mapSpeciesLayouts = this.mapSpeciesLayouts;
    //if(mapSpeciesLayouts.hasOwnProperty(sId)){
    return delete mapSpeciesLayouts[sId];
    //}
    //return false;
}

SBMLModel.prototype.removeReaction =  function(sId){
    var mapReactionLayouts = this.mapReactionLayouts;
    //if(mapSpeciesLayouts.hasOwnProperty(sId)){
    //TODO: is it required to remove edge reference from invloved species node
    return delete mapReactionLayouts[sId];
}

SBMLModel.prototype.removeCompartment =  function(sId){
    var mapCompartmentLayouts = this.mapCompartmentLayouts;
    //if(mapSpeciesLayouts.hasOwnProperty(sId)){
    //TODO: is it required to remove edge reference from invloved species node
    return delete mapCompartmentLayouts[sId];
}
/**
 * Updates the reaction edge map
 * @param  {String}     sId     sId of reactio to be updated.
 * @return {Reaction}           updated reaction object
 * @throws {customErrors.ValidationError}              if invalid reaction sId is provided
 */
SBMLModel.prototype.updateReactionEdges = function(sId){
    var mapReactionLayouts = this.mapReactionLayouts;
    if(!mapReactionLayouts.hasOwnProperty(sId))
        throw  new customErrors.ValidationError(eskinMessages.error.validation_sId_does_not_exist);
    mapReactionLayouts[sId].updateEdges(this.mapSpeciesLayouts);
}
/**
 * Interates through all the nodes and corrects child parent relationship
 * @return {[type]} [description]
 */
SBMLModel.prototype.refreshNodeRelations = function(){
    for(var compartmentsId in this.mapCompartmentLayouts){
        //precondition parentCompartment validation ( no compartment means default )
        var compartment = this.mapCompartmentLayouts[compartmentsId];
        var tree = modelValidator.getParentAndChildrenOfCompartment(this.mapCompartmentLayouts, compartment);

        compartment.sParentCompartment = tree.parent;
        //TODO: figure this shit out. Why this goes in infinite loop
        //this.mapCompartmentLayouts[tree.parent].addChild(compartment.sId);
        // for(var sId in tree.children){
        //     compartment.addChild(sId)
        // };
        //
        //console.warn(tree);
    }

    for(var speciesId in this.mapSpeciesLayouts){
        var species = this.mapSpeciesLayouts[speciesId];
        species.sParentComplex = null;
        var parents = modelValidator.getSpeciesParents(this.mapCompartmentLayouts,this.mapSpeciesLayouts,species);
        var complexParent = this.mapSpeciesLayouts[species.sParentComplex];
        if(parents.sParentComplex){
                //console.warn(parents);
                //console.warn(species);
        }
        species.sParentCompartment = parents.sParentCompartment;
        species.sParentComplex   = parents.sParentComplex;
        this.mapCompartmentLayouts[species.sParentCompartment].addChild(species.sId);

    }
    for(var reactionsId in this.mapReactionLayouts){
        var reaction = this.mapReactionLayouts[reactionsId];
        var parent = modelValidator.findParentCompartmentOfNode(this.mapCompartmentLayouts,reaction);
        reaction.sParentCompartment = parent.sParentCompartment;
        this.mapReactionLayouts[reaction.sId] = reaction;
    }
}
/**
 * returns the object by sid if found.
 * @param  {String} sId sId of the node to be searched.
 * @return {instanceof Base} returns the object node if found.
 */
SBMLModel.prototype.getNodeObjectBySId = function(sId){
    //look for the node in species.
    //object could be model
    if(sId === this.sId) return this;
    //object could be edge
    if(sId.indexOf(':') > -1){
        //find reaction node
        var reactionParents = sId.split(':');
        var reactantSid     = this.mapReactionLayouts[reactionParents[0]] ?
                                        this.mapReactionLayouts[reactionParents[0]] : this.mapReactionLayouts[reactionParents[1]];
        return reactantSid.getAllEdges().filter(function(d){return d.sId === sId})[0];//filter returns array.
    }
    if(this.mapSpeciesLayouts.hasOwnProperty(sId)) return this.mapSpeciesLayouts[sId];
    if(this.mapCompartmentLayouts.hasOwnProperty(sId)) return this.mapCompartmentLayouts[sId];
    if(this.mapReactionLayouts.hasOwnProperty(sId)) return this.mapReactionLayouts[sId];

    return null;
}

/**
 * applys drag i.e. updates position and dimensions of nodes.
 * @param  {{sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}}  dragValues [description]
 * @return {}   finds the node in various maps and applies provided values.
 */
SBMLModel.prototype.applyDrag = function(dragValues){
    var speciesSIds = d3.keys(this.mapSpeciesLayouts);
    var compartmentSIds = d3.keys(this.mapCompartmentLayouts);
    var reactionSIds = d3.keys(this.mapReactionLayouts);
    var thisModel = this;
    d3.keys(dragValues)
        .forEach(function(sId){
            var thisNode;
            var dragNode = dragValues[sId]
            if(speciesSIds.indexOf(sId) != -1){
                thisNode = thisModel.mapSpeciesLayouts[sId];
            }
            else if(compartmentSIds.indexOf(sId) != -1){
                thisNode = thisModel.mapCompartmentLayouts[sId];
            }
            else if(reactionSIds.indexOf(sId) != -1){
                thisNode = thisModel.mapReactionLayouts[sId];
            }
            else{
                __logger.error('apply drag failed : Node with sId '+sId +" does not exists in model.")
                return;
            }
            //proces this node.
            thisNode.iHeight = dragNode.iHeight;
            thisNode.iWidth = dragNode.iWidth;
            thisNode.position = dragNode.position;
        });
}
/**
 * updates the node key value  to newval ( by applying required tranformations)
 * @param  {String} sId    sId of the node to be updated.
 * @param  {String} sKey   key to be updated in this node.
 * @param  {Object|String|Number} newVal new value to be updated.
 * @return {Species|compartment|Reaction}        updated node.
 * @throws {customErrors.ValidationError}
 */
SBMLModel.prototype.setNodeValueByKey = function(sId,sKey,newVal){
    if(!sId || !sKey){
        throw new customErrors.ValidationError('Missing cumpolsary parameter')
    }
    var thisNode = this.getNodeObjectBySId(sId);
    if(!thisNode){
        throw new customErrors.ValidationError(eskinMessages.validation_sId_does_not_exist);
    }
    if(!thisNode.hasOwnProperty(sKey))
        throw new customErrors.ValidationError('Property : '+sKey + ' does not exist.');
    //handle some special cases if any based on entityType
    switch (thisNode.getEntityType()) {
        case 'Edge':
            switch (sKey) {
                case 'rStoichiometry':
                    thisNode.setStoichiometry(parseFloat(newVal));
                    break;
                case 'bConstant':
                    //TODO: this setter must be passed only booleans.
                    thisNode.setConstant(newVal);
                    break;
                case 'sModifierType':
                    thisNode.setModifierType(newVal);
                    break;
                default:
            }
            break;
        default:

    }
    switch (sKey) {
        case 'position':
                newVal.iX = parseFloat(newVal.iX)
                newVal.iY = parseFloat(newVal.iY)
                modelValidator.validate_position(newVal);//this throws error if invalid position.
                thisNode[sKey] = newVal;
            break;
        case 'iHeight':
            //TODO: maintain aspect ration.
            newVal = parseFloat(newVal);
            thisNode[sKey] = newVal;
            break;
        case 'iWidth':
            //TODO: maintain aspect ration.
            newVal = parseFloat(newVal);
            thisNode[sKey] = newVal;
            break;
        default:
            thisNode[sKey] = newVal;
    }
}
