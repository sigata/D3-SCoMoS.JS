/** contains test for the e-skin_model operations module **/
var expect = chai.expect;

describe("eskinModel_Operations",function(){

	describe("constructor",function(){
		var eskinModel = d3scomos.eskinModel("myModel");
		var opeartions = eskinModel.opeartions;
		/*beforeEach(function(){
		});*/
		it('should have injectInto reference passed in',function(){
			//since the module is private to lib constructor is not exposed directly instead
			//opeations object will be exposed from eskin_model
			//TODO: should this test be in eskinModel instead as constructor is not exposed here?
			expect(eskinModel.operations).to.not.undefined;
		});
	});
	describe("Methods",function(){
		beforeEach(function(){
			var el = document.createElement("div");
		    el.id = "myModel";
		    document.body.appendChild(el);
		});

		afterEach(function(){
			d3.select('div#myModel').remove();
		});

		describe("initialization methods",function(){
			var eskinModel = d3scomos.eskinModel("myModel");
			var operations = eskinModel.operations;
			describe("initCanvas",function(){
				it('Clear the container and add svg with default config',function(){
					//init canvas
					operations.initCanvas();
					var svg = d3.select("#myModel").select("svg")[0][0];
					expect(svg).to.not.null;
					//verify if default config are used
					var svgElem = d3.select(svg);
					expect(svgElem.attr("height")).to.equal("700px");
					expect(svgElem.attr("width")).to.equal("100%");
				});
				it('should init svg according to custom settings',function(){
					var eModel = d3scomos.eskinModel("myModel",{height:"500px"});
					var ops = eModel.operations;
					//init
					ops.initCanvas();
					var svg = d3.select("#myModel").select("svg")[0][0];
					var svgElem = d3.select(svg);

					expect(svgElem.attr("height")).to.equal("500px");
					expect(svgElem.attr("width")).to.equal("100%");
				});
			});
		});

		/**
		 * lets not test Behaviours for Construction methods here
		 * instead create a new test suite to test the behaviours of
		 * newly added node.
		 **/
		describe("Construction Method",function(){
			var eskinModel;
			var operations;
			beforeEach(function(){
				//init
				eskinModel = d3scomos.eskinModel("myModel");
				operations = eskinModel.operations;
				operations.initModel({sId:"M_1"});
			});
			describe("Method : addSpecies",function(){
				it('should throw Type error if molecule data is not passed',function(){
					expect(operations.addSpecies).to.throw(TypeError);
					expect(function(){operations.addSpecies()}).to.throw(TypeError);
				});

				it('should not add invalid species ',function(){
					// there are various cases of validation that can be tested
					//those will be tested in model validater test cases in details
					var vErrorData1 = {someKey:"someData"};//fails as sId is mandotory
					var vErrorData2 = {sId:"s_1"};

					ValidationError = d3scomos.customErrors.ValidationError;

					expect(function(){operations.addSpecies(vErrorData1)}).to.throw(ValidationError);
					expect(function(){operations.addSpecies(vErrorData2)}).to.throw(ValidationError);

					var validData = {sId :"s_2",sName:"sName1",sType:"simplechemical",iHeight:400,iWidth:400,position:{iX:100,iY:200}};
					expect(function(){operations.addSpecies(validData)}).to.not.throw(ValidationError);
				});
				it('should not allow same species( with same sId) to be added twice',function(){
					var species = {sId :"s_1",sName:"sName1",sType:"simplechemical",iHeight:400,iWidth:400,position:{iX:100,iY:200} };
					operations.addSpecies(species);
					expect(function(){operations.addSpecies(species)}).to.throw(ValidationError);
				});
				it('should add/correct sParentCompartment information',function(){
					var compartment = {sId :"C_1",sName:"sName1",sType:"rectangular",iHeight:600,iWidth:600,position:{iX:100,iY:200} };
					operations.addCompartment(compartment);
					var compartmentChild = {sId :"C_2",sName:"sName1",sType:"rectangular",iHeight:200,iWidth:200,position:{iX:240,iY:240} };
					operations.addCompartment(compartmentChild);
					expect(operations.getModel().mapCompartmentLayouts.C_2.sParentCompartment).to.equal("C_1");
					//add nwe species to C_1 physically
					var mSpecies = operations.getModel().mapSpeciesLayouts;
					operations.addSpecies({sId :"S_1",sName:"sName1",sType:"simplechemical",iHeight:40,iWidth:40,position:{iX:110,iY:210}});
					expect(mSpecies["S_1"].sParentCompartment).to.equal("C_1");
					operations.addSpecies({sId :"S_2",sName:"sName1",sType:"simplechemical",iHeight:40,iWidth:40,position:{iX:250,iY:250}});
					expect(mSpecies["S_2"].sParentCompartment).to.equal("C_2");

					//chekc if species is added to defautl if it does not belong to any other compartment
					var speciesinDefault = {sId :"S_defult",sName:"S_defult",sType:"simplechemical",iHeight:100,iWidth:100,position:{iX:1000,iY:1000}}
					operations.addSpecies(speciesinDefault);
					expect(mSpecies["S_defult"].sParentCompartment).to.equal("default");
				});
				it('should add/correct sParentComplex information',function(){
					var compartment = {sId :"C_1",sName:"sName1",sType:"rectangular",iHeight:600,iWidth:600,position:{iX:100,iY:200} };
					operations.addCompartment(compartment);
					var compartmentChild = {sId :"C_2",sName:"sName1",sType:"rectangular",iHeight:200,iWidth:200,position:{iX:240,iY:240} };
					operations.addCompartment(compartmentChild);
					expect(operations.getModel().mapCompartmentLayouts.C_2.sParentCompartment).to.equal("C_1");
					//add nwe species to C_1 physically
					var mSpecies = operations.getModel().mapSpeciesLayouts;
					operations.addSpecies({sId :"S_1",sName:"sName1",sType:"simplechemical",iHeight:100,iWidth:100,position:{iX:110,iY:210},sType:"COMPLEX"});
					expect(mSpecies["S_1"].sParentCompartment).to.equal("C_1");
					operations.addSpecies({sId :"S_2",sName:"sName1",sType:"simplechemical",iHeight:40,iWidth:40,position:{iX:115,iY:215},sParentComplex:"S_3"});
					expect(mSpecies["S_2"].sParentCompartment).to.equal("C_1");
					expect(mSpecies["S_2"].sParentComplex).to.equal("S_1");
				});
				it('should add species to the canvas',function(){
					var species = {sId :"s_1",sName:"sName1",sType:"simplechemical",iHeight:400,iWidth:400,position:{iX:100,iY:200} };
					operations.addSpecies(species);
					//check if ths species is drawn to the canvas or not
					var thisSpecies = d3.select("#myModel").select(".species-node");
					var thisData = thisSpecies.datum();
					expect(thisData.sId).to.equal("s_1");
				})
			});//add species ends
			describe("Method : addCompartment",function(){
				it('should throw Type error if compartment data is not passed',function(){
					expect(operations.addSpecies).to.throw(TypeError);
					expect(function(){operations.addCompartment()}).to.throw(TypeError);
				});
				it('should not add invalid compartments ',function(){
					// there are various cases of validation that can be tested
					//those will be tested in model validater test cases in details
					var vErrorData1 = {someKey:"someCompartment "};//fails as sId is mandotory
					var vErrorData2 = {sId:"C_1"};
					ValidationError = d3scomos.customErrors.ValidationError;
					expect(function(){operations.addCompartment(vErrorData1)}).to.throw(ValidationError);
					expect(function(){operations.addCompartment(vErrorData2)}).to.throw(ValidationError);
					var validData = {sId :"C_2",sName:"cName1",sType:"simplechemical",iHeight:400,iWidth:400,position:{iX:100,iY:200}};
					expect(function(){operations.addCompartment(validData)}).to.not.throw(ValidationError);
				});
				it('should not allow same Compartment( with same sId) to be added twice',function(){
					var compartment = {sId :"s_1",sName:"sName1",sType:"simplechemical",iHeight:400,iWidth:400,position:{iX:100,iY:200} };
					operations.addCompartment(compartment);
					expect(function(){operations.addCompartment(compartment)}).to.throw(ValidationError);
				});
				it('should correct missing or incorrect sParentCompartment Property',function(){
					var compartment = {sId :"C_1",sName:"sName1",sType:"rectangular",iHeight:400,iWidth:400,position:{iX:100,iY:200} };
					operations.addCompartment(compartment);
					//verify parent of C_1 is indeed a defaults
					expect(operations.getModel().mapCompartmentLayouts.C_1.sParentCompartment).to.equal("default");
					var compartmentChild = {sId :"C_2",sName:"sName1",sType:"rectangular",iHeight:200,iWidth:200,position:{iX:110,iY:210} };
					operations.addCompartment(compartmentChild);
					expect(operations.getModel().mapCompartmentLayouts.C_2.sParentCompartment).to.equal("C_1");
					//validate corner cases
					// case species vary near the end of the compartment
					var child_near_vertical_top_right = {sId :"C_3",sName:"cornerCompart",sType:"rectangular",iHeight:90,iWidth:90,position:{iX:400,iY:500} };
					//add this child verify parent
					operations.addCompartment(child_near_vertical_top_right);
					expect(operations.getModel().mapCompartmentLayouts.C_3.sParentCompartment).to.equal("C_1");

					//case where compartment is not part of any compartmetn
					var child_outside_vertical_right = {sId :"C_4",sName:"cornerCompart",sType:"rectangular",iHeight:90,iWidth:90,position:{iX:600,iY:600} };
					operations.addCompartment(child_outside_vertical_right);
					expect(operations.getModel().mapCompartmentLayouts.C_4.sParentCompartment).to.equal("default");
				});
				it('should add compartment to canvas',function(){
					var compartment = {sId :"C_1",sName:"compartment_C_1",sType:"rectangular",iHeight:400,iWidth:400,position:{iX:100,iY:200} };
					operations.addCompartment(compartment);
					//validate if compartment is indedd added to the canvas
					var thisCompartment = d3.select("#myModel").select(".compartment");
					var thisData = thisCompartment.datum();

					expect(thisData.sId).to.equal("C_1");
				})
			}); //add compartment ends
			describe("Method:addReaction",function(){
				it('should throw Type error if reaction data is not passed',function(){
					expect(operations.addReaction).to.throw(TypeError);
					expect(function(){operations.addReaction()}).to.throw(TypeError);
				});
				it('should not add invalid reaction ',function(){
					// there are various cases of validation that can be tested
					//those will be tested in model validater test cases in details
					var vErrorData1 = {someKey:"someCompartment "};//fails as sId is mandotory
					var vErrorData2 = {sId:"R_1"};
					ValidationError = d3scomos.customErrors.ValidationError;
					expect(function(){operations.addReaction(vErrorData1)}).to.throw(ValidationError);
					expect(function(){operations.addReaction(vErrorData2)}).to.throw(ValidationError);
					var validData = {sId :"R_2",sName:"cName1",sType:"simplechemical",iHeight:400,iWidth:400,position:{iX:100,iY:200}};
					expect(function(){operations.addReaction(validData)}).to.not.throw(ValidationError);
				});
				it('should not allow same Reaction( with same sId) to be added twice',function(){
					var reaction = {sId :"R_1",sName:"sName1",sType:"simplechemical",iHeight:400,iWidth:400,position:{iX:100,iY:200} };
					operations.addReaction(reaction);
					expect(function(){operations.addReaction(reaction)}).to.throw(ValidationError);
				});
				it('should setup sParentCompartment of reaction node',function(){
					var compartment = {sId :"C_1",sName:"sName1",sType:"rectangular",iHeight:400,iWidth:400,position:{iX:100,iY:200} };
					operations.addCompartment(compartment);
					var compartmentChild = {sId :"C_2",sName:"sName1",sType:"rectangular",iHeight:200,iWidth:200,position:{iX:110,iY:210} };
					operations.addCompartment(compartmentChild);
					expect(operations.getModel().mapCompartmentLayouts.C_2.sParentCompartment).to.equal("C_1");
					//add reaction to c_1
					var sModel = operations.getModel();
					var reactionMap = sModel.mapReactionLayouts;
					var reaction_c1 = {sId :"R_1",sName:"sName1",sType:"GENERALREACTION",iHeight:20,iWidth:20,position:{iX:110,iY:210} };
					operations.addReaction(reaction_c1);
					expect(reactionMap["R_1"].sParentCompartment).to.equal("C_1");

					//test for corner cases
					// case -1 reaction not at very close to vertical right
					var reaction_verticle_right = {sId :"reaction_verticle_right",sName:"sName1",sType:"GENERALREACTION",iHeight:20,iWidth:20,position:{iX:450,iY:550} };
					operations.addReaction(reaction_verticle_right);
					expect(reactionMap["reaction_verticle_right"].sParentCompartment).to.equal("C_1");

					// case -2 reaction node does not belong to any compartment
					var reaction_default = {sId :"reaction_default",sName:"sName1",sType:"GENERALREACTION",iHeight:20,iWidth:20,position:{iX:1450,iY:1550} };
					operations.addReaction(reaction_default);
					expect(reactionMap["reaction_default"].sParentCompartment).to.equal("default");
				});
				it('should add reaction node to canvas',function(){
					var sModel = operations.getModel();
					var reactionMap = sModel.mapReactionLayouts;
					var reaction_default = {sId :"R_1",sName:"sName1",sType:"GENERALREACTION",iHeight:20,iWidth:20,position:{iX:1450,iY:1550} };
					operations.addReaction(reaction_default);

					var thisReaciton = d3.select('.reaction-node');
					var thisData = thisReaciton.datum();
					expect(thisData.sId).to.equal("R_1");
				})
			});
		}); //construction methods end
	});//test methods ends
});
