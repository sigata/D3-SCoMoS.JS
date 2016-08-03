/**
 * Module : construction
 * Takes care various construction tasks
 * Has various setters and getters to set up construction configs
 * For more details on the assumptions and design considerations refer to Readme.txt
 */
/**
 * creates the eskin mapConstructor object
 * @constructor
 * @return {modelConstructor} a model constructor object
 */

 function modelConstructor(rootElem,keyStore,model,operations){
    var consConst = constructionConstants;
    var isEnabled = false;
    var factory = SBMLFactory();
    var reactionConstructor = {source:null,target:null};
    var isConstructingNode = false;
    var construnctionConfig = {
        buildingEdge    :false,
        buildingNode    :false,
        activeToolType  :'',//should be one of species,compartment edges
        activeTool      :'',// currently selected tool form active tool type
        mode            :'DISCONTINUOUS',//unset values means that mode is not continuous draw.
    }
    /**
     * any pending construnctin jobs will be flushed. s
     * @return {[type]} [description]
     */
    function clearConstrunction(){
        reactionConstructor.source = null;
        reactionConstructor.target = null;
        construnctionConfig.buildingEdge = false;
        construnctionConfig.buildingNode = false;
    }
    /**
     * Resets construciton tool setting
     * @return {} reset active to tool to none change construction mode etc
    */
     var resetTools = function(){
         if(!construnctionConfig.buildingEdge){
             construnctionConfig.activeToolType = ''
             construnctionConfig.activeTool = '';
             //TODO: expose the event informing node construnct config change for outer
            __logger.info('construnction disabled. No active tool')
            dispatchToolChange();
         }
         else{
             console.warn('not resetting tools as edge construnction is in progress.');
         }

     }
     var dispatchToolChange = function(){
        eskinDispatch.toolStateChanged(construnctionConfig);
     }
     function getNodeConstrunctionOptions(event){
         // based on current tool construct a new object with aboce co ordinates
         var SBMLConst = SBMLConstants.defaults[construnctionConfig.activeTool];
         var _position = modelHelper.getTransformedCordinates(rootElem,event);
         //normalize _position
         _position.iX -= SBMLConst.iWidth/2;
         _position.iY -= SBMLConst.iHeight/2;
         var options = {iHeight:SBMLConst.iHeight,
                        iWidth:SBMLConst.iWidth,
                        position:_position,
                        sType:getMappedStypeFromTool(construnctionConfig.activeTool)
                    };
        options.sSpeciesGroup = getMappedGroupFromStype(options.sType);
        return options;
     }
     function getReactionConstrunctionOptions(){
         var SBMLConst = SBMLConstants.defaults[construnctionConfig.activeTool];
         var _position = shapeUtil.getMidPoint(reactionConstructor.source,reactionConstructor.target);
         var options = {sId:keyStore.getNextReaction(),
                        iHeight:SBMLConst.iHeight,
                        iWidth:SBMLConst.iWidth,
                        position:_position,
                        sType:getMappedStypeFromTool(construnctionConfig.activeTool)
                    };
         var reaction  = factory.getReaction(options);
         reaction.addReactant(reactionConstructor.source);
         reaction.addProduct(reactionConstructor.target);
         return reaction;
     }
     /**
      * Adds node to model based on current event and construction settings
      * @param  {D3 event} event D3 event ( generally mouse down on canvas)
      * @return {}    adds node to model and to View sets up entry in undo manager
      */
     var _constructNode = function (event){
        if(!construnctionConfig.activeToolType){
            __logger.info('Construnction aborted : no active tool selected')
            return;
        }

        // add model
        // refresh View
        // update undo manager
        try{
            if(!construnctionConfig.buildingNode || construnctionConfig.buildingEdge ){
                construnctionConfig.buildingNode = true;//mark that Construnction is active
                switch (construnctionConfig.activeToolType) {
                    case 'SPECIES':
                        var options = getNodeConstrunctionOptions(event);
                        options.sId = keyStore.getNextSpecies();
                        operations.addSpecies(options);
                        //construnctionConfig.buildingNode = false;//construnction done.
                        operations.refreshView();
                        break;
                    case 'COVALENT':
                        //this operations is allowed only on species which are not complex
                        var thisTarget = d3.select(event.target);
                        var thisData = thisTarget.datum();
                        if(!thisData){
                            construnctionConfig.buildingNode = false;
                            return "";
                        }
                        var options = thisData; //so that sid could be returned
                        if(thisData.getEntityType() === 'Species' && thisData.sType !== 'Complex'){
                            operations.addCovalantModification(thisData.sId,construnctionConfig.activeTool);
                        }
                        //construnctionConfig.buildingNode = false;//construnction done.
                        break;
                    case 'COMPARTMENT':
                        var options = getNodeConstrunctionOptions(event);
                        options.sId = keyStore.getNextCompartment();
                        operations.addCompartment(options);
                        //construnctionConfig.buildingNode = false;//construnction done.
                        break;
                    case 'REACTION' :
                        var thisNode    = d3.select(event.target).datum();
                        if(!thisNode) return "";
                        var entityType  = thisNode.getEntityType();
                        if(!construnctionConfig.buildingEdge){
                            //record source.
                            if(verifytoolSource(construnctionConfig.activeTool,entityType)){
                                console.warn('Buildong reaction : ' + construnctionConfig.activeTool);
                                construnctionConfig.buildingEdge = true;
                                reactionConstructor.source = thisNode;
                                return "";//nothing to choose
                            }else{
                                console.warn('invalid source '+thisNode.sId + " for tool : "+construnctionConfig.activeTool);
                                clearConstrunction();
                                return "";//nothing to choose

                            }
                        }else{
                            //record target.
                            if(verifytoolTarget(construnctionConfig.activeTool,entityType)){
                                switch (construnctionConfig.activeTool) {
                                    case 'ADDPRODUCT':
                                        try{
                                            operations.addProduct(reactionConstructor.source.sId,{sId:thisNode.sId});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return reactionConstructor.source.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Product failed: '+err.message);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Product failed: '+err.message});
                                        }
                                        break;
                                    case 'ADDREACTANT':
                                        try{
                                            operations.addReactant(thisNode.sId,{sId:reactionConstructor.source.sId});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return thisNode.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Reaction failed: '+err);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Reactant failed: '+err.message});
                                        }
                                        break;
                                    case 'ACTIVATOR':
                                        try{
                                            operations.addModifier(thisNode.sId,{sId:reactionConstructor.source.sId,sModifierType:"Activator"});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return thisNode.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Modifier failed: '+err.message);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Modifier failed: '+err.message});
                                        }
                                        break;
                                    case 'INHIBITOR':
                                        try{
                                            operations.addModifier(thisNode.sId,{sId:reactionConstructor.source.sId,sModifierType:"Inhibitor"});
                                            construnctionConfig.buildingNode = false;//construnction done.
                                            construnctionConfig.buildingEdge = false;
                                            return thisNode.sId;
                                        }
                                        catch(err){
                                            //throw error event so that in can be handled outside.
                                            console.warn('Add Modifier failed: '+err.message);
                                            clearConstrunction();
                                            eskinDispatch.constructionError({message:'Add Modifier failed: '+err.message});
                                        }
                                        break;
                                    default:
                                        //means source is allready recored. record target
                                        //and construnct reactions.
                                        construnctionConfig.buildingEdge = false;
                                        //construnctionConfig.buildingNode = false;//construnction done.
                                        reactionConstructor.target = thisNode;
                                        var options = getReactionConstrunctionOptions();
                                        operations.addReaction(options);
                                        //construnctionConfig.buildingNode = false;//construnction done.
                                }
                            }
                        }
                        break;
                    case 'MODIFIER':

                        break;
                    default:
                        console.warn('No active Tool :Construnction Aborted');
                }
            }
            //construnctionConfig.buildingNode = false;//construnction done.
            if(options) return options.sId;
            return "";
        }catch(err){
            construnctionConfig.buildingNode = false;//construnction done.
            construnctionConfig.buildingEdge = false;//construnction done.
            __logger.error("construct node operation failed. "+err.message);
            return "";
        }
     }
     /**
      * ToolName for active Tool
      * @param  {String} toolName
      * @return {string}          current active toolName
      * @throws {Error} throws error if invaid toolName specified
      */
     var _setActiveTool = function(toolName){
        //find category of this tool
        var toolFound = false;
        for( var category in consConst.tools){
            if(consConst.tools[category].indexOf(toolName)!== -1){
                //update config
                construnctionConfig.activeToolType = category.toUpperCase();;
                construnctionConfig.activeTool = toolName.toUpperCase();
                toolFound = true;
                clearConstrunction();
                break;
            }
        }
        if(!toolFound)
            throw new Error('Invalid toolName : '+toolName +". Not supported by library.")
        __logger.info(toolName + " is active tool.")
        dispatchToolChange();
     }
     /**
      * function checks if the event.target is valid i.e. allowed for construnction.
      * @param  {event}  event Event object to be validated.
      * @return {Boolean}       is valid target or not.
      */
     function isValidEventTarget(event){
        var target = event.target;
        if(!target) return false; //target must exist
        if(target.tagName === 'svg')
            return true;

        var thisData = d3.select(target).datum();
        if(construnctionConfig.activeToolType.toUpperCase() === 'COVALENT' && (thisData && thisData.getEntityType() === 'Species' && thisData.sType.toUpperCase() !== 'COMPLEX')){
            return true;
        }
        if(construnctionConfig.activeToolType.toUpperCase() === 'SPECIES' && (thisData && thisData.getEntityType() === 'Species' && thisData.sType.toUpperCase() === "COMPLEX")){
            return true
        }
        if(construnctionConfig.activeToolType.toUpperCase() === 'REACTION' )//|| (thisData && thisData.getEntityType() === 'Species' && thisData.sType.toUpperCase() === 'COMPLEX')
            return true;
        return false;
     }
     return {
        enable:function(){
            isEnabled = true;
        },
        disable:function(){
            isDisabled = false;
            //TODO: clear tools
        },
        /**
         * Adds node to model based on current event and construction settings
         * @param  {D3 event} event D3 event ( generally mouse down on canvas)
         * @return {}    adds node to model and to View sets up entry in undo manager
         */
        constructNode:function(event){
            var _sId ;
            if(isEnabled && isValidEventTarget(event)){
                _sId = _constructNode(event);
            }
                //mark this node selected
                var node;
                if(_sId){
                    switch (construnctionConfig.activeToolType) {
                        case 'SPECIES':
                            node = d3.selectAll(".species-node").filter(function(d){return d.sId === _sId});
                            break;
                        case 'COVALENT':
                            //TODO: figure out way to select the construncted covalent instead
                            node = d3.selectAll(".species-node").filter(function(d){return d.sId === _sId});
                            break;
                        case 'COMPARTMENT':
                            node = d3.selectAll(".compartment").filter(function(d){return d.sId === _sId});
                            break;
                        case 'REACTION' :
                            console.warn('Buildong reaction' + construnctionConfig.activeTool);
                            break;
                        default:

                    }
                    if(construnctionConfig.mode === 'DISCONTINUOUS'){
                        resetTools();
                    }
                    if(node)
                        modelHelper.triggerClickOnNode(node);
                        //this is IMPORTANT : don't reset this value before the node select is triggered. Other wise
                        //construnction will be triggered reslulting infinite loop
                        setTimeout(function(){
                            construnctionConfig.buildingNode = false;//construnction done.
                        })
                }

            else{
                __logger.warn("Construction mode not enabled");
            }
        },
        /**
         * set current active tool if construnction enabled
         * @param  {String} toolName [description]
         * @return {String}        current active toolName
         * @throws {Error} throws error if invaid toolName specified
         */
        setActiveTool:function(toolName){
            if(isEnabled)
                _setActiveTool(toolName);
        },
        /**
         * sets the construnction mode to correct values dispatches event informing said changed
         * @param  {String} mode valid values CONTINUOUS and  DISCONTINUOUS
         * @return {[type]}      [description]
         */
        setConstrunctionMode:function(mode){
            switch (mode) {
                case 'CONTINUOUS':
                    construnctionConfig.mode = mode;
                    break;
                case 'DISCONTINUOUS':
                    construnctionConfig.mode = mode;
                    break;
                default:
                    __logger.console.warn("invalid construnction mode : " +mode + "specified");
            }
            dispatchToolChange();
        },
        /**
         * returns the source object if reaction is being built else returns false;
         * @return { Species||Reaction || undefined} source object if constructing edge else undefined.
         */
        isConstructingEdge:function(){
            return construnctionConfig.buildingEdge;
        },
        /**
         * stops current construnction operation, without resetting the tools.
         * @return {[type]} [description]
         */
        stopCurrentOperation : function(){
            clearConstrunction();
        },
        /**
         * returns the private reactionConstructor varialbe which tracks sources and target for the edge to be drawn.
         * @return {{source:SBMLNode,target:SBMLNode}} [description]
         */
        getReactionConstructor:function(){
            return reactionConstructor;
        },
        updateRootElem : function(newRootElem){
            rootElem = newRootElem;
        },
        getDetails : function(){
            return construnctionConfig;
        }
     }
}
