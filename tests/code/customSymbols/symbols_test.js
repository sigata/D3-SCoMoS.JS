//TODO add tests
	describe('customSymbols',function(){
		it('should provide support existing d3 symbos',function(){
			expect(d3scomos.getSymbol('circle',{iHeight:256,iWidth:256})).to.be.defined;
		});
		it('should support scomos specific symbols',function(){
			expect(d3scomos.getSymbol('RNA',{iHeight:256,iWidth:256})).to.be.a('string');;
			expect(d3scomos.getSymbol('RNA')).to.have.string('M25.6 0L128 0L128 0L102.4 128L0 128L0 128Z');
		});
		it('default shape size should be 128 x 128 pixels if not passed',function(){
			var shape1 =d3scomos.getSymbol('RNA');
			var shape2 =d3scomos.getSymbol('PERTURBINGAGENT');
			expect(shape1).to.match(/128/);
			expect(shape2).to.match(/128/);
		});
		it('should return GENE( rouned rect) if invalid shape requested',function(){
			var path = d3scomos.getSymbol('INVALID_SHAPE');
			expect(path).to.have.string('M0 0h128v128h-128z');
		});
	});