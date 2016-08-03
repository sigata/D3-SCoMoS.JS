/**
 * gene Expression overlay module.
 * Deals with :
 * 	1) accepting the gene and there experiment values, cutoff status , and color shades
 * 	2) controlling gene appearance based on their cutoff status.
 * 	3) Creating and applying gradient fill to the said genes.
 * 	4) remembering the user state configurations during redraws
 * 	5) Settings restoration methods
 * 	etc
 */

//--------------------------------
//  -------- Design Assumptions---
//--------------------------------
/**
 * Gene Expression overlay will be the hidden part of the SBML model
 * i.e. will be accessible through the getter mehtods only
 * that way json wont get deformed
 * TODO:Another consideration is that input data format might change ( as it result of exposed API)
 * so there must be provision for external data configuration functions
 */
/**
 * Creates the GEOverlay Object
 * @constructor
 * @param  {{fileHeaderMap:[String],
 *         		 geneData:{'geneName':{
 *         		 			'inPathwayMap':"String",
 *         		 		 	expressionValues:[number]
 *         		 		  	visualData:{
 *         		 						overlayStateList:[overlaystate shortcode:String]
 *         		 										  colorList:[String]
 *         		 					 }
 *         	  			   }
 *         	            }
 *         }} GEOData overlay data produced by the eskin geneOverlay API]
 *@param {{
 *       	'currentExperiment':'expressionValue1',
 *       	'filters':['UR','DR',UA,ND]
 *       	}}
 * @return {[type]}             [description]
 */
