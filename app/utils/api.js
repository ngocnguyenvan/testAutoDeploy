'use strict';

import { Promise } from 'when';
import axios from 'axios';
import { HOST } from '../Constants';
import { map, reduce, cloneDeep } from 'lodash';
import cache from './cache';

/**
 * transformData
 *
 * Formats the data we are sending to the server based upon its type
 *
 * @param  {object} data  Key/value pair data we are sending to the server.
 * @return {object}       Server friendly formatted data
 */
function transformData( data ) {
	if (data instanceof FormData) {
		return data;
	}
	return reduce( data, ( result, current, key ) => {
		result[ key ] = formatData( current );
		return result;
	}, {} );
}

/**
 * formatData
 *
 * Formats the specific data point based upon its type
 *
 * @param  {node} value  data to be sent to the server.
 * @return {node}        a server friendly version
 */
function formatData( value ) {
	if ( value instanceof Date ) {
		return value.toJSON();
	}
	return value;
}

/**
 * formatAndRethrowError
 *
 * Ensures we always have a specific type of error, an objet with errorMessage that works with Promise.reject.
 *
 * @param  {[type]} error [description]
 * @return {Promise}
 */
function formatAndRethrowError(error) {
	var newError = cloneDeep(error.data ? error.data : error);

	if (newError.errorList) {
		newError.errorMessage = map(newError.errorList, (e) => {
			return e.message || e.data && e.data.message || e.statusText || e;
		}).join(' ');
	}
	else if (typeof newError !== "string") {
		newError.errorMessage = newError.errorMessage || newError.message;
	}

	return Promise.reject(newError);
}

export var get = ( path, params ) => {
	var cachedCollection = null;
	var cacheKey = null;
	var cached = null;

	// Cache listings
	if (/listing\/([0-9]+)$/.exec( path )) {
		cacheKey = parseInt( /listing\/([0-9]+)$/.exec( path )[1] );
		cachedCollection = cache.getCachedCollection('listing');
		if ( cachedCollection[cacheKey] ) {
			cached = cachedCollection[cacheKey];
		}
	}

	return cached ?
		Promise.resolve( cached ) :
		axios({
			url: (HOST || '') + path,
			params: transformData( params ),
			responseType: 'json'
		})
			.then( function( res ) {
				// cache data - out of flux sequence...
				if ( cachedCollection ) {
					cachedCollection[cacheKey] = res.data;
				}

				return res.data;
			})
			.catch(formatAndRethrowError);
};

export var post = ( path, params, data ) => {
	return axios({
		method: 'post',
		url: (HOST || '') + path,
		params: transformData( params ),
		data: transformData( data ),
		responseType: 'json',
		timeout: 10000
	})
		.then( function( res ) {
			return res.data;
		})
		.catch(formatAndRethrowError);
};

export var put = ( path, data ) => {
	return axios({
		method: 'put',
		data: transformData( data ),
		url: HOST + path,
		responseType: 'json'
	})
		.then( function( res ) {
			return res.data;
		})
		.catch(formatAndRethrowError);
};

export var del = ( path, data ) => {
	console.log('in axios del');
	return axios({
		method: 'delete',
		data: transformData( data ),
		url: HOST + path,
		responseType: 'json'
	})
		.then( function( res ) {
			console.log('in axios del then - all good here');
			return res.data;
		})
		.catch( function() { console.log( 'catching here', arguments );} )
		.catch(formatAndRethrowError);
};

export var attachRequestInterceptor = (successHandler, failedHandler) => {
	return axios.interceptors.request.use(successHandler, failedHandler);
};

export var attachResponseInterceptor = (successHandler, failedHandler) => {
	return axios.interceptors.response.use(successHandler, failedHandler);
};

export default {
	attachRequestInterceptor,
	attachResponseInterceptor,
	get,
	post,
	put,
	del
};
