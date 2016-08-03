/**
* this file holds the common code snippets
* some declarations etc that needs to be shared across files
* and can be shared without breaking the design
**/

var eskinDispatch = d3.dispatch('speciesHover','speciesClick',
              'reactionHover','reactionClick',
              'linkHover','linkClick',
              'compartmentHover','compartmentClick','canvasClick',
              'covalentModificationClick','toolStateChanged',
              'undoManagerEvent','constructionError','clipbaordEvent','selectionEvent',
              'nodeDeleted','rendered');


var ed = d3.dispatch('speciesHover','speciesClick',
              'reactionHover','reactionClick',
              'linkHover','linkClick',
              'compartmentHover','compartmentClick',
              'covalentModificationClick');
