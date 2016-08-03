var expect = chai.expect;

describe("Class : Species",function(){
	var factory = d3scomos.SBMLFactory();
	describe("constructor",function(){
		it('Should have tests to validate the inheritance chain');
		it('should validate passed params',function(){
			expect(factory.getSpecies).to.throw(TypeError);//no params passed
			expect(function(){factory.getSpecies({sId:""})}).to.throw(Error);
			expect(function(){factory.getSpecies({sId:"S_1"})}).to.throw(Error);

			//passing case
			expect(function(){
				factory.getSpecies(
						{sId:"S_1",
						 iHeight: 40,
						 iWidth: 40,
						 position: {iX: 557, iY: 126}
						});
				}).to.not.throw(Error);
		});
	});
    describe("Methods ",function(){
        var speciesOptions = {sId:"S_1",iHeight: 40,iWidth: 40,position: {iX: 557, iY: 126}}; //valid species creation options
        var species;
        beforeEach(function(){
            species = factory.getSpecies(speciesOptions);
        });
        describe('addEdge',function(){
            it('should add edge only it it is valid edge object',function(){
                expect(species.addEdge).to.throw(Error);
                expect(function(){species.addEdge({})}).throw(Error)
                //create valid edge object
                var reaction  = factory.getReaction({sId:"R_1",iHeight: 40,iWidth: 40,position: {iX: 557, iY: 126}});
                var edge = factory.getEdge(species,reaction,'REACTANT',{});
                expect(function(){species.addEdge(edge)}).to.not.throw(Error)
            })
        });
    });
});
