
	/** private function customSymbol
	 *
	 */
var customSymbol = function(){
	  var type,
	  shapeObj;
	  function symbol(d,i) {
		  var customSymbol;
		  try {
			  customSymbol =  customSymbolTypes.get(type.call(this,d,i))(shapeObj.call(this,d,i));
		  }
		catch(err) {
		    console.log("invalid shape : "+type.call(this,d,i))
		    customSymbol =  customSymbolTypes.get('GENE')(shapeObj.call(this,d,i));
		    console.log(customSymbol);
		}
		return customSymbol;
	  }
	  symbol.type = function(_) {
	    if (!arguments.length) return type;
	    type = d3.functor(_);
	    return symbol;
	  };
	  symbol.shapeObj = function(_) {
	    if (!arguments.length) return shapeObj;
	    shapeObj = d3.functor(_);
	    return symbol;
	  };
	  return symbol;
	};

/** assumption : every passed object in shape must have following structure
 * Object :
 * 			iHeight : val,
 * 			iWidth	: val
 */
var getSymbol = d3scomos.getSymbol = function getSymbol(_type, shapeObj) {
		/** for standard shapes provided by the d3 they are assumed to be square **/
		shapeObj = shapeObj || {iHeight:128,iWidth:128};
		//size in case referenced the d3 shape
		var size = shapeObj.iHeight||shapeObj.iWidth; //both will be same in this case
		//all shape names are in all caps
		var type = "";
		if(_type !=undefined) type = symbolTypeMappings[_type.replace(/ /g,'')]//eval('typeMappings["'+_type+'"]')//typeMappings[''+_type];
		if (d3.svg.symbolTypes.indexOf(type) !== -1) {
			return d3.svg.symbol().type(type).size(size)();
		} else {
			return customSymbol().type(type).shapeObj(shapeObj)();
		}
	}
var symbolTypeMappings = {
    "SimpleChemical"    :"SIMPLECHEMICAL",
    "GenericProtein"    :"GENERICPROTEIN",
    "DNA(Gene)"         :"GENE",
    "RNA"               :"RNA",
    "Receptor"          :"RECEPTOR",
    "Phenotype"         :"PHENOTYPE",
    "PerturbingAgent"   :"PERTURBINGAGENT",
    "Source/Sink"       :"SOURCEORSINK",
    "Ligand"            :"LIGAND",
    "TranscriptionFactor":"TRANSCRIPTIONFACTOR",
    "Enzyme"            :"ENZYME",
    "Complex"           :"COMPLEX",
    "REACTION"          :"REACTION",
    "InvalidMolecule(s)":"GENE",
    "Rectangular"       :"RECTANGULAR",
    "Circular"          :"CIRCULAR",
    "General"           :"GENERAL"
}
