/*

API Service

Provides wrapper functions for working with various API libraries, specifically axios.

*/
'use strict';

import { map, cloneDeep } from 'lodash';
import objectPath from 'object-path';
import logger from '@ylopo/service-logger';
import axios from 'axios';
import BPromise from 'bluebird';

/**
 * formatAndRethrowError
 *
 * Ensures we always have a specific type of error, an object with errorMessage that works with Promise.reject.
 *
 * @param  {[type]} error [description]
 * @return {Promise}
 */
export function formatAndRethrowError(error) {
	logger.warn('formatAndRethrowError -> ', error);
	var newError = cloneDeep(error.data ? error.data : error);

	// Propagating permissions check failed message from mf-business-api to client
	if (newError.error === true && newError.message.indexOf('Permissions check failed') === 0) {
		newError.clientMessage = newError.message;
	}

	if (error.clientMessage && !newError.clientMessage) {
		newError.clientMessage = error.clientMessage;
	}
	if (error.status && !newError.status) {
		newError.status = error.status;
	}

	if (newError.error === true) { // Remove error: true field to simplify presentation logic on client
		delete newError.error;
	}

	if (newError.errorList) {
		newError.errorMessage = map(newError.errorList, (e) => {
			return e.message || objectPath.get(e, 'data.message') || e.statusText || e;
		}).join(' ');
	}
	else if (typeof newError !== "string") {
		newError.errorMessage = newError.errorMessage || newError.message || objectPath.get(newError, 'error.message');
	}
	logger.warn('formatAndRethrowError -> newError: ', newError);

	return Promise.reject(newError);
}
/**
 * GET request
 * @returns {BPromise}
 */
export function get() {
	return BPromise.resolve(axios.get.apply(this, arguments));
}

/**
 * POST request
 * @returns {BPromise}
 */
export function post() {
	return BPromise.resolve(axios.post.apply(this, arguments));
}

/**
 * PUT request
 * @returns {BPromise}
 */
export function put() {
	return BPromise.resolve(axios.put.apply(this, arguments));
}

/**
 * DELETE request
 * @returns {BPromise}
 */
export function del() {
	return BPromise.resolve(axios.delete.apply(this, arguments));
}

export default {
	formatAndRethrowError,
	get,
	post,
	put,
	del
};
