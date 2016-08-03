var expect = chai.expect;

describe('Scomos Selections',function(){
	//data and setting for scomos graoh
	beforeEach(function(){
		var el = document.createElement("div");
		el.id = "sGraph";
		document.body.appendChild(el);
	});
	afterEach(function(){
		d3.select('div#sGraph').remove();
	});
	describe('Constructor',function(){
		var sGraph;
		var scomosSelection;
		beforeEach(function(){
			//create selections object
			sGraph = d3scomos.scomosGraph();
			scomosSelection = sGraph.selections();
		});
		
		it('should create scomos selections object',function(){
			expect(scomosSelection).to.be.defined;
		});
	});
	describe('selection Methods',function(){
		
		var sGraph;
		var scomosSelection;
		beforeEach(function(){
			//create selections object
			sGraph = d3scomos.scomosGraph();
			//draw the graph with test data so we will have elements to add in selections
			sGraph.generate('div#sGraph',testJson);
			scomosSelection = sGraph.selections();
		});
		describe('Method : addSpecies',function(){
			it('should add passed species to selection set',function(){
				var species = d3.select('#sGraph').select('.species-node');
				var key = species.datum().sId;
				scomosSelection.addSpecies(species);
				//verify
				var sel = scomosSelection.getNode(key);
				expect(sel).to.deep.equal(species);
			});
			//NOTE : don't repeat this for each add method instead just add one more check in test 
			it('should mark passed species as last selected',function(){
				var species = d3.select('#sGraph').select('.species-node');
				var key = species.datum().sId;
				scomosSelection.addSpecies(species);
				//verify
				var sel = scomosSelection.getNode(key);
				expect(sel).to.deep.equal(species);
				expect(scomosSelection.getLastSelectedNode()).to.deep.equal(species);
			});
			it('should add subSpecies of complex species',function(){
				var complexSpecies = d3.selectAll('.species-node')
						.filter(function(d){return d.sType === 'COMPLEX'});
				complexSpecies = d3.select(complexSpecies[0][0]);
				var specieInComplex = d3.select('#sGraph')
						.selectAll('.species-node')
						.filter(function(d){return d.sParentComplex === complexSpecies.datum().sId});
				//select complex
				
				specieInComplex = d3.select(specieInComplex[0][0])
				scomosSelection.addSpecies(complexSpecies);
				//verify
				//is complex selected
				expect(scomosSelection.getNode(complexSpecies.datum().sId)).to.deep.equal(complexSpecies);
				//expect child nodes to be part of selection also
				console.log(scomosSelection.getNode(specieInComplex.datum().sId));
				expect(scomosSelection.getNode(specieInComplex.datum().sId).datum()).to.deep.equal(specieInComplex.datum());
				//check last selected
				//expect(scomosSelection.getLastSelectedNode().datum()).to.deep.equal(complexSpecies.datum());
			});
		});
		
		describe('Method : addReaction',function(){
			it('should add passed reaction node to selection set',function(){
				var reactionNode = d3.select('#sGraph').select('.reaction-node');
				var key = reactionNode.datum().sId;
				scomosSelection.addReaction(reactionNode);
				//verify
				var sel = scomosSelection.getNode(key);
				expect(sel).to.deep.equal(reactionNode);
				//check last selected
				expect(scomosSelection.getLastSelectedNode()).to.deep.equal(reactionNode);
			});
			it('should add edges of the reaction node to the selection set',function(){
				
				var reactionNode = d3.select('#sGraph').select('.reaction-node');
				var key = reactionNode.datum().sId;
				scomosSelection.addReaction(reactionNode);
				//verify
				var sel = scomosSelection.getNode(key);
				expect(sel).to.deep.equal(reactionNode);
				//check last selected
				expect(scomosSelection.getLastSelectedNode()).to.deep.equal(reactionNode);
				//vefify if edges are in node
				//find the edge connecting to this reaction node
				var edges = d3.selectAll('.link')
						.filter(function(thisLink){
							var _source = thisLink.source;
							var _target = thisLink.target;
							var thisID = reactionNode.datum().sId;
							return _source.sId === thisID || _target.sId === thisID;
						});
				var edge = d3.select(edges[0][0]);
				var selEdge = scomosSelection.getNode(edge.datum().sId);
				expect(selEdge).to.deep.equal(edge);
			});
		});
		describe('Method: addEdge',function(){
			it('should add individual edge to selected',function(){
				var edge = d3.select('#sGraph').select('.link');
				var key = edge.datum().sId;
				scomosSelection.addEdge(edge);
				//verify
				var sel = scomosSelection.getNode(key);
				expect(sel).to.deep.equal(edge);
				//check last selected
				expect(scomosSelection.getLastSelectedNode()).to.deep.equal(edge);
			});
		});
		describe('Method : addCompartment',function(){
			it('should add compartment and all its children to the selection',function(){
				var compartment = d3.select('#sGraph').selectAll('.compartment ').filter(function(d){return d.sId === 'C_2'});
				//add this compartment to selection
				scomosSelection.addCompartment(compartment);
				//verify
				//check last selected
				//expect(scomosSelection.getLastSelectedNode()).to.deep.equal(compartment);
				//check if inner elements are really selected
				var innerElem = d3.select('#sGraph').selectAll('.species-node').filter(function(d){return d.sParentCompartment === 'C_2'});
				var sel = scomosSelection.getNode(innerElem.datum().sId);
				
				console.log(sel);
				expect(sel.datum()).to.deep.equal(innerElem.datum());
			})
		});
		
		describe('Method : addNode',function(){
			it('should add passed node based on its type',function(){
				var compartment = d3.select('#sGraph').selectAll('.compartment ').filter(function(d){return d.sId === 'C_2'});
				//add this compartment to selection
				scomosSelection.addNode(compartment);
				//verify
				//check last selected
				//expect(scomosSelection.getLastSelectedNode()).to.deep.equal(compartment);
				//check if inner elements are really selected
				var innerElem = d3.select('#sGraph').selectAll('.species-node').filter(function(d){return d.sParentCompartment === 'C_2'});
				var sel = scomosSelection.getNode(innerElem.datum().sId);
				console.log(sel);
				expect(sel.datum()).to.deep.equal(innerElem.datum());
			});
		});
		
		describe('Method : getLastSelected',function(){
			it('should retrieve last selected if multiselect is not enabled',function(){
				var species = d3.select('#sGraph').select('.species-node');
				var key = species.datum().sId;
				scomosSelection.addSpecies(species);
				//verify
				var sel = scomosSelection.getNode(key);
				expect(sel).to.deep.equal(species);
				expect(scomosSelection.getLastSelectedNode()).to.deep.equal(species);
			});
			it('should return null if multiselect is enabled'/*,function(){
				var allSpecies = d3.select('#sGraph').selectAll('.species-node');
				var species1 = d3.select(allSpecies[0][0]);
				var species2 = d3.select(allSpecies[0][1]);
				var key1 = species1.datum().sId;
				var key2 = species2.datum().sId;
				
				scomosSelection.addSpecies(species1);
				//verify
				var sel = scomosSelection.getNode(key1);
				expect(sel).to.deep.equal(species1);
				expect(scomosSelection.getLastSelectedNode()).to.deep.equal(species1);
				//add second species
				scomosSelection.addSpecies(species2);
				//veify
				expect(scomosSelection.getLastSelectedNode()).to.be.null;
			}*/)
		})
		/** selection removal methods **/
		describe('Method : remove species',function(){
			it('should remove the species from selection',function(){
				var species = d3.select('#sGraph').select('.species-node');
				var key = species.datum().sId;
				scomosSelection.addSpecies(species);
				//remove this species based on the key
				var removed = scomosSelection.removeSpecies(key);
				expect(removed.datum()).to.deep.equal(species.datum());
				
				
			});
			it('should remove the child species of complex species if they are not classed as selected',function(){
				var complexSpecies = d3.selectAll('.species-node')
				.filter(function(d){return d.sType === 'COMPLEX'});
				complexSpecies = d3.select(complexSpecies[0][0]);
				var speciesInComplex = d3.select('#sGraph')
						.selectAll('.species-node')
						.filter(function(d){return d.sParentComplex === complexSpecies.datum().sId});
				//select complex
				//var specieInComplex = d3.select(speciesInComplex[0][0])
				scomosSelection.addSpecies(complexSpecies);
				//mark one of the child of this species as marked
				var selected = d3.select(speciesInComplex[0][0]).classed('selected',true);
				var notSelected = d3.select(speciesInComplex[0][1]);
				//remove the complex from selection
				var removed = scomosSelection.removeSpecies(complexSpecies.datum().sId);
				//veify 
				expect(removed.datum()).to.deep.equal(complexSpecies.datum());
				expect(scomosSelection.getNode(complexSpecies)).to.be.null;
				//verify non selected child is also removed
				expect(scomosSelection.getNode(notSelected.datum().sId)).to.be.null;
				//verify that selected species is not removed form selection
				expect(scomosSelection.getNode(selected.datum().sId).datum()).to.deep.equal(selected.datum());
			});
			it('should not remove species from the selection if parent of species allready a part of selection',function(){
				//retain selection if complex or compartment of this species is allready selected
				//select a species with complex
				var complexSpecies = d3.selectAll('.species-node')
				.filter(function(d){return d.sType === 'COMPLEX'});
				var speciesInComplex = d3.select('#sGraph')
						.selectAll('.species-node')
						.filter(function(d){return d.sParentComplex === complexSpecies.datum().sId});
				var specieInComplex = d3.select(speciesInComplex[0][0]);
				var compartment = d3.selectAll('.compartment').filter(function(d){ return d.sId === complexSpecies.datum().sParentCompartment})
				
				var specieInComplex = d3.select('#sGraph')
						.selectAll('.species-node')
						.filter(function(d){return d.sComplex === complexSpecies.datum().sId});
				var species = d3.select(specieInComplex[0][0]);
				//add this to selectin
				//add compartment of this species to selection 
				scomosSelection.addNode(compartment);
				scomosSelection.addNode(complexSpecies);
				scomosSelection.addNode(species);
				//mark this species as selcted
				species.classed('selected',true);
				complexSpecies.classed('selected',true);
				//now remove the species --> it should not be removed from actual selection as its compartment/ complex is selected
				var removed =  scomosSelection.removeSpecies(species.datum().sId);
				//expect(removed).to.be.null;
				expect(scomosSelection.getNode(species.datum().sId).datum()).to.deep.equal(species.datum());
				console.log(scomosSelection.getNode(species.datum().sId));
				
				//now remove the compartment from selection
				scomosSelection.removeCompartment(compartment.datum().sId);
				//expect(scomosSelection.getNode(compartment.datum().sId)).to.be.null;
				
				//try removing species again --> should not remove species as complex is still selected
				var removed =  scomosSelection.removeSpecies(species.datum().sId);
				//expect(removed).to.be.null;
				expect(scomosSelection.getNode(species.datum().sId).datum()).to.deep.equal(species.datum());
			
				//remove complex 
				scomosSelection.removeSpecies(complexSpecies.datum().sId);
				//expect(scomosSelection.getNode(complexSpecies.datum().sId)).to.be.null;
				console.log('complex removed')
				//try removing species again --> should not remove species as complex is still selected
				//remove selection
				species.classed('selected',false);//simulates the mouse event on this species
				//should successFully remove the species this time
				var removed =  scomosSelection.removeSpecies(species.datum().sId);
				expect(removed.datum()).to.deep.equal(species.datum())
				//expect(scomosSelection.getNode(species.datum().sId)).to.be.null;			
			});
		});
		describe('Method : removeReaction',function(){
			//whenever reaction is removed the all its edges are also removed from the selection
			it('should remove reaction node and all its edges',function(){
				//we remove all the edges regardless of the status
				var reactionNode =  d3.select('.reaction-node');
				scomosSelection.addNode(reactionNode);
				//confirm selections
				expect(scomosSelection.getNode(reactionNode.datum().sId)).to.be.object;
				//verify at least one of the edges for this reactin node is selected
				var edges = d3.selectAll('.link')
					.filter(function(thisLink){
						var _source = thisLink.source;
						var _target = thisLink.target;
						var thisID = reactionNode.datum().sId;
						return _source.sId === thisID || _target.sId === thisID;
					});
				var edge = d3.select(edges[0][0]);
				var selEdge = scomosSelection.getNode(edge.datum().sId);
				expect(selEdge).to.deep.equal(edge);
				
				//remove reaction should remove both reaction and the edge
				var removed =  scomosSelection.removeReaction(reactionNode.datum().sId);
				expect(removed.datum()).to.deep.equal(reactionNode.datum());
				//verify removal
				expect(scomosSelection.getNode(reactionNode.datum().sId)).to.null;
				//verify the edge is removed form selection
				expect(scomosSelection.getNode(edge.datum().sId)).to.be.null;
			});
		});
		describe('Method : removeCompartment',function(){
			it('should remove all the unSelected node with this compartment as parent',function(){
				//add a compartment
				var compartment = d3.select('#sGraph').selectAll('.compartment ').filter(function(d){return d.sId === 'C_1'});
				//add this compartment to selection
				scomosSelection.addNode(compartment);
				//verify
				expect(scomosSelection.getNode('C_1').datum()).to.deep.equal(compartment.datum());
				//C_3 is child compartment of this check if it is selected
				expect(scomosSelection.getNode('C_2').datum().sId).to.string('C_2');
				//expect it to have species of C_2 also
				expect(scomosSelection.getNode('S_24').datum().sId).to.string('S_24');
				//remove a compartment
				scomosSelection.removeCompartment(compartment.datum().sId);
				//verify
				expect(scomosSelection.getNode('C_1')).to.be.null;
				//C_3 is child compartment of this check if it is selected
				expect(scomosSelection.getNode('C_2')).to.be.null;
				//expect it to have species of C_2 also
				expect(scomosSelection.getNode('S_24')).to.be.null;
			})
		});
	});
});