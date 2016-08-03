/**
 * Implementation of Factory pattern to create various objects required
 * for eskin model construction
 **/

//TODO figure out how to unit test factory pattern
var SBMLFactory = d3scomos.SBMLFactory = function SBMLFactory (){
	/** return this **/
	var factory = {};
	var factoryProto = factory.prototype;

	/**
	 * SBMLModel
	 */
	factory.getSBMLModel = function(options){
		return new SBMLModel(options);
	}

	/** expose the SBML object constructors **/

	factory.getBase = function(options){
		return new Base(options);
	}

	factory.getSpecies = function(options){
		return new Species(options);
	}

	factory.getCompartment = function(options){
		return new Compartment(options);
	}
	factory.getReaction = function(options){
		return new Reaction(options);
	}

    factory.getEdge = function(source,target,role,options){
        return new Edge(source,target,role,options);
    }
	return factory;
}
