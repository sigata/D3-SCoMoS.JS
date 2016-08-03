/**
 * eskin clip board module.
 * handles the copying of SBML nodes .
 * Assumptions :
 * 	1) only sbml nodes will be stored.
 * 	2) Only sbml Noes of Species and reaction type will be supported.
 */

/**
 * clipboard module for d3scomos library. ( this is completely privtate module wont be shared outside library.)
 * @param  {[type]} function( [description]
 * @return {clipboard}        instantiates the eskin clipboard module.
 */
var clipboard = (function(){
    /**
     * eskin clipboard data.
     * @type {{specis:[Species],reactions:[Reaction]}}
     */
    var _data = {species:[],reactions:[]};
    var isCopiable = false;
    function triggerClipboardEvent(){
        if(_data.species.length > 0 || _data.reactions.length > 0){
            isCopiable = true;
        }
        eskinDispatch.clipbaordEvent({hasData : isCopiable});
    }
    function getDeepCopyOfClipBoard(){
        var _species = _data.species.map(objectHelper.deepCopyNodeObject);
        var _reactions = _data.reactions.map(objectHelper.deepCopyNodeObject)
        return {species:_species,reactions:_reactions};
    }
    return {
        clear : function(){
            _data = {species:[],reactions:[]};
            triggerClipboardEvent();
        },
        /**
         * stores the provided selection in clipboard.
         * @param  {{species:[Species],Reactions:[Reaction]}} toBeCopied selection that is to be stored in clipboard.
         * @return {}            [description]
         */
        copy : function(toBeCopied){
            //TODO: add vaidations to check if seleciton is in correct format.
            _data = toBeCopied;
            triggerClipboardEvent();
        },
        /**
         * returns copiable collection by applying proper transform
         * @param  {[type]} startAt [description]
         * @return {[type]}         [description]
         */
        paste : function(){
            triggerClipboardEvent();
            return getDeepCopyOfClipBoard();
        },
        triggerClipboardEvent : function(){
            triggerClipboardEvent();
        },
        hasPastables : function(){
            if(_data.species.length > 0 || _data.reactions.length > 0){
                return true;
            }
        }
    }
    })();
