/**
 * Module will contain all the undoable operations.
 */
var undoableOperations = {
    /**
     * constructs a species object and adds it to the model and view.
     * @param  {Object} options  SBML object options.
     * @param  {KeyStoer} keyStore instance of Keystore.
     * @param  {SBMLModel} model    instance of active SBMLModel.
     * @param  {eskinView} view     instance of eskinView object.
     * @return {}          construcns a species node and adss to view and other relevent components.
     * @throws {customErrors.ValidationError} if invalid object params are provided.
     */
    constructSpecies : function(options,keyStore,model,view){
        try{
            //TODO handle construction mode here
            var speciesObj = SBMLFactory().getSpecies(options);//validates and throws exception if any

            keyStore.addSpecies(speciesObj.sId);
            //add this model to model
            model.addSpecies(speciesObj);
            //add this species to view
            view.addNode(speciesObj);
        }
        catch(err){
            if(err instanceof customErrors.ValidationError){
                __logger.error("add species: validation failed "+err.message);
            }
            throw err;
        }
    },
    /**
     * destructs  a species object and removes it to from model and view
     * @param  {Object} options  SBML object options
     * @param  {KeyStoer} keyStore instance of Keystore
     * @param  {SBMLModel} model    instance of active SBMLModel
     * @param  {eskinView} view     instance of eskinView object
     * @return {D3 selector}        removes species node from all relevent components and returns selector to deleted node.
     */
    destructSpecies : function(speciesId,keyStore,model,view){
        try{
            keyStore.removeKey(speciesId);
            //add this model to model
            model.removeSpecies(speciesId);
            //add this species to view
            return view.removeNode(speciesId,'Species');
        }
        catch(err){
                __logger.error("Delete species: Operation failed "+err.message);
            throw err;
        }
    },

    constructReaction : function(reaction,keyStore,model,view){
        //validate the data
        try{
            var reactionObj = SBMLFactory().getReaction(reaction);//validates and throws exception if any
            keyStore.addReaction(reaction.sId);
            model.addReaction(reactionObj);
            view.addNode(reactionObj);
        }
        catch(err){
            if(err instanceof customErrors.ValidationError){
                __logger.error("add reaction: validation failed "+err.message);
            }
            throw err;
        }
    },
    destructReaction : function(reactionsId,keyStore,model,view){
        try{
            keyStore.removeKey(reactionsId);
            //add this model to model
            model.removeReaction(reactionsId);
            //add this species to view
            return view.removeNode(reactionsId,'Reaction');
        }
        catch(err){
                __logger.error("Delete Reaction: Operation failed "+err.message);
            throw err;
        }
    },
    constructCompartment : function(compartment,keyStore,model,view){
        try{

            var compartmentObj = SBMLFactory().getCompartment(compartment);//validates and throws exception if any
            keyStore.addCompartment(compartment.sId);
            //add this model to model
            model.addCompartment(compartmentObj);
            view.addNode(compartmentObj);
        }
        catch(err){
            if(err instanceof customErrors.ValidationError){
                __logger.error("add compartment: validation failed "+err.message);
            }
            throw err;
        }
    },
    destructCompartment : function(compartmentsId,keyStore,model,view){
        try{
            keyStore.removeKey(compartmentsId);
            //add this model to model
            model.removeCompartment(compartmentsId);
            //add this species to view
            return view.removeNode(compartmentsId,'Compartment');
        }
        catch(err){
                __logger.error("Delete Compartment: Operation failed "+err.message);
            throw err;
        }
    },
    constructEdge : function(edge,view,model){
        edge.addEdgeToParents();
        //trigger edge update on model
        model.updateReactionEdges(edge.getParentReaction().sId);
        view.refresh();
    },
    destructEdge : function(edge,view){
        edge.removeFromParents();
        view.removeNode(edge.sId,edge.getEntityType());
    },
    descructModification : function(modificationNode){
        modificationNode.changeModificationType();
        console.warn('removed modificationNode : '+modificationNode.pos);
    },
    /**
     * construncts current selection methodically so that it can be rebuilt later
     * @param  {{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}} toBeBuilt scomos selection object
     * @param  {SBMLModel} model     current sbml model object
     * @param  {eskinView} view      Current eskinView object
     * @param  {Keystore} keyStore  current Keystore object
     * @param {{markSelected:Boolean}} options options to be used while carying out construct Selection operation.
     * @return {[Compartment|Species|Reaction|Edge`]}           set of construncted objects so that objects can be rebuild as required.
     */

    constructSelection : function(toBeBuilt,model,view,keyStore,options){
        if(toBeBuilt.hasOwnProperty('compartments'))
            toBeBuilt.compartments.
                forEach(function(compartment){undoableOperations.constructCompartment(compartment,keyStore,model,view)});
        if(toBeBuilt.hasOwnProperty('species'))
            toBeBuilt.species.
                forEach(function(species){undoableOperations.constructSpecies(species,keyStore,model,view)});
        if(toBeBuilt.hasOwnProperty('reactions'))
            toBeBuilt.reactions.
                forEach(function(reaction){undoableOperations.constructReaction(reaction,keyStore,model,view)});
        if(toBeBuilt.hasOwnProperty('edges'))
            toBeBuilt.edges
                .forEach(function(edge){undoableOperations.constructEdge(edge,view,model)});
        if(options && options.hasOwnProperty('markSelected') && options.markSelected){
            view.getSelection().clear();
            modelHelper.selectNodesByData(toBeBuilt);
        }
        return toBeBuilt;
    },
    /**
     * Destroys current selection methodically so that it can be rebuilt later
     * @param  {{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}} toBeDeleted scomos selection object
     * @param  {SBMLModel} model     current sbml model object
     * @param  {eskinView} view      Current eskinView object
     * @param  {Keystore} keyStore  current Keystore object
     * @return {[Compartment|Species|Reaction|Edge`]}           set of removed objects so that objects can be rebuild as required.
     */
    destructSelection : function(toBeDeleted,model,view,keyStore){
        /**
         * Algo :
         * 	1) getDraggableSelection s
         * 		for all edges in s remove edges from there parents and update view from the view.
         * 		for all species in s remove the species.
         * 		for all the reaction in s remove reaction.
         * 		for all the compartment in s remove compartment.
         */
        //var selection = view.getSelection();
        //{'compartments':[Compartment],'species':[Species],'reactions':[Reaction],'edges':[Edge]}
        //var toBeDeleted = selection.getDestructableSelection();
        if(toBeDeleted.hasOwnProperty('edges'))
            toBeDeleted.edges
                .forEach(function(edge){undoableOperations.destructEdge(edge,view)});
        if(toBeDeleted.hasOwnProperty('modifications')){
            //sort the modification nodes in order of pos
            console.warn('before sort');
            console.warn(toBeDeleted.modifications);
            toBeDeleted.modifications.sort(function(ob1,ob2){return ob1.pos < ob2.pos;});
            console.warn(toBeDeleted.modifications);
            toBeDeleted.modifications.
                forEach(function(modification){undoableOperations.descructModification(modification)});
        }
        if(toBeDeleted.hasOwnProperty('species'))
            toBeDeleted.species.
                forEach(function(species){undoableOperations.destructSpecies(species.sId,keyStore,model,view)});
        if(toBeDeleted.hasOwnProperty('reactions'))
            toBeDeleted.reactions.
                forEach(function(reaction){undoableOperations.destructReaction(reaction.sId,keyStore,model,view)});
        if(toBeDeleted.hasOwnProperty('compartments'))
            toBeDeleted.compartments.
                forEach(function(compartment){undoableOperations.destructCompartment(compartment.sId,keyStore,model,view)});

        view.getSelection().clear();
        return toBeDeleted;
    },
    /**
     * adds the covalent modification to the passed species.
     * @param  {string} sId   species sid to add modifier to.
     * @param  {string} modifierType   modifierType to be appened.
     * @param  {SBMLModel} model SBMLModel instance.
     * @param  {eskinView} view  eskinView object.
     * @return {string}       Newly formed sModification string.
     * @throws  {customErrors.ValidationError} if invalid or non existent sId passed.
     */
    addCovalantModification:function(sId,modifierType,model,view){
        var thisData = model.mapSpeciesLayouts[sId];
        if(!thisData)
            throw  new customErrors.ValidationError(eskinMessages.error.validation_sId_does_not_exist);
        if(!thisData.sModification){
            thisData.sModification = constructionConstants.covalentToolMappings[modifierType];
        }
        else{
            thisData.sModification = thisData.sModification.concat('-'+ constructionConstants.covalentToolMappings[modifierType]);
        }
        view.updateSpeciesCovalantModification(sId);//update covalent mod for this species specifically;
        return thisData.sModification;
    },
    /**
     * adds the product to the reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {{sID:String,bConstant:boolean ... etc}} prouctOptions  product build options.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {String}             returns this reactions sid if successful.
     * @throws exception if invalid param i.e. trying to readd the product.
     */
    addProduct : function(reactionSId,prouctOptions,model,view){
        var productSId = prouctOptions.sId;
        var reactionNode = model.mapReactionLayouts[reactionSId];
        reactionNode.addProduct(prouctOptions);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return reactionSId;
    },
    /**
     * adds the product to the reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {String} productSId  target species sId.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {{removed product object}}             returns removed species object, to enable reconstruction if required.
     */
    removeProduct : function(reactionSId,productSId,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        var returnThis = reactionNode.removeProduct(productSId);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return returnThis;
    },
    /**
     * adds the reactant to the reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {{sID:String,bConstant:boolean ... etc}} prouctOptions  reactant build options.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {String}             returns this reactions sid if successful.
     * @throws exception if invalid param i.e. trying to readd the product.
     */
    addReactant : function(reactionSId,reactantOptions,model,view){
        var reactantSId = reactantOptions.sId;
        var reactionNode = model.mapReactionLayouts[reactionSId];
        reactionNode.addReactant(reactantOptions);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return reactionSId;
    },
    /**
     * removes the  reactant from reaction.
     * @param  {String} reactionSId source reaciton sId.
     * @param  {String} reactantSId  target species sId.
     * @param  {SBMLModel} model       instanceof active SBMLModel.
     * @param  {eskinView} view        instanceof active eskinView
     * @return {{removed product object}}             returns removed reactant object, to enable reconstruction if required.
     */
    removeReactant : function(reactionSId,reactantSId,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        var returnThis = reactionNode.removeReactant(reactantSId);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return returnThis;
    },
    addModifier : function(reactionSId,modifierOptions,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        reactionNode.addModifier(modifierOptions);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return reactionSId;
    },
    removeModifier : function(reactionSId,modifierSId,model,view){
        var reactionNode = model.mapReactionLayouts[reactionSId];
        var returnThis = reactionNode.removeModifier(modifierSId);
        model.updateReactionEdges(reactionNode.sId);
        view.refresh();
        return returnThis;
    },
    /**
     * records drag event values in undo stack.
     * @param  {undoManager} undoManager active undoManager object to record this operatin on.
     * @param  {{sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}}  beforeDrag  [description]
     * @param  {{sId:{iHeight:Number,iWidth:Number,position:{iX:Number,iY:Number}}}}  afterDrag   [description]
     * @return {}    records drag event on provided undoManager.
     * //IMPORTANT this is the method gets reference of undoManager. We avoid doing this.
     * But here this operation is triggered by view entity which does not have access to operations object.
     */
    recordDrag : function(undoManager,model,beforeDrag,afterDrag){
        undoManager.add({
            undo:function(){
                model.applyDrag(beforeDrag);
                resizer.clearResizer()
            },
            redo:function(){
                model.applyDrag(afterDrag);
                resizer.clearResizer()
            }
        })
        eskinDispatch.undoManagerEvent(undoManager);
    },
    pasteSelection: function(toBePasted,model,view,keyStore){

    }
}
