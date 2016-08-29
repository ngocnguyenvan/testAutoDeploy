/**
 *
 * Services specifically responsible for handling and returning errors
 *
 */
'use strict';
import { each } from 'lodash';
import objectPath from 'object-path';
import logger from '@ylopo/service-logger';

export default {

	/**
	 *
	 * respondWithStandardError
	 *
	 * Returns an error message with the given status and based upon a passed in code.
	 *
	 * @param {object} res - http response object
	 * @param {int} status - the http status code being returned: http://www.restapitutorial.com/httpstatuscodes.html
	 * @param {string} key - the key used to look up a standard error
	 * @returns {void}
	 */
	respondWithStandardError( res, status, key ) {
		var error = this.getErrorFromKey( key );
		res
			.status( status || error.code )
			.json({
				errorList: [
					error
				]
			});
	},

	/**
	 *
	 * respondWithError
	 *
	 * Returns an error message with the given status and based upon a passed in code.
	 *
	 * options input #1:
	 * {
	 * 		res,
	 * 		status,
	 *		errorList: [
	 *			{
	 *				error {object}, // for logging purposes
	 *				clientMessage {string}
	 *			},
	 *			...
	 *		]
	 * }
	 *
	 * options input #2:
	 * {
	 * 		res,
	 * 		status,
	 *		error: {object},
	 *		clientMessage: {string}
	 * }
	 *
	 * res JSON output:
	 * {
	 * 		errorList: [
	 * 			{
	 * 				message: clientMessage {string}
	 * 			},
	 * 			...
	 * 		]
	 * }
	 *
	 * @param {object} options
	 * @param {object} options.res - http response object
	 * @param {int} [options.status] - the http status code being returned: http://www.restapitutorial.com/httpstatuscodes.html
	 * @param {{clientMessage:string, error:object}[]}   [options.errorList] - array objects contain error and clientMessage
	 * @param {string} [options.clientMessage] - message sent to client. General error message is sent be default
	 * @param {object} [options.error] - error object to log and process later
	 * @returns {void}
	 */
	respondWithError(options) {
		// When individual error is passed, it my have a status code associated with it. Use it if no explicit status passed.
		if (options.error && options.error.status && !options.status) {
			options.status = options.error.status;
		}

		if (!options.errorList) {
			options.errorList = [{
				error: options.error,
				clientMessage: options.clientMessage || objectPath.get(options, "error.clientMessage")
			}];
			delete options.error;
			delete options.clientMessage;
		}

		let status = options.status && Number(options.status) && Number(options.status) !== 200 ? options.status : 500;
		let errorsList = options.errorList.filter(error => error.clientMessage)
				.map(error => {
					return {
						message: error.clientMessage
					};
				}) || [];

		options.res
			.status(status)
			.json({
				errorList: errorsList
			});

		each(options.errorList, (err) => {
			if (err) {
				if (status >= 500) {
					logger.error(err);
				}
				else {
					logger.warn(err);
				}
			}
		});
	},

	/**
	 *
	 * getErrorFromKey
	 *
	 * Returns a standard error object based upon a key
	 *
	 * @param {string} key - the key used to look up a standard error
	 * @returns {object}
	 */
	getErrorFromKey( key ) {
		switch ( key ) {
			case 'GENERIC_PROCESSING_ERROR':
				return {
					code: 500,
					message: 'Error processing your request.'
				};
			case 'UNAUTHORIZED':
				return {
					code: 403,
					message: 'Resource requires proper authentication.'
				};
			default:
				return {
					code: 0,
					message: 'An unknown error occured'
				};
		}
	}
};
