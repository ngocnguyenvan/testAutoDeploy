/*

Party Service

Wrapper for interacting with the parties

- getWebsites

*/
'use strict';

import { getYlopoIdentityHeaders } from '@ylopo/utils/dist/lib/security/serverApi';
import { formatAndRethrowError, get, post, del } from './../lib/api';
import config from 'config';

var apiUrl = config.get( 'mfBusiness.apiUrl' );

export default {

	getPartyList: function(options, ylopoSession) {
		// Compatibility with current mf-business-api
		if (options.sort && Object.keys(options.sort).length > 0) {
			options.sort = Object.keys(options.sort)[0];
		}
		// Compatibility with current mf-business-api
		if (options.filter && options.filter.partyId) {
			if (Array.isArray(options.filter.partyId)) {
				options.party = options.filter.partyId.join(',');
			}
			else {
				options.party = options.filter.partyId;
			}
		}
		return get( `${apiUrl}/api/1.0/party`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		} )
			.then(( result ) => {
				return result.data;
			})
			.catch( formatAndRethrowError );
	},

	/**
	 * Get party data by id
	 * @param {int} partyId
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	getPartyById: function(partyId, options, ylopoSession) {
		partyId = Number(partyId);
		if (options.include && Array.isArray(options.include)) {
			options.include = options.include.join(',');
		}
		return get(`${apiUrl}/api/1.0/party/${partyId}`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Create new party
	 * @param {object} data
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	createParty: function(data, ylopoSession) {
		if (data.active === undefined) {
			data.active = true;
		}

		return post(`${apiUrl}/api/1.0/party`, data, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Updates exist party
	 * @param {int} partyId
	 * @param {object} data
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	updatePartyById: function(partyId, data, ylopoSession) {
		return post(`${apiUrl}/api/1.0/party/${partyId}`, data, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Delete party by id
	 * @param {int} partyId
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	deletePartyById: function(partyId, ylopoSession) {
		return del(`${apiUrl}/api/1.0/party/${partyId}`, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			});
	}

};
