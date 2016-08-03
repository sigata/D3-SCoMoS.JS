// all resizer constants shall go here

//TODO : constants are private. Should they be made public?
var  resizerConstants = {};
resizerConstants.handleHeight   = 7;
resizerConstants.handleWidth    = 7;

resizerConstants.minHeight = 14; // height of resized object shall not be less that this

//this tells what type of resizer for what type of node
//entries can be used to also enable disable the resizers
resizerConstants.typeAssociations = {'fourPoint' : ['speceis-node'],
                                     'eightPoint' : ['compartment']
                                    }
