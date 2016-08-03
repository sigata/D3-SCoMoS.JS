/**
 * Test Suite for custom scomos library d3scomos
 */
var expect = chai.expect;
describe('d3scomos',function(){
	describe('constructor',function(){
		it('should have version',function(){
			expect(d3scomos.version).to.equal('0.0.1');
		});
	});
	describe('scomos init',function(){
		it('should accept config object with options and data',function(){
			var __options = {height:1000,widht:1000};
			var __ModelData = {};
		})
	});
	//TODO add tests
});