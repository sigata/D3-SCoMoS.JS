/**
 * contains various string messages used throughout the library
 * this will help in localizing the library and also reduce the in broswer memory footprint
 */

/**
 * eskin messages object provides static messages
 *TODO: look into possibility of customizing these messages as required with passed params
 */
var eskinMessages = {
		/** add all error messages here **/
		error : {
					/** validation error messages **/
					validation_sId_empty : "Invalid sId : sId is not optional",
					validation_sId_does_not_exist : "Invalid sId : sId does not exist in SBML Model.",
					validation_iHeight_empty : "Invalid iHeight : iHeight is not optional",
					validation_iHeight_not_number : "Invalid iHeight : iHeight must be a number",
					validation_iWidth_empty : "Invalid iWidth : iWidth is not optional",
					validation_iWidth_not_number : "Invalid iWidth : iWidth must be a number",

					validation_position_empty : "Invalid Position : Position value is not optional",
					validation_position_iX_not_number : "Invalid Position : Position.iX must be a number",
					validation_position_iY_not_number : "Invalid Position : Position.iY must be a number"
				}
}
