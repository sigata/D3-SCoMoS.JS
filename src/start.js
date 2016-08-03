(function (window) {
    'use strict';
  
/**
 * Defines global d3Scomos object for export 
 */
//var d3scomos = d3.scomos = {version: "0.0.1"}; //library version
var d3scomos = {version: "0.0.1"}; //library version

/** private method to init library instance with dependencies
 * @param {Object} config object with options defined
 */
function __initInternals(thisLib,config)
{
	var $$ = thisLib;
	/** add d3 to current scope **/
	$$.d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require("d3") : undefined;
	$$.options = config.options || {};
	$$.modelData = config.modelData ||{};
}
/**
 * initializes the d3scomos library with passed config object
 * @param accepts config json has format {options,modelData}
 */
d3scomos.init = function(config)
{
	//init base dependencies
	/** default config options add new as required **/
	var __options = {height:1000,width:1000,
					 autoSizeOnDrag:true,
					 onStartScaleToFit:true
				 	}
	var __config = {options: config.options || __options , modelData :config.modelData || {} }
	__initInternals(this,__config);
}