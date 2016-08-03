/**
 * Re-factored from scomosGraph.js.
 * eskin model will follow following flow in general
 * all rendering should result from the construct operation making sure various operation will
 * follow the same path. This also makes it quite easier to validate data and manage model data
 * errors in more efficient manner.
 * TODO: Add design document specifying assumed design strategy and assumptions for eskin model.
 */

/**
 * Create the d3 force graph for eskin data model.
 * graph created is very strictly bound to the JSON data model of
 * the eskin sbml format
 * @constructor
 * @param {String} injectInto div to draw model into
 * @param {Object} eskinConfig config object to set def property for this model
 */
d3scomos.eskinModel = function eskinModel (injectInto,eskinConfig){

	/** module private variables **/
	var injectedInto;
	if(injectInto instanceof d3.selection){
			injectedInto = injectInto[0][0];//defaults to div with id eskinModel
	}
	else{
		 injectedInto = injectInto || "#eskinModel";//defaults to div with id eskinModel
		 injectedInto = "#"+injectInto;
	}

	//var modelData = new ModelDataApi();
	var eskinOps;
	/** initialize private variables **/

	// if(injectInto)
	// 	injectedInto = "#"+injectInto;

	/** default eSkinConfig **/
	var _defEskinConfig = {
			height : "500px",
			width : "100%",
			autoFit : true
	}
	//augment property on passed config with default config object
	if(eskinConfig){
		for( var prop in eskinConfig){
			if(eskinConfig.hasOwnProperty(prop))
				_defEskinConfig[prop] = eskinConfig[prop];
		}
	}

	//set def as new eskinConfig
	eskinConfig = _defEskinConfig;

	eskinOps = new eskinOperations(injectedInto,eskinConfig);

	var returnThis = {
		injectedInto : function getInjectedInto(){return injectedInto.slice(1)/** remove the # from tag**/},
		operations : eskinOps,
		config : eskinConfig,
		/**
		 * Accepts the Model JSON and generates the model object structure and renders it
		 * @param {JSON} modelDataJson
		 * @throws {ValidationError} if non optional params are missing for SBMLModel
		 */
		generate : function generate(modelDataJson){
            var startedAt = new Date();

            if(modelDataJson.constructor.name === 'SBMLModel'){}
			//add this to this modeldata
			//modelData.setData(modelDataJson || {});
			//draw the chart
			eskinOps.initModel(modelDataJson);
			//add compartment
			try{
					eskinOps.addCompartment(modelDataJson.mapCompartmentLayouts['default']);			}
			catch (err) {
				//if(err instanceof ValidationError){
				__logger.error("generate addCompartment : validation failed for default compartment"+err.message);
				//}
			}
			d3.values(modelDataJson.mapCompartmentLayouts)
				.map(function(compartment){
					//TODO Objects may throw errors here for now log them
					//Later there will be notification service to group msgs
					try{
							if(compartment.sId !== 'default')
								eskinOps.addCompartment(compartment);
					}
					catch (err) {
						//if(err instanceof ValidationError){
					  __logger.error("generate addCompartment : validation failed "+err.message);
						//}
					}
				});
			//add species
			//add complex Species first
			d3.values(modelDataJson.mapSpeciesLayouts)
			.filter(function(d){return d.sType === "Complex"})
			.map(function(species){
				try{
					eskinOps.addSpecies(species);
				}
				catch (err) {
					//if(err instanceof ValidationError){
				  __logger.error("generate addCompartment : validation failed "+err.message);
					//}
				}
			});
			//add non complex species later
			d3.values(modelDataJson.mapSpeciesLayouts)
			.filter(function(d){return d.sType !== "Complex"})
			.map(function(species){
				try{
					eskinOps.addSpecies(species);
				}
				catch (err) {
					//if(err instanceof ValidationError){
				  __logger.error("generate addCompartment : validation failed "+err.message);
					//}
				}
			});
			//add reaction
			d3.values(modelDataJson.mapReactionLayouts)
			.map(function(reaction){
				//TODO Objects may throw errors here for now log them
				//Later there will be notification service to group msgs
				try{
					eskinOps.addReaction(reaction);
				}
				catch (err) {
					//if(err instanceof ValidationError){
				  __logger.error("generate addReaction : validation failed "+err.message);
					//}
				}
			});
			//eskinOps.getModel().updateModelBoundaries();
			//clear undoManager
			eskinOps.undoManager.clear();
			eskinOps.fitToScreen();
            var finishedAt  = new Date();
            //$('body').removeClass('waiting');
            //rendering done inform outer listners
            eskinDispatch.rendered();
            console.info('Graph drawn in '+ (finishedAt - startedAt)/1000 + ' seconds.');
		},
		/**
		 * sets the zoom mode for view
		 * @param  {[type]} __mode [description]
		 * @return {[type]}        [description]
		 */
		setPanMode:function(__mode){
	    	eskinOps.setViewMode(__mode);
    },
		/**
		 * refresh the curretn model
		 * @return {[type]} [description]
		 */
		refresh:function(){
				eskinOps.refreshView();
		},
		/**
		 * accepts GEOData from external (outside library sources) adds to SBMLModel via operations
		 * @param  {GEOData} GEOData [description]
		 * @return {[type]}         [description]
		 * @throws {customErrors.ValidationError}
		 */
		loadGEOData:function(GEOData){
			eskinOps.loadGEOData(GEOData);
		}
	}
	//eskinModel.Constructor.prototype = new EventEmitter2();
	d3.rebind(returnThis, eskinDispatch, 'on');

	return  returnThis;
}
