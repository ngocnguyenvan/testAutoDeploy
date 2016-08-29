/*

Lead Service

Interacting with Leads

*/
'use strict';

import Promise from 'bluebird';
import moment from 'moment';
import _, { sortBy, find } from 'lodash'; // Have to use global _ to get Array.reverse() method
import { getYlopoIdentityHeaders } from '@ylopo/utils/dist/lib/security/serverApi';
import { formatAndRethrowError, get, post, del } from './../lib/api';
import fubService from './fubService';
import amq from './../lib/amq';
import objectPath from 'object-path';
import config from 'config';
import logger from '@ylopo/service-logger';
import { SavedSearchType } from '@ylopo/models-constants';
import { merge } from 'lodash';

import ListingService from './listingService';

var apiUrl = config.get( 'mfBusiness.apiUrl' );

export default {

	/**
	 * Get fileterd list of leads
	 * Options are {
	 * 		page: 0,
	 *		limit: 30,
	 *		sort: [
	 *			{ creationDate: "asc" } // or "desc"
	 *		],
	 *		filter: {
	 *			clientId: [12345],
	 *			type: ["realEstateLead"],
	 *			status: ["hot", "warm"]
	 *		}
	 *	}
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getLeads: function(options = {}, ylopoSession) {
		// Compatibility with current mf-business-api
		var partyId = null;
		if (options.filter && options.filter.partyId && options.filter.partyId.length > 0) {
			partyId = options.filter.partyId[0];
		}

		if (!partyId) {
			return Promise.reject({
				code: 500,
				message: 'filter.partyId is required'
			});
		}

		return get(`${apiUrl}/api/1.0/people/${partyId}`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead data by id
	 * @param {int} leadId
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getLeadById: function(leadId, options = {}, ylopoSession) {
		leadId = Number(leadId);
		if (options.include && Array.isArray(options.include)) {
			options.include = options.include.join(',');
		}
		return get(`${apiUrl}/api/1.0/person/${leadId}`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead data by uuid
	 * @param {string} uuid
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getLeadByUuid: function(uuid, options, ylopoSession) {
		if (options.include && Array.isArray(options.include)) {
			options.include = options.include.join(',');
		}
		return get(`${apiUrl}/api/1.0/person/${uuid}`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead integrations
	 * @param {int} leadId
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getLeadIntegrations: function(leadId, options = {}, ylopoSession) {
		return get(`${apiUrl}/api/1.0/person/${leadId}/integrations`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead activity by Id
	 * @param {int} leadId
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getLeadActivity: function(leadId, options = {}, ylopoSession) {
		// Compatibility with current mf-business-api
		if (options.filter && options.filter.type && options.filter.type.length > 0) {
			options.type = options.filter.type[0];
		}
		return get(`${apiUrl}/api/1.0/person/${leadId}/activities`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				var sortedResult = sortBy(result.data, (obj) => moment(obj.creationDate));
				sortedResult.reverse();
				return sortedResult;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead listings viewed by id
	 * @param {number|string} leadId The Person ID
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	getListingsViewed: function(leadId, options, ylopoSession) {
		return get(`${apiUrl}/api/1.0/person/${leadId}/listings-viewed`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data.map( ( listing ) => {
					if (!listing.notExist) {
						return ListingService.formatListing(config.listing, listing);
					}
					else {
						return listing;
					}
				});
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead listings favorited by id
	 * @param {number|string} leadId The Person ID
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	getListingsFavorite: function(leadId, options, ylopoSession) {
		return get(`${apiUrl}/api/1.0/person/${leadId}/listings-favorite`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data.map( ( listing ) => {
					return ListingService.formatListing( config.listing, listing );
				});
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead statistics by id
	 * {
	 * 		avgPrice,
	 * 		lastVisitDate,
	 *		listingsViewed,
	 *		totalVisits
	 * }
	 * @param {number|string} leadId The Person ID
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	getStatistics: function(leadId, options, ylopoSession) {
		return get(`${apiUrl}/api/1.0/person/${leadId}/statistics`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get lead sessions details by id
	 * @param {number|string} leadId The Person ID
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	getSessions: function(leadId, options, ylopoSession) {
		return get(`${apiUrl}/api/1.0/person/${leadId}/sessions`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get person, optionally including saved searches if `options.include` dictates.
	 *
	 * Also convert any savedSearches with string s_locations into _object_ s_locations.
	 *
	 * @param {number|string} leadId Person Id or UUID
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @return {Promise}
	 * @todo refactor. Name is misleading. Only gets searches if `include` option dictates.
	 */
	getSavedSearches: function(leadId, options, ylopoSession) {
		return get(`${apiUrl}/api/1.0/person/${leadId}`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				if (objectPath.get(result, 'data.savedSearches')) {
					result.data.savedSearches = _
						.chain(result.data.savedSearches)
						.filter(el => !el.archivedAt)
						.sortBy(el => new Date(el.creationDate))
						.reverse()
						.map(this._parseSearchLocations)
						.value();
				}
				return result;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Load an individual saved search. And convert s_locations into object.
	 * @param {number|string} leadId Person ID or UUID.
	 * @param {number} searchId
	 * @param {object} ylopoSession
	 * @return {Promise}
     */
	getSavedSearch: function(leadId, searchId, ylopoSession) {
		return get(`${apiUrl}/api/1.0/person/${leadId}/savedSearch/${searchId}?include=searchAlerts`, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return this._parseSearchLocations(result.data);
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Given saved search, inspect params.s_locations and parse into regular JSON object if it's a string.
	 * @param {object} savedSearch
	 * @returns {object} saved search with parsed (to JSON) params.s_locations
	 * @private
     */
	_parseSearchLocations: function(savedSearch) {
		// Convert Stringified JSON s_locations to regular object
		/* eslint-disable camelcase */
		if (typeof objectPath.get(savedSearch, 'params.s_locations') === 'string') {
			savedSearch.params.s_locations = JSON.parse(savedSearch.params.s_locations);
		}
		/* eslint-enable camelcase */

		return savedSearch;
	},

	/**
	 * Create new person and publish message to amq to start new lead processing
	 * @param {object} person
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
     */
	createLead: function(person, options, ylopoSession) {
		person.createUserId = config.get('mfBusiness.internalApplicationId');

		return post(`${ apiUrl }/api/1.0/person`, person, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.catch((personCreateResponse) => {
				if (personCreateResponse.status === 409) {
					personCreateResponse.clientMessage = 'A user already exists with that email';
				}
				throw personCreateResponse;
			})
			.get('data')
			.tap((personCreateResponse) => {
				if (person.partyId) {
					var personId = objectPath.get(personCreateResponse, 'id');

					return amq.amqPublish(config.get('amqKickoffNewLead'),
						{
							personId: personId,
							partyId: person.partyId
						})
						.catch((err) => {
							logger.error(`Error submitting amq message to ${config.get('amqKickoffNewLead')}.  ` +
								`Person Id:[ ${ personId }, Party Id: [${ person.partyId }`, err );
							throw err;
						});
				}
			})
			// personCreateResponse is resolved
		.catch(formatAndRethrowError);
	},

	/**
	 * Update lead data. Patch update
	 * @param {int} leadId
	 * @param {object} updatedPerson
	 * @param {object} options
	 * @param {boolean} options.updateFubInfo - should corresponded FollowUpBoss person fields be updated
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	updateLead: function(leadId, updatedPerson, options, ylopoSession) {
		var { updateFubInfo, ...queryOptions } = options;

		return post(`${ apiUrl }/api/1.0/person/${leadId}`, updatedPerson, {
			params: queryOptions,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.catch((personUpdateResponse) => {
				if (personUpdateResponse.status === 409) {
					personUpdateResponse.clientMessage = 'A user already exists with that email';
				}
				throw personUpdateResponse;
			})
			.tap(() => {
				if (updateFubInfo) {
					if (updatedPerson.emailAddress) {
						return fubService.getFubInfo(leadId, {}, ylopoSession)
							.then((fubInfo) => {
								let email;
								if (fubInfo.emails) {
									if (fubInfo.emails.length > 1) {
										email = find(fubInfo.emails, fubEmail => fubEmail.isPrimary);
									}
									else if (fubInfo.emails.length === 1) {
										email = fubInfo.emails[0];
									}
								}
								if (email) {
									email.value = updatedPerson.emailAddress;
								}
								else {
									throw new Error(`Fub email address was not updated because was not found. Person id: ${leadId}, Fub emails: ${JSON.stringify(fubInfo.emails || [])} `);
								}

								return fubService.updateFubInfo(leadId, {
									emails: fubInfo.emails
								}, {}, ylopoSession);
							})
							.catch((err) => {
								// Lead may not have FuB integration, and it's normal case
								if (err.status !== 404) {
									throw err;
								}
							});
					};
				}
			})
			.get('data')
			// personUpdateResponse is resolved
			.catch(formatAndRethrowError);
	},

	/**
	 * Create saved search associated with person.
	 *
	 * Takes care to to convert s_locations to string.
	 *
	 * @param {number} leadId
	 * @param {object} data
	 * @param {object} options
	 * @param {object} ylopoSession
     * @return {Promise}
     */
	createSavedSearch: function(leadId, data, options, ylopoSession) {
		var payload = _.merge({}, data,
			{
				createUserId: config.get('mfBusiness.internalApplicationId'),
				type: SavedSearchType.agentDefined
			}
		);

		// Save params.s_locations as stringified JSON object.
		/* eslint-disable camelcase */
		if (typeof objectPath.get(payload, 'params.s_locations') === 'object') {
			payload.params.s_locations = JSON.stringify(payload.params.s_locations);
		}
		/* eslint-enable camelcase */

		return post(`${apiUrl}/api/1.0/person/${leadId}/savedSearch`, payload, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(processSavedSearchError);
	},

	/**
	 * Update a saved search. Take care to convert s_locations to string before saving.
	 *
	 * @param {number|string} leadId
	 * @param {number} searchId
	 * @param {object} data
	 * @param {object} options
	 * @param {object} ylopoSession
     * @return {Promise}
     */
	updateSavedSearch: function(leadId, searchId, data, options, ylopoSession) {
		var payload = _.merge({}, data, {
			type: SavedSearchType.agentDefined
		});

		// Save params.s_locations as stringified JSON object.
		/* eslint-disable camelcase */
		if (typeof objectPath.get(payload, 'params.s_locations') === 'object') {
			payload.params.s_locations = JSON.stringify(payload.params.s_locations);
		}
		/* eslint-enable camelcase */

		return post(`${apiUrl}/api/1.0/person/${leadId}/savedSearch/${searchId}`, payload, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(processSavedSearchError);
	},

	deleteSavedSearch: function(leadId, searchId, ylopoSession) {
		return del(`${apiUrl}/api/1.0/person/${leadId}/savedSearch/${searchId}`, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(processSavedSearchError);
	},

	createSearchAlert: function(data, options, ylopoSession) {
		return post(`${apiUrl}/api/1.0/searchAlert`, data, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	updateSearchAlert: function(alertId, data, options, ylopoSession) {
		return post(`${apiUrl}/api/1.0/searchAlert/${alertId}`, data, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	disableSearchAlert: function(alertId, ylopoSession) {
		/* eslint-disable camelcase */
		return post(`${apiUrl}/api/1.0/searchAlert/${alertId}`, {
			opt_out_method: 'stars',
			opt_out_date: new Date()
		}, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
		/* eslint-enable camelcase */
	},

	enqueueSearchAlert: function(alertId, ylopoSession) {
		return post(`${apiUrl}/api/1.0/searchAlert/${alertId}/enqueue`, {}, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.catch(formatAndRethrowError);
	},

	pushNotification: function(leadId, options) {
		options = merge(options, { createUserId: config.get('mfBusiness.internalApplicationId') });
		return post(
			`${apiUrl}/api/1.0/person/${leadId}/pushNotification/send`, options
		)
			.then((response) =>{
				return response.data;
			})
			.catch(formatAndRethrowError);
	}
};

function processSavedSearchError(err) {
	if ((objectPath.get(err, "data.message") || '').indexOf('duplicate key value violates unique constraint "saved_search_label_person_id_idx"') !== -1) {
		err.status = 409;
		err.clientMessage = 'Label should be unique';
	}
	throw err;
}
