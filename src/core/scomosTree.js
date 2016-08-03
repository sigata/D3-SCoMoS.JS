'use strict'
/**
 * scomosTree : Generic tree implementation
 */

/**
 * Creates instance of the scomosTree
 * @constructor
 * @this scomosTree
 * @param {string} rootNode string value of root node if not passed uses 'default' string
 */
var scomosTree = d3scomos.scomosTree = function scomosTree(rootNode){
	/**
	 * node structure to store tree nodes
	 * @class treeNode
	 * @Constructor
	 * @param {string} node.value
	 * @returns a tree node with node.value set and empty list of children
	 */
	function treeNode(value)
	{
		this.val = value;
		/**{[treeNode]}**/
		this.children = [];
		
		//add handling methods
		treeNode.prototype.getValue = function getValue(){
			return this.val;
		}
		//add children
		/**
		 * adds treeNode as children to this node
		 * @param {[treeNode]} array of treeNode
		 */
		treeNode.prototype.addChild = function addChild(treeNode){
				if(treeNodes)
					this.children.push(treeNodes);
		}
		/** removes passed treeNode if exists in children
		 * @param {treeNode} treeNode object to be removed
		 * @returns this treeNode if successful deletion else null
		 */
		treeNode.prototype.removeChild = function removeChild(treeNode)
		{
			return arrayUtil.removeElement(this.children, treeNode);
		}
	}
	
	//init some defaults
	rootNode = rootNode || 'default';
	//tree node internals
	var __root = new treeNode(rootNode);
	var __length = 1;
	
	//internal functions
	/**
	 * will traverse the tree in preOrder and will return
	 * @returns level Traversed array
	 */
	function __traverseBFS(){
		//init empty queue
		var q = [];
		var visited  = [];
		//visit root
		visited.push(__root);
		//add root to queue;
		q.push(__root);
		
		while(q.length !==0 ){
			var thisNode = q.shift();//retrieve front of the queue
			//visit thisNode
			visited.push(thisNode);
			//add its children to queue
			thisNode.children.forEach(function(node) {
				q.push(node);
			});
		}
		return visited;
	}
	
	/**
	 * find in level Traverse
	 * @param {array} array of traversed tree nodes
	 * @returns {Number} index found at or -1 if ot found
	 */
	function __findNodeInArray(needle,traversedArray){
		var foundAt = -1;
		for(var i in traversedArray){
			if(traversedArray[i].val === needle){
				foundAt = i;
				break;
			}
		}
		return foundAt;
	}
	/** export this object **/
	var scomosTree = {};
	
	/**
	 * return the reference of the root element
	 * @returns {treeNode} returns the treeNode object
	 */
	
	scomosTree.getRoot = function getRoot(){
		return __root;
	}
	
	/**
	 * appends the newNode to parentNode
	 * @param {string}  newNodeVal value to create new Node with
	 * @param {string}  value of parent node to add to tree if null add to __root
	 */
	scomosTree.addNode = function addNode(newNodeVal,parentVal){
		//set parentNode to point to root
		parentVal = parentVal || __root.val;
		//add new node
		var newNode = new treeNode(newNodeVal);
		//traverse tree and add node if found match
		scomosTree.findNode(parentVal, function(node){console.log("adding child to");console.log(node);node.children.push(newNode)});
		__length +=1;
	}
	
	/**
	 * traverses the tree to find node applies passed function on the found node
	 * @param {String} needle node value to be searched in tree
	 * @param {Function} fn function to applied on found elem
	 * @returns {treeNode} returns the found element after applying the passed function or undefined
	 */
	scomosTree.findNode = function findNode(needle,fn)
	{
		//TODO make it better we are traversing the whole tree
		var levelNodes = __traverseBFS();
		var index = __findNodeInArray(needle, levelNodes);
		
		console.log("found the at index "+index )
		if(objectHelper.isFunction(fn)){
			//apply function
			fn(levelNodes[index]);
		}
		return levelNodes[index];
	}
	/** return scomos tree object **/
	return scomosTree;
}