/**
* a module to test various behavior attached to svg nodes
* use the production json to draw the modle first and then test events
**/
var expect = chai.expect;
describe('Behaviour tests',function(){
  var sModel;

  beforeEach(function(){
    var el = document.createElement("div");
      el.id = "myModel";
      document.body.appendChild(el);
    //before each test redraw the model with production JSON
  	sModel =  d3scomos.eskinModel("myModel");
    //console.info(sModel);
    sModel.generate(testJson);
  });
  afterEach(function(){
    //clear the dom
    d3.select('div#myModel').remove();
  })
  describe('Species Behaviours',function(){
    describe('Mouse Events',function(){
      describe('Mouse Clicked',function(){
          it('should mark clicked species as selected',function(){
            //get ref to some species
            var elem = d3.select('.species-node');
            //fire mouse down
            $(elem[0][0]).simulate('click');
            expect(elem.classed('selected')).to.be.ok;
          });
          it('should deselect other selections and mark this species as selected',function(){
              //get ref to some species
              var elems = d3.selectAll('.species-node');
              //fire mouse down
              //select one species
              var elem1 = d3.select(elems[0][0]);
              var elem2 = d3.select(elems[0][1]);

              $(elem1[0][0]).simulate('click');
              expect(elem1.classed('selected')).to.be.ok;
              //click second speceis
              $(elem2[0][0]).simulate('click');
              expect(elem1.classed('selected')).to.not.ok;
              expect(elem2.classed('selected')).to.be.ok;
          })
          it('Should maintain previous selections if ctrl key is pressed',function(){
              //get ref to some species
              var elems = d3.selectAll('.species-node');
              //fire mouse down
              //select one species
              var elem1 = d3.select(elems[0][0]);
              var elem2 = d3.select(elems[0][1]);

              $(elem1[0][0]).simulate('click');
              expect(elem1.classed('selected')).to.be.ok;
              //click second speceis with ctrl pressed
              $(elem2[0][0]).simulate('click',{ ctrlKey: true });
              expect(elem1.classed('selected')).to.be.ok;
              expect(elem2.classed('selected')).to.be.ok;
          });
          it('Should dispatch/expose mouse clicked event with data and element',function(done){
              var elem = d3.select('.species-node');
              var thisData = elem.datum();
              sModel.on('speciesClick',function(data,elem){
                expect(data.sId).to.equal(thisData.sId);
                //verify element
                expect(d3.select(elem).datum().sId).equal(thisData.sId);
                done();
              })
              $(elem[0][0]).simulate('click');
          });
      });
    });
  });

  describe('Reaction Behaviours',function(){
      describe('Mouse Events',function(){
        describe('Mouse Clicked',function(){
          it('should mark clicked reaction as selected',function(){
            //get ref to some species
            var elem = d3.select('.reaction-node');
            //fire mouse down
            try{
                $(elem[0][0]).simulate('click');
            }
            catch(e){
              console.warn(e);
            }

            expect(elem.classed('selected')).to.be.ok;
          });
          it('should select edges attached to this reaction',function(){
            var reactionElem = d3.select('.reaction-node');
            var reactionData = reactionElem.datum();
            var reactionEdges = reactionData.getAllEdges();
            //click this node
            $(reactionElem[0][0]).simulate('click');
            expect(reactionElem.classed('selected')).to.be.ok;
            var selectedEdges = d3.selectAll('.selected').selectAll('.link');
            //expect(reactionEdges.length).to.equal(selectedEdges[0].length);
          })
          it('Should maintain previous selections if ctrl key is pressed',function(){
              //get ref to some species
              var elems = d3.selectAll('.reaction-node');
              //fire mouse down
              //select one species
              var elem1 = d3.select(elems[0][0]);
              var elem2 = d3.select(elems[0][1]);

              $(elem1[0][0]).simulate('click');
              expect(elem1.classed('selected')).to.be.ok;
              //click second speceis with ctrl pressed
              $(elem2[0][0]).simulate('click',{ ctrlKey: true });
              expect(elem1.classed('selected')).to.be.ok;
              expect(elem2.classed('selected')).to.be.ok;
          });
          it('Should dispatch/expose mouse clicked event with data and element',function(done){
              var elem = d3.select('.reaction-node');
              var thisData = elem.datum();
              sModel.on('reactionClick',function(data,elem){
                expect(data.sId).to.equal(thisData.sId);
                //verify element
                expect(d3.select(elem).datum().sId).equal(thisData.sId);
                done();
              })
              $(elem[0][0]).simulate('click');
          });
      });
    });
  });

  describe('Compartment Behaviours',function(){
      describe('Mouse Events',function(){
        describe('Mouse Clicked',function(){
          it('should mark clicked compartment as selected as selected',function(){
            //get ref to some species
            var elem = d3.select('.compartment');
            //fire mouse down
            $(elem[0][0]).simulate('click');
            expect(elem.classed('selected')).to.be.ok;
          });
          it('should deselect other selections and mark this species as selected',function(){
              //get ref to some species
              var elems = d3.selectAll('.compartment');
              //fire mouse down
              //select one species
              var elem1 = d3.select(elems[0][0]);
              var elem2 = d3.select(elems[0][1]);

              $(elem1[0][0]).simulate('click');
              expect(elem1.classed('selected')).to.be.ok;
              //click second speceis
              $(elem2[0][0]).simulate('click');
              expect(elem1.classed('selected')).to.not.ok;
              expect(elem2.classed('selected')).to.be.ok;
          })
          it('Should maintain previous selections if ctrl key is pressed',function(){
              //get ref to some species
              var elems = d3.selectAll('.compartment');
              //fire mouse down
              //select one species
              var elem1 = d3.select(elems[0][0]);
              var elem2 = d3.select(elems[0][1]);

              $(elem1[0][0]).simulate('click');
              expect(elem1.classed('selected')).to.be.ok;
              //click second speceis with ctrl pressed
              $(elem2[0][0]).simulate('click',{ ctrlKey: true });
              expect(elem1.classed('selected')).to.be.ok;
              expect(elem2.classed('selected')).to.be.ok;
          });
          it('Should dispatch/expose mouse clicked event with data and element',function(done){
              var elem = d3.select('.compartment');
              var thisData = elem.datum();
              sModel.on('compartmentClick',function(data,elem){
                expect(data.sId).to.equal(thisData.sId);
                //verify element
                expect(d3.select(elem).datum().sId).equal(thisData.sId);
                done();
              })
              $(elem[0][0]).simulate('click');
          });
        });
    });

  });

  describe('Edges Behaviours',function(){
    it('should mark clicked compartment as selected as selected',function(){
      //get ref to some species
      var elem = d3.select('.compartment');
      //fire mouse down
      $(elem[0][0]).simulate('click');
      expect(elem.classed('selected')).to.be.ok;
    });
    it('should deselect other selections and mark this species as selected',function(){
        //get ref to some species
        var elems = d3.selectAll('.link');
        //fire mouse down
        //select one species
        var elem1 = d3.select(elems[0][0]);
        var elem2 = d3.select(elems[0][1]);

        $(elem1[0][0]).simulate('click');
        expect(elem1.classed('selected')).to.be.ok;
        //click second speceis
        $(elem2[0][0]).simulate('click');
        expect(elem1.classed('selected')).to.not.ok;
        expect(elem2.classed('selected')).to.be.ok;
    })
    it('Should maintain previous selections if ctrl key is pressed',function(){
        //get ref to some species
        var elems = d3.selectAll('.link');
        //fire mouse down
        //select one species
        var elem1 = d3.select(elems[0][0]);
        var elem2 = d3.select(elems[0][1]);

        $(elem1[0][0]).simulate('click');
        expect(elem1.classed('selected')).to.be.ok;
        //click second speceis with ctrl pressed
        $(elem2[0][0]).simulate('click',{ ctrlKey: true });
        expect(elem1.classed('selected')).to.be.ok;
        expect(elem2.classed('selected')).to.be.ok;
    });
    it('Should dispatch/expose mouse clicked event with data and element',function(done){
        var elem = d3.select('.compartment');
        var thisData = elem.datum();
        sModel.on('compartmentClick',function(data,elem){
          expect(data.sId).to.equal(thisData.sId);
          //verify element
          expect(d3.select(elem).datum().sId).equal(thisData.sId);
          done();
        })
        $(elem[0][0]).simulate('click');
    });

    it('should mark clicked edge as selected',function(){
      var elem = d3.select('.link');
      //fire mouse down
      $(elem[0][0]).simulate('click');
      expect(elem.classed('selected')).to.be.ok;
    });
    it('should remove maintain previous selection if ctrl key is pressed',function(){
      var elems = d3.selectAll('.link');
      //fire mouse down
      //select one species
      var elem1 = d3.select(elems[0][0]);
      var elem2 = d3.select(elems[0][1]);

      $(elem1[0][0]).simulate('click');
      expect(elem1.classed('selected')).to.be.ok;
      //click second speceis with ctrl pressed
      $(elem2[0][0]).simulate('click',{ ctrlKey: true });
      expect(elem1.classed('selected')).to.be.ok;
      expect(elem2.classed('selected')).to.be.ok;
    })
    it('Should dispatch/expose mouse clicked event with data and element',function(done){
      var elem = d3.select('.link');
      var thisData = elem.datum();
      sModel.on('linkClick',function(data,elem){
        expect(data.sId).to.equal(thisData.sId);
        //verify element
        expect(d3.select(elem).datum().sId).equal(thisData.sId);
        done();
      })
      $(elem[0][0]).simulate('click');
    });
  });
  describe('Drag behavior',function(){
    it('should select and drag speceis, reaction and compartments',function(){

      //no idea why but drag by 1 corresponds to movement by 3.9 pixels
      var dragFactor = 1;//expect drag to be higher that this

      var compartment = d3.select('.compartment');

      var xBefore = compartment.datum().position.iX;
      var yBefore = compartment.datum().position.iY;
      //simulate darg on this
      $(compartment[0][0]).simulate('drag',{dx: 100, dy: 50});
      var xAfter = compartment.datum().position.iX;
      var yAfter = compartment.datum().position.iY;

      expect(compartment.classed('selected')).to.be.ok
      expect(xAfter - xBefore).to.be.above(100*dragFactor-1);
      expect(yAfter - yBefore).to.be.above(50*dragFactor-1);

      //drag speceis
      var species = d3.select('.species-node');

      var xBefore = species.datum().position.iX;
      var yBefore = species.datum().position.iY;
      //simulate darg on this
      $(species[0][0]).simulate('drag',{dx: 100, dy: 50});
      var xAfter = species.datum().position.iX;
      var yAfter = species.datum().position.iY;

      expect(species.classed('selected')).to.be.ok
      expect(xAfter - xBefore).to.be.above(100*dragFactor-1);
      expect(yAfter - yBefore).to.be.above(50*dragFactor-1);

      var reaction = d3.select('.reaction-node');

      var xBefore = reaction.datum().position.iX;
      var yBefore = reaction.datum().position.iY;
      //simulate darg on this
      $(reaction[0][0]).simulate('drag',{dx: 50, dy: 100});
      var xAfter = reaction.datum().position.iX;
      var yAfter = reaction.datum().position.iY;

      expect(reaction.classed('selected')).to.be.ok
      expect(xAfter - xBefore).to.be.above(50*dragFactor-1);
      expect(yAfter - yBefore).to.be.above(100*dragFactor-1);
    });
    //TODO find  a way to simulate this tess
    // it('should select and drag multiSelected elements',function(){
    //   //no idea why but drag by 1 corresponds to movement by 3.9 pixels
    //   var dragFactor = 1;//expect drag to be higher than this
    //
    //   var species = d3.select('.species-node');
    //   var reaction = d3.select('.reaction-node')
    //
    //   //before event
    //
    //   var xBeforeSpecies = species.datum().position.iX;
    //   var yBeforeSpecies = species.datum().position.iY;
    //
    //   var xBeforeReaction = reaction.datum().position.iX;
    //   var yBeforeReaction = reaction.datum().position.iY;
    //
    //   //$(species[0][0]).simulate('click',{ ctrlKey: true });
    //   $(reaction[0][0]).simulate('click',{ ctrlKey: true });
    //
    //   //simulate group drag
    //   $(species[0][0]).simulate('drag',{dx: 100, dy: 50});
    //
    //   //after event
    //   var xAfterSpecies = species.datum().position.iX;
    //   var yAfterSpecies = species.datum().position.iY;
    //
    //   var xAfterReaction = reaction.datum().position.iX;
    //   var yAfterReaction = reaction.datum().position.iY;
    //
    //   //validate
    //   expect(xAfterSpecies - xBeforeSpecies).to.be.above(100*dragFactor-1);
    //   expect(xAfterReaction - xBeforeReaction).to.be.above(100*dragFactor-1);
    //
    //   expect(yAfterSpecies - yBeforeSpecies).to.be.above(50*dragFactor-1);
    //   expect(yAfterReaction - yBeforeReaction).to.be.above(50*dragFactor-1);
    // });
  })
  describe('Combined events/interactions',function(){
    it('should have tests');
  })
})
