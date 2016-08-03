var expect = chai.expect;

describe("Resizer",function(){
    var resizer;
    beforeEach(function(){
        resizer = d3scomos.resizer;
        var el = document.createElement("div");
        el.id = "myModel";
        document.body.appendChild(el);
        var sGraph = d3scomos.eskinModel('myModel');
        sGraph.generate(testJson);
    });
    afterEach(function(){
        d3.select('div#myModel').remove();
    });
    describe("Constructor",function(){
        it('should create the valid resizer object',function(){
            console.warn(resizer);
            expect(resizer).to.be.an('object');
        });
    });
    describe("Methods",function(){
        describe("Method:addResizer",function(){
            it('should have method add Resizer',function(){
                expect(resizer).to.include.keys("addResizer");
            });
            it('should accept the valid d3 selector only',function(){
                expect(resizer.addResizer).to.throw();
                expect(function(){resizer.addResizer()}).to.throw();
                expect(function(){resizer.addResizer('notD3selctor')}).to.throw();
                expect(function(){resizer.addResizer(d3.select('.not_valid_node'))}).to.throw();
                //valid case
                expect(function(){resizer.addResizer(d3.select('.species-node'))}).to.not.throw();
            });
        })
    })

})
