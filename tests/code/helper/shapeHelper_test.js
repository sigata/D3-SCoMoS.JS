
describe('scomos helper',function(){
		describe('shape Helper',function(){
			var shapeUtil =  d3scomos.shapeUtil;
			it('getEllipse : should return ellipse with passed dimensions',function(){
				var path = shapeUtil.getEllipse(60, 100, 10, 20);
				expect(path).to.have.string('M60 20A 50 30 0 0 0 60 80A 50 30 0 0 0 60 20');
			})
			it('resolveShape : should resolve shape no to the shapeName',function(){
				expect(shapeUtil.resolveShape(1)).to.be.string('GENERICPROTEIN');
			})
		});
	});