/**
tests specific to SBML model object
**/
var expect = chai.expect;

describe("SBMLModel",function(){
	var factory = d3scomos.SBMLFactory();
	describe("constructor ",function(){
		it('should not allow object Creation if empty data is passed',function(){
			expect(function(){factory.getSBMLModel()}).to.throw(Error);
		});
		it('should not allow object creation if non-optional parameter is missing',function(){
			expect(function(){factory.getSBMLModel({sId:""})}).to.throw(Error);
		});
		it('should add default properties that are not specified in options',function(){
			var model = factory.getSBMLModel({sId:"S_1"});
			expect(model.sName).to.equal("S_1");
			expect(model.sOrganismType).to.equal("Homo sapiens");
		});
		it('should have more tests validating defaults')
	});
    describe('Prototype Methods ',function(){
        var model;
        beforeEach(function(){
             model = factory.getSBMLModel({sId:"M_1"});

            // {sId:"S_1",
            //  iHeight: 40,
            //  iWidth: 40,
            //  position: {iX: 557, iY: 126}
            // });
        })
        describe('Method : removeSpecies',function(){
            it('should remove species from mapSpeciesLayout if it exists');
        })
    })
});
