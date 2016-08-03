var expect = chai.expect;

describe("Model Validator",function(){
	function ValidationError(message) {
	    this.name = "ValidationError";
	    this.message = (message || "");
	}
	ValidationError.prototype = Error.prototype;
	var modelValidator = d3scomos.modelValidator;
	describe("Method : validateMolecule",function(){
		it('molecule should have sId,sName,sType,iPosition',function(){
			expect(function(){modelValidator.validateMolecule({})}).to.throw(ValidationError);
			expect(function(){modelValidator.validateMolecule({sId :"s_1"})}).to.throw(ValidationError);
			expect(function(){modelValidator.validateMolecule({sId :"s_1",sName:"sName1"})}).to.throw(ValidationError);
			expect(function(){modelValidator.validateMolecule({sId :"s_1",sName:"sName1",sType:"simplechemical"})}).to.throw(ValidationError);
			
			expect(function(){modelValidator.validateMolecule(
					{sId :"s_1",sName:"sName1",
					 sType:"simplechemical",position:{}})}
					).to.throw(ValidationError);
			expect(function(){modelValidator.validateMolecule(
					{sId :"s_1",sName:"sName1",
					 sType:"simplechemical",position:{}})}
					).to.throw(ValidationError);
			
			var validData = {sId :"s_1",sName:"sName1",sType:"simplechemical",position:{iX:100,iY:200}};
			expect(function(){modelValidator.validateMolecule(validData)}).to.not.throw(ValidationError);
		})
	})
});