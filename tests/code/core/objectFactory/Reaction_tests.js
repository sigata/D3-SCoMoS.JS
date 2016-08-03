var expect = chai.expect;

describe("Class : reactions",function(){
	var factory = d3scomos.SBMLFactory();
	describe("constructor",function(){
		it('Should have tests to validate the inheritance chain');
		it('should validate passed params',function(){
			expect(factory.getReaction).to.throw(TypeError);//no params passed
			expect(function(){factory.getReaction({sId:""})}).to.throw(Error);
			expect(function(){factory.getReaction({sId:"S_1"})}).to.throw(Error);
			//passing case
			expect(function(){
				factory.getReaction(
						{sId:"S_1",
						 iHeight: 40,
						 iWidth: 40,
						 position: {iX: 557, iY: 126}
						});
				}).to.not.throw(Error);
			});
      it('should have tests verifying values passed in options(init values)');
      it('should have tests verifying the defauls');
		});
describe("Methods",function(){
		var model;
		beforeEach(function(){
			var el = document.createElement("div");
				el.id = "myModel";
				document.body.appendChild(el);
			//before each test redraw the model with production JSON
			sModel =  d3scomos.eskinModel("myModel");
			//console.info(sModel);
			sModel.generate(testJson);
			model = sModel.operations.getModel();
			d3.select("#myModel").remove();
			console.log(model);
		});
		describe("Edge processing methods",function(){
			describe("Method:getReactantEdges",function(){
					it('should have tests')
			});
			describe("Method:getProductEdges",function(){
				it('should have tests')
			});
			describe("Method:getModifierEdges",function(){
				it('should have tests')
			});
			describe("Method:getAllEdges",function(){
				it('should have tests')
			});
		})
	});
});
