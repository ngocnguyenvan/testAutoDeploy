'use strict';

import objectPath from 'object-path';
import Promise from 'bluebird';
import { merge } from 'lodash';

/**
 * YlopoSession
 *
 * This is our wrapper for the session.  Providing some "structure around how one is working with the session".
 *
 * [ Note ] - It is kind of scarry mutating "req.session" in here as other objects have access to mutate it as well...
 * There are no guarantees around who has set `_authenticated` or any other `account` related data.  Is there a simple
 * way to isolate how we can read/write to the session?
 *
 */
export class YlopoSession {

	/**
	 * @param {Request} req
	 * @returns {void}
	 */
	constructor( req ) {
		this.req = req;
	}

	/**
	 * initialize
	 *
	 * Initializes the user with the stormpath account.
	 *
	 * @param {object} account
	 * @returns {Promise}
	 */
	initialize( account ) {
		this.req.session.account = merge( {}, account );
		this.req.session._authenticated = true;

		return Promise.resolve();
	}

	/**
	 * deInitialize
	 *
	 * Destroys the current ylopo session
	 *
	 * @returns {Promise}
	 */
	deInitialize() {
		return Promise.promisify( this.req.session.destroy.bind(this.req.session) )();
	}

	/**
	 * @returns {boolean} true if authenticated, false otherwise.
	 */
	isAuthenticated() {
		return !!objectPath.get( this, 'req.session._authenticated' );
	}

	/**
	 * @returns {object} account data stored in session
	 */
	getAccountData() {
		return objectPath.get( this, 'req.session.account');
	}
}

/**
 * initializeSessionRequest
 *
 * Middleware which makes available req.ylopoSession for this request's lifecycle.  Instantiate a new instance for each
 * request, as session is unique to request.
 *
 * @param  {Object}   req  express request object
 * @param  {Object}   res  express response object
 * @param  {Function} next express next method
 * @returns {void}
 */
export var initializeSessionRequest = function( req, res, next ) {
	req.ylopoSession = new YlopoSession( req );
	next();
};

export default {
	initializeSessionRequest,
	YlopoSession
};
