/*

Client Service

Wrapper for interacting with the clients

- getClients
- getById
- create
- updateById
- deleteById

*/
'use strict';

import { getYlopoIdentityHeaders } from '@ylopo/utils/dist/lib/security/serverApi';
import { formatAndRethrowError, get, post, del } from './../lib/api';
import config from 'config';

var apiUrl = config.get( 'mfBusiness.apiUrl' );

export default {

	/**
	 * Get fileterd list of clients
	 * Options are {
	 * 		page: 0,
	 *		limit: 30,
	 *		sort: [
	 *			{ creationDate: "asc" } // or "desc"
	 *		],
	 *		filter: {
	 *			type: ["realEstateLead"],
	 *			status: ["hot", "warm"]
	 *		}
	 *	}
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getClients: function(options, ylopoSession) {
		// Compatibility with current mf-business-api
		if (options.sort && Object.keys(options.sort).length > 0) {
			options.sort = Object.keys(options.sort)[0];
		}
		return get(`${apiUrl}/api/1.0/client`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get client data by id
	 * @param {int} clientId
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getById: function(clientId, options, ylopoSession) {
		clientId = Number(clientId);
		if (options.include && Array.isArray(options.include)) {
			options.include = options.include.join(',');
		}
		return get(`${apiUrl}/api/1.0/client/${clientId}`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Create new client
	 * @param {options} data
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	create: function(data, ylopoSession) {
		if (data.active === undefined) {
			data.active = true;
		}
		/* eslint-disable camelcase */
		data.create_user_id = config.mfBusiness.internalApplicationId;
		data.update_user_id = config.mfBusiness.internalApplicationId;
		/* eslint-enable camelcase */

		return post(`${apiUrl}/api/1.0/client`, data, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Updates exist client
	 * @param {int} clientId
	 * @param {options} data
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	updateById: function(clientId, data, ylopoSession) {
		/* eslint-disable camelcase */
		data.update_user_id = config.mfBusiness.internalApplicationId;
		/* eslint-enable camelcase */

		return post(`${apiUrl}/api/1.0/client/${clientId}`, data, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Delete client by id
	 * @param {int} clientId
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	deleteById: function(clientId, ylopoSession) {
		return del(`${apiUrl}/api/1.0/client/${clientId}`, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	}

};
