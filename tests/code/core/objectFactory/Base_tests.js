var expect = chai.expect;

describe('Class : Base',function(){
	var factory = d3scomos.SBMLFactory();
	describe('Constructor',function(){
		it('should validate passed params',function(){
			//var baseObj = factory.getBase();
			expect(factory.getBase).to.throw(TypeError);//no params passed
			expect(function(){factory.getBase({sId:""})}).to.throw(Error);
			expect(function(){factory.getBase({sId:"S_1"})}).to.throw(Error);
			//no need to test all validations here as they will be tested in model validator 
			
			//passing case 
			expect(function(){
					factory.getBase(
							{sId:"S_1",
							 iHeight: 40,
							 iWidth: 40,
							 position: {iX: 557, iY: 126}
							})
					}).to.not.throw(Error);
		});
		it('should add missing default params if any',function(){
			var baseObj = factory.getBase(
							{sId:"S_1",
							 sName:"testName",
							 iHeight: 40,
							 iWidth: 40,
							 position: {iX: 557, iY: 126}
							});
			//if optional value passed it will be used
			expect(baseObj.sName).to.equal("testName");
			//default compartment 
			expect(baseObj.sParentCompartment).to.equal("default");
		});
	})
})