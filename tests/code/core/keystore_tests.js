/** tests for keystore module **/

var expect = chai.expect;

describe("Keystore module",function(){
    var keyStore=null;
    beforeEach(function(){
        keyStore = d3scomos.keyStore();
    });
	describe("constructor",function(){
		it('should have tests');
	});
    describe("Keystore Methods",function(){
        describe("Method: hasKey",function(){
            it('should return weather key exists or not in keystore',function(){
                expect(keyStore.hasKey('S_1')).to.be.false;
                keyStore.addKey('S_1');
                expect(keyStore.hasKey('S_1')).to.be.true;
            });
        })
        describe("Method: addKey",function(){
            it('should not allow invalid key',function(){
                //should not allow empty key
                expect(function(){keyStore.addKey()}).to.throw(Error);
                //must not allow not string keys
                expect(function(){keyStore.addKey(1234)}).to.throw(Error);
            })
            it('should add key to store',function(){
                keyStore.addKey('S_1');
                expect(keyStore.hasKey('S_1')).to.be.true;
            })
            it('should not allow readding the key',function(){
                keyStore.addKey('S_1');
                expect(keyStore.hasKey('S_1')).to.be.true;
                //must throw unique key violation error
                expect(function(){keyStore.addKey('S_1')}).to.throw(Error);
            })
            it('should increment species/compartmetn and reaction index accordingly',function(){
                keyStore.addKey('S_1');
                expect(keyStore.getCurrentCounters().species).to.eql(1);

                keyStore.addKey('C_1');
                expect(keyStore.getCurrentCounters().compartment).to.eql(1);

                keyStore.addKey('R_1');
                expect(keyStore.getCurrentCounters().reaction).to.eql(1);
                expect(keyStore.getCurrentCounters().count).to.eql(3);

                keyStore.addKey('S_10');
                expect(keyStore.getCurrentCounters().species).to.eql(10);
                expect(keyStore.getCurrentCounters().count).to.eql(4);
            })
        });
        describe("Method group : getNext",function(){
            it('should get next Speceis id and incremnt Id accordingly',function(){
                keyStore.addKey('S_10');
                expect(keyStore.getNextSpecies()).to.equal('S_11');
            })
            it('should get next Compartment id and incremnt Id accordingly',function(){
                keyStore.addKey('C_10');
                expect(keyStore.getNextCompartment()).to.equal('C_11');
            })
            it('should get next Reaction id and incremnt Id accordingly',function(){
                keyStore.addKey('R_10');
                expect(keyStore.getNextReaction()).to.equal('R_11');
            })
        });
        describe('Method : removeKey',function(){
            it('should delete key if it exists',function(){
                keyStore.addKey('S_10');
                expect(keyStore.removeKey('S_10')).to.equal('S_10');
            });
            it('should return null if key does not exist',function(){
                expect(keyStore.removeKey('S_10')).to.be.undefined;
            })
        })
    })
})
