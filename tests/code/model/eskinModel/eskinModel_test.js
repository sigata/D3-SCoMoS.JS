/** contains test for the e-skin model module **/
var expect = chai.expect;

describe("eskinModel",function(){
	//var testData = testHelper.testData;
	describe("constructor",function(){
		it('Should accept injectInto element(div)',function(){
			var sModel = new d3scomos.eskinModel("myModel");
			expect(sModel).to.be.defined;
		});

		it('should return valid eskinModelObject',function(){
			var sModel = new d3scomos.eskinModel("myModel");
			expect(sModel).to.be.defined;
			expect(sModel.injectedInto()).to.equal("myModel");
			//test for default condition
			expect(new d3scomos.eskinModel().injectedInto()).to.equal("eskinModel");
		});
		it('should accept optional config object',function(){
			var eModel = d3scomos.eskinModel("myModel",{height:"500px"});
			var config = eModel.config;
			expect(config.height).to.equal("500px");
		});
	});

	describe('Function : generate',function(){
		it('should throw validation error for invalid json',function(){
			var sModel = new d3scomos.eskinModel();
			//if model data is missing throws error
			expect(sModel.generate).to.throw(Error);
			expect(function(){sModel.generate({sId:"M_1"})}).to.not.throw(Error);
		});
		//most of the part of drawing operation and its correctness will be tested in 
			//operations module. Perform only preliminary tests here
		it('should draw the graph according to modeldata');
	})
	describe('Property : operations',function(){
		//innerworking of object operation will be tested in operation module.
		//this test only ensures that it is exposed from eskin model object.
		//in turn making it testable
		it('should expose operations property',function(){
			var sModel = new d3scomos.eskinModel("myModel");
			var ops = sModel.operations;
			expect(ops).to.not.undefined;
		});
	});
});