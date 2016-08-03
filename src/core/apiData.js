/** d3scomos modeldata handling apis 
 * Creates various lists and provides setters and getters to access model data
 * @constructor
 * @param modelData {object} valid scomos model json
 **/
     
  function ModelDataApi (__modelData) {
	/** private holds data for current graph **/
	  var __speciesList,
	  	__compartmentList,
	 	__reactionList,
	 	__productList,
	 	__reactantList;
	  
	  var __graphHeight, __graphWidth;
	  
	 if(__modelData)	 
		 __initLists();
	
	/**
	 * process the __modelData to initialize various lists
	 * 
	 * @param 
	 * @returns
	 * 
	 */
	function __initLists()
	{
		__speciesList = {}, 
		__compartmentList = {},
	 	__reactionList = {},
	 	__productList = {},
	 	__reactantList = {};
		//before initializing lists validate data
		//TODO : should log any discrepancies found in the data while validating
		/** validate compartment : init compartments parent propety **/
		modelValidator.setComptParents(__modelData.mapCompartmentLayouts);
		/** set parents of reaction nodes **/
		//TODO refactor these ad hoc model changes to another function
		modelValidator.setReactionParents(__modelData.mapReactionLayouts, __modelData.mapCompartmentLayouts);
		//create __speciesList
		var speciesData = __modelData.mapSpeciesLayouts;
		__speciesList = arrayUtil.objectToArray(speciesData);
		
		var compartmentsData = __modelData.mapCompartmentLayouts;
		__compartmentList = arrayUtil.objectToArray(compartmentsData);
		
		var reactionsList = __modelData.mapReactionLayouts;
		__reactionList = arrayUtil.objectToArray(reactionsList);
		
		//set height and width from default compartment
		updateHeightWidth();
	}
	
	/** gets height and width form default compartment **/
	function updateHeightWidth()
	{
		var defaultCompartment = __modelData.mapCompartmentLayouts["default"];
		
		//if there is no default compartment
		//take extreme boundary points and use them
		
		/**
		 * TODO : until we figure out better way this is dirty hack
		 * 
		 */
		if(!defaultCompartment){
			//add defualt compartment
			var defCompart = {};
			var boundaryPoints = this.getBoundaryPoints();
			defCompart["position"]["iPostionX"] = boundaryPoints.xNeg;
			defCompart["position"]["iPostionY"] = boundaryPoints.yNeg;
			
			defCompart.iWidth = boundaryPoints.xPos - boundaryPoints.xNeg;
			defCompart.iWidth = boundaryPoints.yPos - boundaryPoints.yNeg;
			//add this to default list
			__modelData.mapCompartmentLayouts["default"] = defCompart;
			//reinit defCompart
			defaultCompartment = __modelData.mapCompartmentLayouts["default"];
		}
		else{
			__graphHeight = defaultCompartment.iHeight;
			__graphWidth = defaultCompartment.iWidth;
			}
	}
	/** exports this **/
	var dataApi ={};
	/**
	 * updates current modelData with the passed data
	 * and updates dependent lists
	 */
	dataApi.setData = function(modelData)
	{
		__modelData = modelData;
		//update lists with new Data
		__initLists();
	}
	
	/**
	 * get modeldata
	 * @returns {object} a model data
	 */
	dataApi.getModelData =function()
	{
		return __modelData;
	}
	dataApi.getSpeciesList = function() {
		return __speciesList;
	};
	
	dataApi.getCompartmentList = function(){
		return __compartmentList;
	};
	
	dataApi.getReactionList = function(){
		return __reactionList;
	};
	
	dataApi.getHeight = function()
	{
		return __graphHeight;
	}
	dataApi.getWidth = function()
	{
		return __graphWidth;
	}
	//TODO add tests for these functions
	
	dataApi.getBoundaryPoints = function()
	{
		var _xPos = 0,_xNeg = 0,_yPos = 0,_yNeg = 0;
		
		for(var s in __speciesList)
			{
			  var curr = __speciesList[s];
			  
			  if(curr.position.iX>0)
				  _xPos = curr.position.iX > _xPos ? curr.position.iX:_xPos;
			  else
			  {
				  _xNeg = curr.position.iX < _xNeg ? curr.position.iX:_xNeg;
			  }
			  
			  if(curr.position.iY>0)
				  _yPos = curr.position.iY > _yPos ? curr.position.iY:_yPos;
			  else
			  {
				  _yNeg = curr.position.iY < _yNeg ? curr.position.iY:_yNeg;
			  }
			}
		//do this for compartments
		for(var cId in __compartmentList)
		{	
		  var curr = __compartmentList[cId];
		  
		  if(curr.position.iX>0)
			  _xPos = curr.position.iX > _xPos ? curr.position.iX:_xPos;
		  else
		  {
			  _xNeg = curr.position.iX < _xNeg ? curr.position.iX:_xNeg;
		  }
		  
		  if(curr.position.iY>0)
			  _yPos = curr.position.iY > _yPos ? curr.position.iY:_yPos;
		  else
		  {
			  _yNeg = curr.position.iY < _yNeg ? curr.position.iY:_yNeg;
		  }
		}
		/*var extremeXs ={xPos:,xNeg:};
		var extremeYs ={yPos:,yNeg:};*/
		return {xPos:_xPos,xNeg:_xNeg,yPos:_yPos,yNeg:_yNeg};
	}
	dataApi.getModelStats = function()
	{
		return {species : __speciesList.length,
				reactions : __reactionList.length,
				edges : d3.selectAll('.link')[0].length,/* because we are not tracking edge count*/
				compartments : __compartmentList.length
			};
	}
	
	dataApi.updateAllParents = function updateAllParents(updateSpecies){
		updateSpecies = updateSpecies || false;
		//before initializing lists validate data
		//TODO : should log any discrepancies found in the data while validating
		/** validate compartment : init compartments parent propety **/
		modelValidator.setComptParents(__modelData.mapCompartmentLayouts);
		/** set parents of reaction nodes **/
		//TODO refactor these ad hoc model changes to another function
		modelValidator.setReactionParents(__modelData.mapReactionLayouts, __modelData.mapCompartmentLayouts);
		//update species 
		//__modelData.mapSpeciesLayouts.forEach(function)/
		if(updateSpecies){
			for(var sId in __modelData.mapSpeciesLayouts){
				modelValidator.updateSpeciesParents(__modelData.mapCompartmentLayouts,__modelData.mapSpeciesLayouts,__modelData.mapSpeciesLayouts[sId]);
			}
		}
	}
	/**
	 * store scomos selection object in model json to maintain states on redraw
	 * @param {scomosSelection} selection
	 */
	dataApi.storeScomosSelection = function(selection){
		var scomosData = __modelData['scomosData'] = __modelData['scomosData'] ||  {};
		scomosData['selection'] = selection;
	}
	dataApi.getScomosSelection = function(){
		var scomosData = __modelData['scomosData']
		if(scomosData)
			return scomosData['selection'];
		return null;
	}
	dataApi.storeZoom = function(zoomString){
		var scomosData = __modelData['scomosData'] = __modelData['scomosData'] ||  {};
		scomosData['zoomString'] = zoomString;
	}
	dataApi.getZoom = function(){
		var scomosData = __modelData['scomosData']
		if(scomosData)
			return scomosData['zoomString'];
		return null;
	}
	dataApi.setOnetime = function(oneTime){
		var scomosData = __modelData['scomosData'] = __modelData['scomosData'] ||  {};
		scomosData['oneTime'] = oneTime;
	}
	dataApi.getOnetime = function(){
		var scomosData = __modelData['scomosData']
		if(scomosData)
			if (scomosData['oneTime'] === undefined)
				{
				scomosData['oneTime'] = true;
				}
			return scomosData['oneTime']
		return null;
	}
	
	/** export dataModelAPIs **/
	return dataApi;
};