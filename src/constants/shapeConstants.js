/** various constants for use within the custom library **/

/**
 * shape constants : JSON defines various shape drawing/ behavior specific constants
 */
var shapeConstants = d3scomos.shapeConstants = {};
    // constants to be used in the custom symbol drawing
    shapeConstants.GENERIC_PROTIEN_RECT_ROUNDNESS_FACTOR = 0.2;
    shapeConstants.SPECIES_SHAPE_OFFSET = 0.2;

    // constants for gene overlay gradient
    shapeConstants.gradient             = {}
    shapeConstants.gradient.species     = {firstFill:"rgb(255,255,255)",
                                            secondFill:'rgb(51, 33, 161)',
                                         };
     shapeConstants.gradient.GEOverlay  ={
                                          secondFill:'rgb(51, 33, 161)',
                                          disabledFill:'rgb(229, 229, 229)',
                                         }
