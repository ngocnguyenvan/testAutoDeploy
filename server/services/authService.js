/*

Auth Service

Wrapper for interacting with the underlying user management mechanism.  Enables conforming of the data response
as well as enhancement of that data for use in this application.

-  authenticate

*/
'use strict';

import stormpathService from './stormpathService';

export default {

	/**
	 * authenticate
	 *
	 * Authenticates based upon the passed in credentials.  Promise resolves with the user object and the necessary
	 * ylopo specific data added with special account data removed.
	 *
	 * @param {object}  credentials   - username/password of this user
	 * @return {Promise}              - resolved based upon a successful authentication event.
	 */
	authenticate( credentials ) {
		return stormpathService.authenticate(credentials);
	},

	/**
	 * register
	 *
	 * Creates new user
	 *
	 * @param {object}  user	- user object from UserStore
	 * @return {Promise}		- resolved based upon a successful register event.
	 */
	register(user) {
		return stormpathService.create(user);
	},

	/**
	 * resetPassword
	 *
	 * Sends email with password reset link to user
	 *
	 * @param {string}  email	- email of user to reset
	 * @return {Promise}		- resolved based upon a successful resetPassword event
	 */
	resetPassword(email) {
		return stormpathService.resetPassword(email);
	}

};
