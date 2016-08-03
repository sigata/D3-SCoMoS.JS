/**
 * Scomos Error module : contains custom error
 */
/**
 * validation error : thrown when invalid data is passed to library 
 */
//expose these custome errors so that can be used while unit testing
var customErrors = d3scomos.customErrors = {};

customErrors.ValidationError = function ValidationError(message){
	this.name = "ValidationError";
	this.message = (message || "");
	}
customErrors.ValidationError.prototype = Error.prototype;