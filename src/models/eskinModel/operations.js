/**
 * This module contains various operations that will be
 * used in construction of the model Graph.
 */

/**
 * creates eskinOperations Object
 * @constructor
 * @param {String} rootElem fully qualified div selector
 * @param {Object} config a config object
 * @returns {Object} eskinOperations return eskinOperationsObject
 */
var eskinOperations = function(rootElem,config){
    //rootElem is compulsory parameter
    //if not passed will result in error

    var keyStore                = new eSkinkeyStore();
    var model                   = null;
    var view                    = null;
    var geneExpressionOverlay   = null;
    var construction            = null;
    var factory                 = SBMLFactory();
    var undoManager             = new d3scomos.undoManager();
    var contextHandler             = null;
    //---- add geo code ---
    //TODO: this is supposed to be removed once done with drag and drop
    var geoAdd ;
    //-----------
    if(!rootElem){
        d3scomos.Logger.error("eskin model operations rootElem not passed");
        return null;
    }
    //var thisSVG;
    /** return this object **/
    var operations = {
        undoManager : undoManager,
        initCanvas : function(){
            view.initCanvas();
        },
        /**
         * initializes the modelData object
         * @param {Object} data object with init params
         * @throws {ValidationError} if non optional params are missing
         **/
        initModel : function(data){
            //clear keyStore
            keyStore.clear();
            keyStore.addKey(data.sId);//
            //initModel data will loose any previous data
            model           = factory.getSBMLModel(data);
            construction    = new modelConstructor(rootElem,keyStore,model,this);
            contextHandler     = {cut:this.cut,copy:this.copy,paste:this.paste,delete:this.deleteSelected};
            view            = eskinView(rootElem,config,model,undoManager,construction,contextHandler);

        },
        /**
         * accepts molecule(species) data and adds it to model after validation
         * @param {Object} species data
         * @throws {ValidationError} if non optional params are missing
         **/
        addSpecies : function addSpecies (species){
            if(!species || species === {})
                throw new TypeError("Empty or no species data passed");
            //validate the data
            try{
                undoableOperations.constructSpecies(species,keyStore,model,view);
                undoManager.add({
                    undo:function(){
                        undoableOperations.destructSpecies(species.sId,keyStore,model,view);
                    },
                    redo : function(){
                        undoableOperations.constructSpecies(species,keyStore,model,view);
                    }
                })
            //console.warn(undoManager);
            //dispatch event informing undoManager is changed
            eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add species: validation failed "+err.message);
                }
                throw err;
            }
        },
        /**
         * deltes the current scomosSelections
         * TODO: for now only one species will be deleted i.e. does not support multi select delete
         * 		ALso does not support complex delete
         * @return {Boolean} deletion status
         */
        deleteSelected:function(){

            //deletethe selected species if any
            var currSelection = d3.selectAll('.selected');
            if(currSelection[0].length == 0)
                return;
            var confirmDelete = confirm("Please note that selected entity and all its children will be deleted. Do you wish to proceed with this action?");
            if(!confirmDelete) {
                __logger.info('Deletion aborted by user.')
                return;
            }
            try{
                var currSelection = view.getSelection().getDestructableSelection();
                undoableOperations.destructSelection(currSelection,model,view,keyStore);
                view.refresh();
                undoManager.add({
                    undo:function(){
                        undoableOperations.constructSelection(currSelection,model,view,keyStore);
                    },
                    redo : function(){
                        undoableOperations.destructSelection(currSelection,model,view,keyStore);
                    }
                });
                //console.warn(undoManager);
                //dispatch event informing undoManager is changed
                eskinDispatch.undoManagerEvent(undoManager);
                view.getSelection().clear();
                eskinDispatch.nodeDeleted();
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add species: validation failed "+err.message);
                }
                throw err;
            }

        },
        /**
         * adds species as part of GEO drag drop functionality
         * TODO: remove this method once drag drop is figured out
         * @param {Object} species Species object to be added. Position values passed in will be ignored.
         */
        addSpeciesGEO : function addSpeciesGEO (species){
            species.sId = keyStore.getNextSpecies();
            this.addSpecies(species);
            geneExpressionOverlay = null; //so that new data is loaded
        },
        /**
         * accepts compartment data and adds it to model after validation
         * @param {Object} compartment data
         * @throws {ValidationError} if non optional params are missing
         **/
        addCompartment : function addCompartment (compartment){
            if(!compartment || compartment === {})
                throw new TypeError("Empty or no Compartment data passed");

            try{
                undoableOperations.constructCompartment(compartment,keyStore,model,view);
                undoManager.add({
                    undo:function(){
                        undoableOperations.destructCompartment(compartment.sId,keyStore,model,view);
                    },
                    redo : function(){
                        undoableOperations.constructCompartment(compartment,keyStore,model,view);
                    }
                })
            //console.warn(undoManager);
            //dispatch event informing undoManager is changed
            eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add Compartment: validation failed "+err.message);
                }
                throw err;
            }
        },
        /**
         * accepts reaction data and adds it to model after validation
         * @param {Object} compartment
         * @throws {ValidationError} if non optional params are missing
         **/
        addReaction : function addReaction (reaction){
            if(!reaction || reaction === {})
                throw new TypeError("Empty or no species data passed");
            //reactions received from the eskin server lacks the iHeight and iWidth
            //add them
            reaction.iHeight = reaction.iHeight || 20;
            reaction.iWidth = reaction.iWidth || 20;
            try{
                undoableOperations.constructReaction(reaction,keyStore,model,view);
                undoManager.add({
                    undo:function(){
                        undoableOperations.destructReaction(reaction.sId,keyStore,model,view);
                    },
                    redo : function(){
                        undoableOperations.constructReaction(reaction,keyStore,model,view);
                    }
                })
            //console.warn(undoManager);
            //dispatch event informing undoManager is changed
            eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add Reaction: validation failed "+err.message);
                }
                throw err;
            }
        },
        /**
         * adds covalent modifier to species species
         * @param  {String} sId          [description]
         * @param  {String} modifierType modifier string. Must be valid string. Valid string list is available in construnctionConstants.
         * @return {String}              sModification returns updated sModification string.
         * @throws customErrors.ValidationError if invalid sId is passed
         */
        addCovalantModification:function(sId,modifierType){
            try{
                return undoableOperations.addCovalantModification(sId,modifierType,model,view)
            }
            catch(err){
                if(err instanceof customErrors.ValidationError){
                    __logger.error("add covalentModification: Operation failed for sId"+sId+'.Reason ;'+err.message);
                }
                throw err;
            }
        },
        /**
         * adds the newModifier to the reaction.
         * @param  {String} reactionSId source reaction.
         * @param  {{sID:String,bConstant:boolean ... etc}} prouctOptions  product build options.
         * @return {}      adds the new product if valid, also puts the operation on undoManager.
         */
        addProduct : function(reactionSId,prouctOptions){
            try{
                undoableOperations.addProduct(reactionSId,prouctOptions,model,view);
                undoManager.add({
                    undo : function(){
                        undoableOperations.removeProduct(reactionSId,prouctOptions.sId,model,view);
                    },
                    redo : function(){
                        undoableOperations.addProduct(reactionSId,prouctOptions,model,view);
                    }
                })
                eskinDispatch.undoManagerEvent(undoManager);
            }catch(err){
                __logger.error('Add product Failed. Reason : ' + err.message);
                throw err;
            }
        },
        addReactant : function(reactionSId,reactantOptions){
            try{
                undoableOperations.addReactant(reactionSId,reactantOptions,model,view);
                undoManager.add({
                    undo : function(){
                        undoableOperations.removeReactant(reactionSId,reactantOptions.sId,model,view);
                    },
                    redo : function(){
                        undoableOperations.addReactant(reactionSId,reactantOptions,model,view);
                    }
                })
                eskinDispatch.undoManagerEvent(undoManager);
            }catch(err){
                __logger.error('Add Reactant Failed. Reason : ' + err.message);
                throw err;
            }
        },
        addModifier : function(reactionSId,modifierOptions){
            try{
                undoableOperations.addModifier(reactionSId,modifierOptions,model,view);
                undoManager.add({
                    undo : function(){
                        undoableOperations.removeModifier(reactionSId,modifierOptions.sId,model,view);
                    },
                    redo : function(){
                        undoableOperations.addModifier(reactionSId,modifierOptions,model,view);
                    }
                })
                eskinDispatch.undoManagerEvent(undoManager);
            }catch(err){
                __logger.error('Add Modifier Failed. Reason : ' + err.message);
                throw err;
            }
        },
        /**
         * provides node key value update hook for property explorer, so that undo redo will be supported.
         * @param  {string} sId    sId of the node to be updated.
         * @param  {string} sKey   key in this node that is to be updated.
         * @param  {String|Object} newVal newValue to be updated on this object. Mostly is string could be the Object somethimes.
         * @return {instanceof Base}        returns updated object.
         */
        setNodeValueByKey:function(sId,sKey,newVal){
            //check if key exists.
            try{
                var thisNode = model.getNodeObjectBySId(sId);
                var oldVal = thisNode[sKey];
                model.setNodeValueByKey(sId,sKey,newVal);
                view.refresh();
                resizer.updateResizer();
                undoManager.add({
                    undo:function(){
                        model.setNodeValueByKey(sId,sKey,oldVal);
                        view.refresh();
                        resizer.updateResizer();
                    },
                    redo:function(){
                        model.setNodeValueByKey(sId,sKey,newVal);
                        view.refresh();
                        resizer.updateResizer();
                    }
                });
                eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(error){
                __logger.error('setNodeValueByKey Falied : ' + error.message);
                throw error;
            }
        },
        getNodeNameBySId : function(sId){
            return model.getNodeObjectBySId(sId).sName;
        },
        /**
         * fits this view to the screen
         * @return {[type]} [description]
         */
        fitToScreen:function(){
                view.fitToScreen();
        },
        resetZoom : function(){
            view.resetZoom();
        },
        zoomIn : function(){
            return view.zoomIn();
        },
        zoomOut : function(){
            return view.zoomOut();
        },
        setViewMode:function(__mode){
            __mode = __mode.toUpperCase();
            var __panMode;
            switch (__mode) {
                    case "PAN":
                        __panMode = __mode;
                        break;
                    case "SELECT":
                        __panMode = __mode;
                        break;
                    default:
                        console.log("Invalid pan mode " + __mode + " defaulting mode PAN")
                        __panMode = "PAN";
                        break;
                }
            view.setPanMode(__panMode);
        },
        /**
         * provides direct access to underlying model object
         * avoid using this added to enable better testing
         **/
        getModel : function(){
            return model;
        },
        /**
         * loads the pre created SBML model instead of creating new one.
         * @param  {SBMLModel} _model Precreated SBML model.
         * @return {}     loads this model as the model.
         */
        loadSBMLModel : function(_model){

        },
        refreshView:function(){
            view.refresh();
            //if(geneExpressionOverlay) geneExpressionOverlay.refresh();
        },
        /**
         * initializes SBMLModel with this data and activates GEO functionalities for this Model
         * @param  {{fileHeaderMap:[String],
         *                  geneData:{'geneName':{
         *                              'inPathwayMap':"String",
         *                               expressionValues:[number]
         *                               visualData:{
         *                                  overlayStateList:[overlaystate shortcode:String]
         *                                  colorList:[String]
         *                                  }
         *                                }
         *                         }
         *         }} GEOData overlay data produced by the eskin geneOverlay API]
         * @return {[type]}         [description]
         * @throws {customErrors.ValidationError}
         */
        loadGEOData:function(GEOData,GEOConfig){
            //model.setGEOData(GEOData);
            //if(!geneExpressionOverlay)
                    geneExpressionOverlay = new GEOverlay(GEOData,GEOConfig);
                    view.enableOverlayMode();
            //else
                //geneExpressionOverlay.updateGEOData(GEOData,GEOConfig);
            //var GeoConfig = {'currentExperiment':'expressionValue1'};
            //geneExpressionOverlay = new GEOverlay(model,{'fileHeaderMap':fHeader,'geneData':mTestData},GeoConfig);
        },
        changeRootElem : function(newRootElem){
            rootElem = newRootElem;
            view.changeGraphRoot(rootElem);
            construction.updateRootElem(rootElem);
        },
        cut : function(){
            //copy content to the clip board
            clipboard.copy(view.getSelection().getCopiableSelection());
            _ops.deleteSelected();
            view.refresh();
            // trigger destructSelection
        },
        copy : function(){
            // copy contents to clipboard.
            clipboard.copy(view.getSelection().getCopiableSelection());
        },
        paste : function(){
            try{
                //means was triggered by contexMenu
                if(d3.event){
                    var pasteAt = modelHelper.getTransformedCordinates(rootElem,event);
                }
                var pastableSelection = modelHelper.getPastableSelection(clipboard.paste(),keyStore,pasteAt);
                model.updateModelBoundaries();
                console.warn(pastableSelection);
                undoableOperations.constructSelection(pastableSelection,model,view,keyStore,{markSelected:true});
                undoManager.add({
                    undo : function(){
                        undoableOperations.destructSelection(pastableSelection,model,view,keyStore);
                    },
                    redo : function(){
                        undoableOperations.constructSelection(pastableSelection,model,view,keyStore);
                    }
                });
                eskinDispatch.undoManagerEvent(undoManager);
            }
            catch(err){
                __logger.error('Paste failed : '+err.message)
            }


        },
        checkClipboard : function(){
            clipboard.triggerClipboardEvent();
        },
        /**
         * selectes node based on the provied type.
         * @param  {String} nodeSId  node index to be selected.
         * @param  {String} nodeType node type seelcted.
         * @return {clickevent dispatch}    dispatches appropriate click event.
         */
        selectNode : function(nodeSId,nodeType,ctrlKey){
            //find the node and select.
            if(!ctrlKey) ctrlKey = false;
            else
                ctrlKey = true;
            var eventOptions = {ctrlPressed:ctrlKey};
            switch (nodeType) {
                case "Species":
                    var speciesNode = d3.selectAll(".species-node").filter(function(d){return d.sId === nodeSId});
                    modelHelper.handleExternalNodeSelection(speciesNode,view.getSelection(),ctrlKey);
                    eskinDispatch.speciesClick(speciesNode.datum(),speciesNode.node(),eventOptions);
                    break;

                case "Reaction":
                    var reactionNode =  d3.selectAll(".reaction-node").filter(function(d){return d.sId === nodeSId});
                    modelHelper.handleExternalNodeSelection(reactionNode,view.getSelection(),ctrlKey);
                    eskinDispatch.reactionClick(reactionNode.datum(),reactionNode.node(),eventOptions);
                    break;
                case "Compartment":
                    var compartmentNode =  d3.selectAll(".compartment").filter(function(d){return d.sId=== nodeSId});
                    modelHelper.handleExternalNodeSelection(compartmentNode,view.getSelection(),ctrlKey);
                    eskinDispatch.compartmentClick(compartmentNode.datum(),compartmentNode.node(),eventOptions);
                    break;
                default:

            }
        },
        /**
         * Wrapper for all construnction methods
         * @type {Object}
         */
        construction : {
            /**
             * sets the construction mode on/off.
             * @param  {Boolean} isEnabled enable or disable the construction mode
             * @return {}            [description]
             */
            enableConstruction:function(isEnabled){
                if(!construction)
                    throw new Error('Operation failed: Enable Construnction mode.')
                if(isEnabled == true)
                    construction.enable();
                else
                    construction.disable();
            },
            /**
             * returns all the construcion tools supported by the library
             * @return {[String]} Array of Tools names without categories
             */
            getAllTools:function(){
                return d3.values(d3.values(constructionConstants.tools)[0]);
            },
            /**
             * set the active tool
             * @param  {string} toolName active tool
             * @return {string}  current active tool
             * @throws {Error} throws error if invaid toolName specified
             */
            setActiveTool:function(toolName){
                construction.setActiveTool(toolName)
            },
            setConstrunctionMode : function(mode){
                return construction.setConstrunctionMode(mode);
            },
        }
    };
    var _ops = operations;//store refrence to self.
    return operations;
}
