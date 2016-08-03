/**
 * Model data model data api wont be public anymore
 * it is now private to operation and operations will provide convenient wrappers as needed
 *  Most of the code in this module is either copied or re-factored from apiData.js
 *  TODO: the module apiData is supposed to go away after restructuring 
 */

var modelData = function(){
	//ASSUMPTIONS
	// if passed data have a invalid values for def params they will assume the defaults
	//TODO: make this configurable
	var model = null; //must be initialized explicitely by call
	var returnThis = {};
	
	/**
	 * initModel with passed model data
	 * @param {SBMLModel} model
	 */
	returnThis.initModel = function(_model){
		//assumption is we are gettting weMade model form operations
		model = _model;
	}
	/**
	 * adds a molecule to the model data(creates new molecule object)
	 * @param {JSON} moleculeJson containing molecule data
	 * @returns {Molecule} returns a molecule object  
	 */
	returnThis.addSpecies = function addSpecies (moleculeJson){
		//construct molecule 
		//var molecule =
	}
	return returnThis;
}