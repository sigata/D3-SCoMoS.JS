var expect = chai.expect;

describe('scomosTree',function(){
	describe('Constructor',function(){
		it('Should return instance of scomosTree',function(){
			var sTree = new d3scomos.scomosTree();
			expect(sTree).to.be.defined;
		});
		it('should accept default tree node ',function(){
			var sTree = new d3scomos.scomosTree("default");
			expect(sTree.getRoot().val).to.have.string('default');
		});
	});
	describe('scomos tree : Methods',function(){
		
		var sTree;
		/** objects to test tree functionality **/
		
		var obj1 = {a:'a'};
		var obj2 = {b:'b'};
		var obj3 = {c:'c'};
		var obj4 = {d:'d'};
		
		beforeEach(function(){
			sTree = new d3scomos.scomosTree("default");
		})
		
		describe('Method : addNode',function(){
			//add the passed Node to parent
			// if no parent add to default
			//verify
			it('should add node to default if not parent is passed',function(){
				sTree.addNode(obj1);
				console.log(sTree.getRoot().children);
				expect(sTree.findNode(obj1).val).to.deep.equal(obj1);
			});
			it('should add node to parent if parent is passed',function(){
				sTree.addNode(obj1);//adds to default
				sTree.addNode(obj2,obj1);//add obj2 to obj1
				//verify
				console.log(sTree);
				var s = sTree.findNode(obj1)
				var childrenVals = [];
				s.children.forEach(function(node){childrenVals.push(node.val)});
				console.log(childrenVals);
				console.log(sTree.getRoot());
				expect(childrenVals).to.contain(obj2);
			});
		});
		describe('Method : findNode',function(){
			it('should return undefined if node does not exist',function(){
				console.log("-1 test");
				console.log(sTree.findNode(obj1));
				expect(sTree.findNode(obj1)).to.be.undefined;
			});
			it('should find object if exist',function(){
				sTree.addNode(obj1);//attached to default
				sTree.addNode(obj2,obj1);//add obj2 to obj1
				sTree.addNode(obj3);//attached to default
				//veify
				expect(sTree.findNode(obj1).val).to.deep.equal(obj1);
				expect(sTree.findNode(obj3).val).to.deep.equal(obj3);
			});
			
		});
	});
});