/*

Stormpath Service

Wrapper for interacting with Stormpath

*/
'use strict';

import Promise from 'bluebird';
import config from 'config';
import stormpath from 'stormpath';
import { assign, filter, flatten, sortBy, reverse } from 'lodash';
import objectPath from 'object-path';
var debug = require( 'debug' )( 'ylopo:stars:services:stormpath' );

var client = null;
var app = null;
const MAX_LIMIT = 100; // Max limit value supported by Stormpath API
const PLACEHOLDER_EMPTY_SURNAME = '<YLOPO_EMPTY>';

function convertStormpathError( error ) {
	return {
		status: error.status,
		error: {
			message: error.userMessage
		}
	};
}

function convertYlopoUserToStormpathAccount(user) {
	var returnVal = {};
	if (user.emailAddress) {
		returnVal.email = user.emailAddress;
	}
	if (user.customData) {
		returnVal.customData = user.customData;
	}
	if (user.fullName) {
		var fullNameParts = user.fullName.split(' ');
		if (fullNameParts.length > 2) {
			fullNameParts[1] = user.fullName.split(' ').slice(1).join(' ');
		}
		returnVal.givenName = fullNameParts[0];
		returnVal.surname = fullNameParts.length > 1 ? fullNameParts[1] : PLACEHOLDER_EMPTY_SURNAME;
		returnVal.fullName = user.fullName;
	}
	if (user.password) {
		returnVal.password = user.password;
	}
	if (user.directory) {
		returnVal.directory = user.directory;
	}
	return returnVal;
}

/**
 *
 * @param {object} stormpathUser
 * @returns {Promise}
 */
function convertStormpathAccountToYlopoUser(stormpathUser) {
	var idRegexMatch = stormpathUser.href.match(/v1\/accounts\/(.*)/);

	return new Promise((resolve, reject) => {
		stormpathUser.getCustomData(function(err, customData) {
			if (err) {
				debug("Error during stormpathUser.getCustomData", err);
				return reject(err);
			}

			var ylopoUser = {
				id: idRegexMatch && idRegexMatch[1],
				fullName: stormpathUser.givenName + (stormpathUser.surname === PLACEHOLDER_EMPTY_SURNAME ? '' :
					' ' + stormpathUser.surname),
				emailAddress: stormpathUser.email,
				customData: customData
			};

			if (stormpathUser.directory) {
				ylopoUser.directory = stormpathUser.directory.name;
			}

			return resolve(ylopoUser);
		});
	});
}

