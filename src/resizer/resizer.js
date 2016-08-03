
/**
 * creates the resizer object
 * @return {Objects}         resizer object with Various helper methods.
 */
var resizer = d3scomos.resizer = (function(){
    /**
     * return the resize handle
     * @return {[type]} [description]
     */
     var dragSE = d3.behavior.drag()
        //.origin(Object)
        .on("dragstart",dragSEStart)
        .on("drag", dragSE)
        .on("dragend",dragSEEnd);
    var dragSEStart = function(d){
        d3.event.sourceEvent.stopPropagation();
        //console.warn('drag SE Started');
    }
    var dragSE = function(d){
        d3.event.stopPropagation();
        //console.warn('dragging SE');
        var thisNode = this;
        if(d3.event.dx  && d3.event.dy ){
            thisNode.attr('x', parseFloat(thisNode.attr('x')) + d3.event.dx);
            thisNode.attr('y',parseFlaot(thisNode.attr('y'))+d3.event.dy);
        }

    }
    var dragSEEnd = function(d){
        //console.warn('drag se eneded');
    }
    /**
     * Sets up the resizer around provided node.
     * @param  {D3 selector} node        d3 selector pointing node.
     * @param  {Number} resizerType resizer type value 0- 4 point ,1-8 point.
     * @return {}     sets up the resizer UI with provided settings.
     */
    var setupResizer = function (node,resizerType){
        //add group elem to the node with reisizer classed
        //add respective rects
        //add proper classes to these
        resizerType = resizerType || 0;
        var nodeData = node.datum();
        var rDimensions = node.select('path').node().getBBox();
        //console.warn(node.select('path').node().getBBox())
        var nodeH = rDimensions.height;
        var nodeW = rDimensions.width;
        var h = 7;
        var w = 7;
        //var resizerG = node.append('g').classed('resizer',true)
        //add NW
        var NWRect = node.append('rect').classed('resizer',true).classed('rNW',true)
                            .attr('x',-w).attr('y',-h)
                            .attr('height',h).attr('width',w);
        //add NE
        var NERect = node.append('rect').classed('resizer',true).classed('rNE',true)
                            .attr('x',nodeW).attr('y',-h)
                            .attr('height',h).attr('width',w);
        //add SE
        var SERect = node.append('rect').classed('resizer',true).classed('rSE',true)
                            .attr('x',nodeW).attr('y',nodeH)
                            .attr('height',h).attr('width',w);
        //add SW
        var SWRect = node.append('rect').classed('resizer',true).classed('rSW',true)
                            .attr('x',-w).attr('y',nodeH)
                            .attr('height',h).attr('width',w);
        if(resizerType == 1){
            var NRect = node.append('rect').classed('resizer',true).classed('rN',true)
                                .attr('x',nodeW/2).attr('y',-h)
                                .attr('height',h).attr('width',w);

            var ERect = node.append('rect').classed('resizer',true).classed('rE',true)
                                .attr('x',nodeW).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);

            var SRect = node.append('rect').classed('resizer',true).classed('rS',true)
                                .attr('x',nodeW/2).attr('y',nodeH)
                                .attr('height',h).attr('width',w);

            var WRect = node.append('rect').classed('resizer',true).classed('rW',true)
                                .attr('x',-w).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);
        }
    }
    /**
     * update resize handlers
     * @param  {D3 Selector} node d3 selector with resizer attached to it.
     * @return {}      updates the resizer based on the nwe sise data.
     */
    var updateResizer = function(node){

        if(!node)
            node = d3.select('.resizer');

        var nodeData = node.datum();
        var rDimensions = node.select('path').node().getBBox();
        //console.warn(node.select('path').node().getBBox())
        var nodeH = rDimensions.height;
        var nodeW = rDimensions.width;
        var h = 7;
        var w = 7;
        node.each(function(){
            var NWRect = node.select('.rNW')
                                .attr('x',-w).attr('y',-h)
                                .attr('height',h).attr('width',w);
            var NERect = node.select('.rNE')
                                .attr('x',nodeW).attr('y',-h)
                                .attr('height',h).attr('width',w);
            var SERect = node.select('.rSE')
                                .attr('x',nodeW).attr('y',nodeH)
                                .attr('height',h).attr('width',w);
            var SWRect = node.select('.rSW')
                                .attr('x',-w).attr('y',nodeH)
                                .attr('height',h).attr('width',w);

            var NRect = node.select('.rN')
                                .attr('x',nodeW/2).attr('y',-h)
                                .attr('height',h).attr('width',w);

            var ERect = node.select('.rE')
                                .attr('x',nodeW).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);

            var SRect = node.select('.rS')
                                .attr('x',nodeW/2).attr('y',nodeH)
                                .attr('height',h).attr('width',w);

            var WRect = node.select('.rW')
                                .attr('x',-w).attr('y',nodeH/2)
                                .attr('height',h).attr('width',w);
        })
    }
    /**
     * resizes the current shape based on the resizeStatus vlaues.
     * @param  {
     *         isResizing:Boolean ,activeResizeHandle:String,
     *         node:{D3 selector},
     *         event:{D3 drag event}}; resizeStatus params required to process this resize event
     * @return {}             handles the drag shape resize and redraw, transform etc for both
     *                        node shape and resize handlers
     */
    var processResize = function(resizeStatus){
        var thisNode = resizeStatus.node;
        var thisData = thisNode.datum();
        var event = resizeStatus.event;
        var aspectRatio = thisData.iWidth / thisData.iHeight;

        if(resizeStatus.activeResizeHandle === 'rN'){
            var oldHeight = thisData.iHeight;
            thisData.iHeight    -=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;

            thisData.position.iY -= thisData.iHeight - oldHeight;
        }
        else if(resizeStatus.activeResizeHandle === 'rE'){
            thisData.iWidth    +=  event.dx;
            if(thisData.iWidth < 10 ) thisData.iWidth = 10;
        }
        else if(resizeStatus.activeResizeHandle === 'rS'){
            thisData.iHeight    +=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
        }
        else if(resizeStatus.activeResizeHandle === 'rW'){
            var oldWidth = thisData.iWidth;
            thisData.iWidth    -=  event.dx;
            if(thisData.iWidth < 10 ) thisData.iWidth = 10;

            thisData.position.iX -= thisData.iWidth - oldWidth;
        }
        else if(resizeStatus.activeResizeHandle === 'rNE'){
            //rule width follows height
            thisData.iHeight    -=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;
            //thisData.position.iX += event.dx;
            thisData.position.iY += event.dy;
        }
        else if(resizeStatus.activeResizeHandle === 'rSE'){
            //rule width follows height
            thisData.iHeight    +=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;
            //thisData.position.iX += event.dx;
            //thisData.position.iY += event.dy;
        }
        else if(resizeStatus.activeResizeHandle === 'rSW'){
            //rule width follows height
            var oldWidth = thisData.iWidth;
            thisData.iHeight    +=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;

            thisData.position.iX += oldWidth - thisData.iWidth;
            //thisData.position.iY += event.dy;
        }
        else if(resizeStatus.activeResizeHandle === 'rNW'){
            //rule width follows height
            var oldWidth = thisData.iWidth;
            thisData.iHeight    -=  event.dy;
            if(thisData.iHeight < 10 ) thisData.iHeight = 10;
            thisData.iWidth     =   thisData.iHeight * aspectRatio;

            thisData.position.iX -= thisData.iWidth - oldWidth;
            thisData.position.iY += event.dy;
        }

        modelHelper.updateNodeView(thisNode)
        updateResizer(thisNode);
        //update affecting links
        d3.selectAll('.link').attr('d', function(d){return shapeUtil.getPathCoordsForLine(d.source, d.target, d.role)});

    }
    /**
     * Finds removes any resizers on from the page
     * @return {D3 selection} selection of deleted resizers
     */
    var clearAllResizers = function(){
        return d3.selectAll('.resizer').remove();
    }
    return {
        /**
         * adds the resizer to the passed in node.
         * @param  {D3 selector} node vaid d3 selector to the target node.
         * @return {D3 selector} d3 selector pointing to this node.
         * @throws {Error} if invalid node is passed
         */
        addResizer:function(node){
            //console.warn(node);
            if(!node)
                throw new Error('Empty node value passed');
            if(! (node instanceof d3.selection))
                throw new Error('Pass valid d3 Selector');
            if(node.size() == 0)
                throw new Error('Empty d3 selctor passed');
            //remove resizers if any
            clearAllResizers();
            //construct resizer rects assuming
            if(node.datum().getEntityType() === 'Compartment')
                setupResizer(node,1);
            else
                setupResizer(node);
        },
        // /**
        //  * finds and updates all resizer handlers or only node if node is passed
        //  * @param  {D3 Selector} node d3 selector with resizer attached to it.
        //  * @return {}      updates the resizer based on the nwe sise data.
        //  */
        // updateResizer:function(node){
        //     updateResizer(node);
        // },
        /**
         * resizes the current shape based on the resizeStatus vlaues.
         * @param  {
         *         isResizing:Boolean ,activeResizeHandle:String,
         *         node:{D3 selector},
         *         event:{D3 drag event}}; resizeStatus params required to process this resize event
         * @return {[type]}              [description]
         * //NOTE: no need to rest this method seperately as this will be called internally by the
         * 			drag method, as resize and drag behaviours are now triggered from same handler
         */
        processResize:function(resizeStatus){
            //process this reszie if true resize
            //maybe validate resizeStatus params
            //TODO: add param validation here
            if(resizeStatus.isResizing == true){
                processResize(resizeStatus);
            }
        },
        /**
         * clears any resizer on the current page unless node is passed.
         * @return {D3 selector} d3 selector pointing to this node.
         */
        clearResizer:function(){
            return d3.selectAll('.resizer').remove();
        },
        /**
         * updates the resizer hanldes by readding them on selected node.
         * @return {} checks if only one node is selected and adds the resizer hanldes.
         */
        updateResizer:function(){
            this.clearResizer();
            var _selection = d3.selectAll('.selected');
            //proceed if only one item is selcted
            if ( _selection.size() == 1 && !_selection.classed('reaction-node') && !_selection.classed('link')){
                this.addResizer(_selection);
            }
        }
    }
})();
