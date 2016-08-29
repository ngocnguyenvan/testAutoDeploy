/*

User Service

Wrapper for interacting with the underlying user management mechanism.  Enables conforming of the data response
as well as enhancement of that data for use in this application.

-  getByEmail

*/
'use strict';

import stormpathService from './stormpathService';

export default {

	/**
	 * Get list of users, can be filtered with options. Link to options description:
	 * @link http://docs.stormpath.com/nodejs/api/application#getAccounts
	 * @param {object} options
	 * @returns {Promise}		- resolved based upon a successful getUsers event.
     */
	getUsers(options) {
		return stormpathService.getUsers(options);
	},

	/**
	 * getByEmail
	 *
	 * Get Strompath user data by email
	 *
	 * @param {string}  email	- user email address
	 * @return {Promise}		- resolved based upon a successful getByEmail event.
	 */
	getByEmail(email) {
		return stormpathService.getUserByEmail(email);
	},

	/**
	 * getById
	 *
	 * Get Strompath user data by id
	 *
	 * @param {string}  id		- user id
	 * @return {Promise}		- resolved based upon a successful getById event.
	 */
	getById(id) {
		return stormpathService.getUserById(id);
	},

	/**
	 *
	 * Creates new user
	 *
	 * @param {object} user
	 * @returns {Promise}
	 */
	create(user) {
		return stormpathService.create(user);
	},

	/**
	 *
	 * Updates user data
	 *
	 * @param {object} user
	 * @returns {Promise}
     */
	update(user) {
		return stormpathService.update(user);
	},

	/**
	 * Deletes user by id
	 * @param {int} id
	 * @returns {Promise}
     */
	deleteById(id) {
		return stormpathService.delete(id);
	}
};