export default {

	/**
	 * init stormpath with settings from config
	 * @return {Promise}	- resolved based upon a successful init event.
	 */
	initialize() {
		var apiKey = new stormpath.ApiKey( config.get( 'stormpath.apiKey.id' ), config.get( 'stormpath.apiKey.secret' ) );
		client = new stormpath.Client({ apiKey: apiKey });
		return Promise.promisify( client.getApplications )({
			name: config.get( 'stormpath.appName' )
		})
			.then(( applications ) => {
				if ( applications.size !== 1 ) {
					// TODO refactor, move to Error object
					/* eslint-disable no-throw-literal */
					throw { code: 500, error: { message: 'No applications returned.' } };
					/* eslint-enable no-throw-literal */
				}

				app = applications.items[ 0 ];
				debug( 'Stormpath successfully initialized' );
				return app;
			})
			.catch(( error ) => {
				debug( 'Stormpath failed to initialize' );
				if ( error && error.userMessage ) {
					throw convertStormpathError( error );
				}
				else {
					throw error;
				}
			});
	},

	/**
	 * authenticate
	 *
	 * Authenticates based upon the passed in credentials.  Promise resolves with the Stormpath account object
	 *
	 * @param {object}  credentials   - username/password of this user
	 * @return {Promise}              - resolved based upon a successful authentication event.
	 */
	authenticate( credentials ) {
		return new Promise( ( resolve, reject ) => {
			var credentialsStormpath = {
				username: credentials.emailAddress,
				password: credentials.password
			};

			app.authenticateAccount(credentialsStormpath, function(err, result) {
				if (err) {
					return reject(convertStormpathError(err));
				}
				// If successful, you can obtain the account by calling result.getAccount:
				// This is cached and will return immediately without an API request.
				result.getAccount({ expand: getExpandParameter() }, function(err2, stormpathAccount) {
					if (err2) {
						return reject(convertStormpathError(err2));
					}
					convertStormpathAccountToYlopoUser(stormpathAccount)
						.then((ylopoUser) => resolve(ylopoUser))
						.catch((error) => reject(error));
				});
			});
		});
	},

	/**
	 * register
	 *
	 * Creates new Stormpath account with data from user object.  Promise resolves with the Stormpath account object
	 *
	 * @param {object}  user	- user object from UserStore
	 * @return {Promise}		- resolved based upon a successful createAccount event.
	 */
	create(user) {
		return new Promise( ( resolve, reject ) => {
			var { directory, ...stormpathUser } = convertYlopoUserToStormpathAccount(user);

			this._getDirectoryByName(directory)
				.then((directoryObj) => {
					directoryObj.createAccount(stormpathUser, { expand: getExpandParameter() }, function(err, stormpathAccount) {
						if (err) {
							debug("Error during create - app.createAccount", err);
							return reject(convertStormpathError(err));
						}
						debug('Stormpath account created', stormpathAccount);
						convertStormpathAccountToYlopoUser(stormpathAccount)
							.then((ylopoUser) => resolve(ylopoUser))
							.catch((error) => reject(error));
					});
				});
		});
	},

	/**
	 * update
	 *
	 * Updates Stormpath account with data from user object.  Promise resolves with the Stormpath account object
	 *
	 * @param {object}  user	- user object from UserStore
	 * @return {Promise}		- resolved based upon a successful save event.
	 */
	update(user) {
		function updateStormpathAccount(stormpathAccount, stormpathCustomData) {
			var { customData, ...userData } = convertYlopoUserToStormpathAccount(user);
			assign(stormpathAccount, userData);
			assign(stormpathCustomData, customData);

			// TODO try to remove callback hell
			return new Promise( ( resolve, reject ) => {
				stormpathAccount.save(function(err) {
					if (err) {
						debug("Error during update - stormpathAccount.save", err);
						return reject(convertStormpathError(err));
					}

					stormpathCustomData.save(function(err2) {
						if (err2) {
							debug("Error during update - stormpathCustomData.save", err2);
							return reject(convertStormpathError(err2));
						}

						convertStormpathAccountToYlopoUser(stormpathAccount)
							.then((ylopoUser) => resolve(ylopoUser))
							.catch((error) => reject(error));
					});
				});
			});
		}

		// TODO try to remove callback hell
		return new Promise( ( resolve, reject ) => {
			if (user.id) {
				client.getAccount(`https://api.stormpath.com/v1/accounts/${user.id}`, function(err, stormpathAccount) {
					if (err) {
						debug("Error during update - client.getAccount", err);
						return reject(convertStormpathError(err));
					}
					if (!stormpathAccount) {
						return reject();
					}

					stormpathAccount.getCustomData(function(err2, customData) {
						if (err2) {
							debug("Error during update - stormpathAccount.getCustomData", err2);
							return reject(err2);
						}

						return updateStormpathAccount(stormpathAccount, customData)
							.then((ylopoUser) => resolve(ylopoUser))
							.catch((error) => reject(error));
					});
				});
			}
			else {
				return reject("user id must be provided");
			}
		});
	},

	delete(id) {
		return new Promise( ( resolve, reject ) => {
			client.getAccount(`https://api.stormpath.com/v1/accounts/${id}`, function(err, stormpathAccount) {
				if (err) {
					return reject(convertStormpathError(err));
				}

				if (stormpathAccount) {
					stormpathAccount.delete(function(err2) {
						if (err2) {
							return reject(convertStormpathError(err2));
						}
						return resolve();
					});
				}
				else {
					return reject('Not found');
				}
			});
		});
	},

	/**
	 * resetPassword
	 *
	 * Resets password with Stormpath password reset workflow
	 * http://docs.stormpath.com/rest/product-guide/#reset-an-accounts-password
	 *
	 * @param {string}  email	- email of user to reset
	 * @return {Promise}		- resolved based upon a successful sendPasswordResetEmail event
	 */
	resetPassword(email) {
		return new Promise( ( resolve, reject ) => {
			app.sendPasswordResetEmail(email, function(err, token) {
				if (err) {
					return reject(convertStormpathError(err));
				}

				resolve();
			});
		});
	},

	/**
	 * getUserById
	 *
	 * Retrieves Stormpath user data by id
	 *
	 * @param {string} id			- id of user to get
	 * @return {Promise}			- resolved based upon a successful getUserById event
	 */
	getUserById(id) {
		return new Promise( ( resolve, reject ) => {
			client.getAccount(`https://api.stormpath.com/v1/accounts/${id}?expand=${getExpandParameter()}`, function(err, stormpathAccount) {
				if (err) {
					return reject(convertStormpathError(err));
				}

				if (stormpathAccount) {
					convertStormpathAccountToYlopoUser(stormpathAccount)
						.then((ylopoUser) => resolve(ylopoUser))
						.catch((error) => reject(error));
				}
				else {
					return reject('Not found');
				}
			});
		});
	},

	/**
	 * getUserByEmail
	 *
	 * Retrieves Stormpath user data by email
	 *
	 * @param {string} email		- email of user to get
	 * @return {Promise}			- resolved based upon a successful getUserByEmail event
     */
	getUserByEmail(email) {
		return new Promise( ( resolve, reject ) => {
			app.getAccounts({ email: email, expand: getExpandParameter() }, function(err, accounts) {
				if (err) {
					return reject(convertStormpathError(err));
				}

				if (accounts.size > 0) {
					var stormpathAccount = accounts.items[0];
					convertStormpathAccountToYlopoUser(stormpathAccount)
						.then((ylopoUser) => resolve(ylopoUser))
						.catch((error) => reject(error));
				}
				else {
					return reject(`User with email ${email} not found`);
				}
			});
		});
	},

	/**
	 * _getDirectoryByName
	 *
	 * Retrieves Stormpath directory by name
	 *
	 * @param {string} name		- name of directory to get
	 * @return {Promise}		- resolved based upon a successful _getDirectoryByName event
	 */
	_getDirectoryByName(name) {
		return new Promise( ( resolve, reject ) => {
			client.getDirectories({ name: name }, function(err, directories) {
				if (err) {
					return reject(convertStormpathError(err));
				}

				if (directories.size > 0) {
					var directory = directories.items[0];
					resolve(directory);
				}
				else {
					return reject(`Directory ${name} not found`);
				}
			});
		});
	},

	/**
	 * Get list of users, can be filtered with options. Link to options description:
	 * @link http://docs.stormpath.com/nodejs/api/application#getAccounts
	 * @param {object} options
	 * @param {int} options.limit
	 * @param {int} options.offset
	 * @returns {Promise}
     */
	getUsers(options) {
		// Loading all accounts, will deal with paging after filtering
		return this._getAllAccountsAsync()
			.then((accounts) => {
				return Promise.map(accounts, (account) => convertStormpathAccountToYlopoUser(account))
					.then((ylopoAcccounts) => {
						if (objectPath.get(options, 'filter.clientId')) {
							ylopoAcccounts = filter(ylopoAcccounts,
								(user) => !user.customData || Number(user.customData.clientId) === Number(options.filter.clientId));
						}
						if (objectPath.get(options, 'sort')) {
							ylopoAcccounts = sortBy(ylopoAcccounts, options.sort);
							if (objectPath.get(options, 'dir') === 'desc') {
								reverse(ylopoAcccounts);
							}
						}
						return ylopoAcccounts;
					});
			})
			.then((ylopoAccounts) => {
				// Paging
				return ylopoAccounts.slice(options.offset, options.limit);
			});
	},

	_getAccountsAsync(options) {
		return new Promise( ( resolve, reject ) => {
			app.getAccounts(assign({}, options, { expand: getExpandParameter() }), function(err, accounts) {
				if (err) {
					return reject(convertStormpathError(err));
				}
				return resolve(accounts);
			});
		});
	},

	_getAllAccountsAsync(options) {
		return this._getAccountsAsync(assign({}, options, { limit: MAX_LIMIT }))
			.then((accounts) => {
				// If we need more accounts than returned
				if (accounts.size > MAX_LIMIT) {
					var promisesToExecute = [accounts];
					for (var offset = MAX_LIMIT; offset <= accounts.size; offset += MAX_LIMIT) {
						promisesToExecute.push(this._getAccountsAsync(assign({}, options, { offset: offset, limit: MAX_LIMIT })));
					}
					return Promise.all(promisesToExecute)
						.then(function(accountsArrays) {
							return flatten(accountsArrays.map((array) => array.items));
						});
				}
				else {
					return accounts.items;
				}
			});
	},

	/**
	 * getApplication
	 *
	 * Returns the initialized stormpath application.
	 *
	 * @return {Object}
	 */
	getApplication() {
		return app;
	}
};

function getExpandParameter() {
	return "directory,groups";
}
