/**
 * Scomos Logger : Scomos Logger Module
 * Maintains Various Logs,alerts errors etc. 
 * Logger will maintain logs and expose API's to access them systematically
 * 
 * Logger supports six levels of logging: TRACE < DEBUG < INFO < WARN < ERROR < FATAL
 * 
 * library will accept the external logger object which have above mentioned methods
 * in case external logger is not passed library will be use console.log ( Wont have FATAL)
 **/

/** default logger **/
function Logger(){
	var __logger = {};
	var logger = console;
	//setter to attach external logger
	__logger.setLogger = function(__logger){
		logger = __logger;
	}
	
	//add method wrappers to access log method of console or passed logger based on settings
	/**
	 * Method : trace 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.trace = function trace(message){
		if(logger.trace.constructor === Function)
			logger.trace(message);
		else
			console.trace(message);
	}
	
	/**
	 * Method : info 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.info = function trace(message){
		if(logger.info.constructor === Function)
			logger.info(message);
		else
			console.info(message);
	}
	
	/**
	 * Method : debug 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.debug = function debug(message){
		if(logger.debug.constructor === Function)
			logger.debug(message);
		else
			console.log(message);
	}
	
	/**
	 * Method : warn 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.warn = function warn(message){
		if(logger.warn.constructor === Function)
			logger.warn(message);
		else
			console.warn(message);
	}
	
	/**
	 * Method : error 
	 * @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.error = function error(message){
		if(logger.error.constructor === Function)
			logger.error(message);
		else
			console.error(message);
	}

	/**
	 * Method : fatal 
	* @param {String | object} message
	 * @returns logs the stack trace to appropriate logger
	 */
	__logger.fatal = function fatal(message){
		if(logger.fatal.constructor === Function)
			logger.fatal(message);
		else
			//since console logger have no FATAL method
			console.error("FATAL: " + JSON.stringify(message));
	}
	return __logger;
};

/** expose logger object (console logger as default) **/
	var __logger = d3scomos.Logger = Logger(console); 