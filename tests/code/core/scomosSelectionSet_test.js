describe('scomos Selection set',function(){
	var selectionSet;
	describe('Constructor',function(){
		it('should accept hashFunction as constructor argument',function(){
			var testObj = {sId:"S_1",data : 'some data'};
			var _set = new d3scomos.selectionSet(function(data){return data.sId});
			expect(_set.add(testObj)).to.deep.equal(testObj);
		});
	})
	describe('Basic Set Methods',function(){
		
		var testObj1 = {sId:"S_1",data : 'some data1'};
		var testObj2 = {sId:"S_2",data : 'some data2'};
		var testObj3 = {sId:"S_1",data : 'some data1 repeated'};
		
		beforeEach(function(){
			//get instance of selectionSet
			selectionSet =  new d3scomos.selectionSet(function(data){return data.sId});
		})
		
		describe('Method : getLength',function(){
			it('should return update length on insert opeation',function(){
				expect(selectionSet.length()).to.be.equal(0);
				selectionSet.add(testObj1);
				expect(selectionSet.length()).to.be.equal(1);
			})
		});
		
		describe('Method : add ',function(){
			it('Method add : should add new element to the set',function(){
				expect(selectionSet.add(testObj1)).to.deep.equal(testObj1);
			});
			it('should add new element and return existing if any with same hash',function(){
				selectionSet.add(testObj1);
				expect(selectionSet.add(testObj3)).to.deep.equal(testObj1);
			});
		});
		describe('Method : remove',function(){
			it('should remove set element matching to passed object(equality is determined by hash)',function(){
				//cannot remove from emoty
				expect(selectionSet.remove()).to.not.ok;
				selectionSet.add(testObj1);
				var v = selectionSet.remove(testObj1);
				expect(v).to.deep.equal(testObj1);
				//verify element was actually removed
				expect(selectionSet.remove(testObj1)).to.not.ok;
				//verify updated length
				expect(selectionSet.length()).to.equal(0);
			});
		});
		describe('Method : getItem',function(){
			it('should return element based on the key',function(){
				selectionSet.add(testObj1);
				selectionSet.add(testObj2);
				expect(selectionSet.getItem('S_1')).to.deep.equal(testObj1);
				expect(selectionSet.getItem('S_2')).to.deep.equal(testObj2);
				expect(selectionSet.getItem('S_3')).to.not.ok;
			});
		});
		describe('Method : each',function(){
			it('should apply passed function on all set element and return array changed set elements',function(){
				selectionSet.add(testObj1);
				selectionSet.add(testObj2);
				var v = selectionSet.each(function(obj){obj.changed=true;})
				//verify
				for(var i in v)
					{
						expect(v[i].changed).to.be.ok;
					}
			});
		});
		describe('Method : clear',function(){
			it('should remove all the elements and update count',function(){
				selectionSet.add(testObj1);
				selectionSet.add(testObj2);
				selectionSet.clear();
				expect(selectionSet.length()).to.equal(0);
			})
			it('should return array of deleted elents',function(){
				selectionSet.add(testObj1);
				var v = selectionSet.clear();
				expect(v[0]).to.deep.equal(testObj1);
			})
		});
	});
});