var GEOverlay = function(GEOData,GEOConfig){
  /* GEOData format
  {
    "fileHeaderMap": {
      "expressionValue1": "Experiment  1",
      "expressionValue2": "Experiment 2",
      "expressionValue3": "Experiment 3"
    },
    "geneData":{
      "ACE": {
          "expressionValues": [230,21.75232,130],
          "overlayStateList": ["UR","UA","UR","ND"],
          "colorList": ["rbg(255,89,0)","rgb(255, 255, 0)","rbg(255,236,0)"]
      }
    }
}
   */
   var fileHeaderMap = GEOData.fileHeaderMap;
   //TODO : remove -1 once geneName is removed from the header map
   var noOfExperimentConditions = d3.keys(fileHeaderMap).length;//-1 as geneName is not experiment coidtions

   var colorConstants = shapeConstants.gradient;
  /**
   * buildDataSet for this experimentKey
   * @param  {string} experimentKey String header file key handler
   * @return {{'geneName':[expressionvalue,overlayStatus,colorstring]}}       processable array of gene name and Expression values
   */
   function buildDataSet(experimentKey){
     var _expIndex = parseInt(experimentKey.split('Value')[1])-1;
     var returnThis = {};
     Object.keys(GEOData.geneData).forEach(function(geneName){
       var thisGene = GEOData.geneData[geneName];
       if(thisGene.expressionValues.length === 0){
         returnThis[geneName] = [null,'ND',colorConstants.species.firstFill];
       }
       else {
         returnThis[geneName] = [ thisGene.expressionValues[_expIndex],
                  thisGene.overlayStateList[_expIndex],
                  thisGene.colorList[_expIndex]
                ];
       }
     });
    //  GEOData.geneData.forEach(function(geneName){
    //
    //  })
     return returnThis;
   }
   /**
    * returns graient ID stringify
    * @param  overlayStatus
    * @param  color
    * @param  gardientIdString
    * @return {String}      gradient ID to be applied
    */
   function getGradient(overlayStatus,color,gardientIdString){
     var gradientID;
     switch (overlayStatus) {
       case 'UR':
        gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       case 'DR':
         gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       case 'UA':
         gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       case 'ND':
         gradientID = shapeUtil.getGEOGradient(color,colorConstants.GEOverlay.secondFill,gardientIdString);
       break;
       default:
         throw new Error("Unknown overlay status : "+overlayStatus + " UR,DR,UA,ND are only valid values");
     }
     return gradientID;
   }
   /**
    * apply gene experssion data and color to genes(speceis) as per constructed data list-item
    * @param  {{'geneName':[expressionvalue,overlayStatus,colorstring]}}  thisExpData filtered data for curernt experiment
    * @return {}
    */
   function applyGEODataToSpecies(thisExpData){
     d3.selectAll('.species-node')
        //.filter(function(d){return d.sType !== 'COMPLEX'})
        .each(function(d,i){
           //if this d.sName is in thisExpData process
           var thisGene = thisExpData[d.sName.toUpperCase()];
           if(!thisGene)
                thisGene = [null,'ND',colorConstants.species.firstFill]

             var gradIdString = 'geoGrad_'+objectHelper.getStringHash.apply(d.sName);
             var gradientID = getGradient(thisGene[1],thisGene[2],gradIdString);
             d.overlayStatus(thisGene[1]);
             //apply gradient string
             d3.select(this).select('.species-path').attr('fill','url(#'+gradientID+')');
         })
   }
   /**
    * updates the gene Color based on new data and filter values
    * @return {[type]} [description]
    */
   function _updateGEOData(){
     var dataSet = buildDataSet(GEOConfig.currentExperiment);
    // console.info(dataSet);
     d3.selectAll('.species-node')
        //.filter(function(d){return d.sType !== 'COMPLEX'})
        .each(function(d,i){
           //if this d.sName is in thisExpData process
           var thisSpecies = d3.select(this);
           var thisGene = dataSet[d.sName.toUpperCase()];
           if(!thisGene )
             thisGene = [null,'ND',colorConstants.species.firstFill];
          //bind overlayStatus to species
           d.overlayStatus(thisGene[1]);
           // is this gene fitered out
           var isFiltered = GEOConfig.filters.indexOf(thisGene[1]) !== -1;
           //add remove disabled class accordingly
           thisSpecies.classed('disabled-node',isFiltered);
           var colr1 = isFiltered?shapeConstants.gradient.GEOverlay.disabledFill:thisGene[2];
           var colr2 = isFiltered?shapeConstants.gradient.GEOverlay.disabledFill:thisGene[2];
           var colr3 = isFiltered?shapeConstants.gradient.GEOverlay.disabledFill:shapeConstants.gradient.GEOverlay.secondFill;
           var gradIdString = '#geoGrad_' + objectHelper.getStringHash.apply(d.sName);
           //d3.select(gradIdString).select("stop")
           d3.select(gradIdString+' > stop:nth-child(1)')
              .transition()
              .attr("stop-color", colr1);
          d3.select(gradIdString+' > stop:nth-child(2)')
             .transition()
             .attr("stop-color", colr2);
         d3.select(gradIdString+' > stop:nth-child(3)')
            .transition()
            .attr("stop-color", colr3);
       })
       //update reaction colors accordingly
       updateReactionNodes();
   }

/**
 * helper functin for update edges
 * @param {Reaction} reaction reaction of which edges are to be updated for GEOverlay
 * @param {Boolean} isDisabled is this reaction node disabled
 * @return {} colors edges with there valid styles ignoring overlay status
 */
function colorReactionEdges(reaction,isDisabled,connectedSPecies_OVStatus){
  //make the edge follow fill style of reaction
   /**
    * sIds of all the edges of this reaction
    * @return {[String]}
    */
    var allReactionEdges = reaction.datum()
                      .getAllEdges()
                      .map(function(d){return d.sId});

   	var allLinks = d3.selectAll('.link')
          .filter(function(d){ return allReactionEdges.indexOf(d.sId) !== -1 });
    var markerPostFix = isDisabled == true?'_disabled':'';
    allLinks.attr("style", function(d){
      var marker;
      var colorString = isDisabled == true?colorConstants.GEOverlay.disabledFill : d.getColorString();
      /** handle this situation to activate edges partially **/
      if(!isDisabled){
        var species ;
        if(d.source.constructor.name === 'Species')
          species = d.source
        else
          species = d.target
        var isFiltered = GEOConfig.filters.indexOf(connectedSPecies_OVStatus[species.sId]) !== -1;
        if(isFiltered){
          colorString = colorConstants.GEOverlay.disabledFill;
          markerPostFix = '_disabled';
        }

      }
      switch(d.role){
        case "REACTANT":
          if(d.reversible) marker = "marker-mid:url(#filledArrow"+markerPostFix+");";
          else marker = "";//no arrow marker for this one
        break;
        case "PRODUCT":
          marker = "marker-mid:url(#filledArrow"+markerPostFix+");";
        break;
        case "MODIFIER":
          if(d.sModifierType === 'Inhibitor')
            marker = "marker-mid:url(#Line"+markerPostFix+");";
          else //defaults ot activator
            marker = "marker-mid:url(#hollowArrow"+markerPostFix+");";
          break;
        default:
          marker = "";
    }

    return marker+" stroke:"+ colorString +";";
  })
}
/**
 * find all the reaction node and apply the disabledFill.
 * @return {[type]} [description]
 */
var updateReactionNodes = function(){
  var allReactions = d3.selectAll('.reaction-node');
  var allSpeceis_OVstatus = {};
  d3.selectAll('.species-node')
    .each(function(d){
      allSpeceis_OVstatus[d.sId] = d.overlayStatus();
    });
  allReactions.each(function(d){
     var thisReaction = d3.select(this);
     var connectedSpecies = thisReaction.datum().getAllConnectedSpeciesId();
     var connectedSPecies_OVStatus ={};
     connectedSpecies.map(function(d){connectedSPecies_OVStatus[d] = allSpeceis_OVstatus[d]});

     var disableReaction = true;
     for(var index in connectedSpecies){
       //reactionFill_disabled
        if(GEOConfig.filters.indexOf(allSpeceis_OVstatus[connectedSpecies[index]]) == -1){
            disableReaction = false;
            break;
        }
    }
    //update reaction_border baseed on filter status
   thisReaction.classed('disabled-node',disableReaction);
   var currentFill =  thisReaction.select('path').attr('fill');
    if(disableReaction) {
       //change fill only if required
       if(currentFill !== 'url(#reactionFill_disabled)'){
          thisReaction.select('path').attr('fill','url(#reactionFill_disabled)');
       }
    }
    else{
       if(currentFill == 'url(#reactionFill_disabled)'){
         thisReaction.select('path').attr('fill',function(d){return shapeUtil.getReactionFill(d.sType)});
       }
    }
    //update edges of this reaction
    colorReactionEdges(thisReaction,disableReaction,connectedSPecies_OVStatus);
  });
}
/**
 * bootstraps the first GEORun
 * @return {[type]} [description]
 */
 var bootstrap = function(){
   applyGEODataToSpecies(buildDataSet(GEOConfig.currentExperiment));
   _updateGEOData();
 }
 //start GEO process
 bootstrap();
//TODO : add handler methods
 return {
   /**
    * Updates the data and GEO config used to draw GEOverlay. ALso animates the color change
    * @param  {{geneName:overlayStatus}} GEOData   GEOverlay data-
    * @param  {{currentExperiment:String}} GEOConfig GEOConfig data-
    * @return {}           changes the color and animates the change
    */
   updateGEOData:function(_GEOData,_GEOConfig){
     //update the GEO data if valid new data is passed
     //or retain previous values
     GEOData = _GEOData || GEOData
     GEOConfig = _GEOConfig || GEOConfig
     _updateGEOData();
     //bootstrap();
   }
 };
}
