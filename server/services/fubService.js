'use strict';

import Promise from 'bluebird';
import superagent from 'superagent';
import constants from '@ylopo/models-constants';
import config from 'config';

import leadService from './leadService';

var fubApiUrl = config.get( 'fub.apiUrl' );

var debug = require('debug')('ylopo:stars:services:fubService');

export default {
	/**
	 * Get FollowUpBoss Person info
	 * @param {number} personId
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @return {Promise}
     */
	getFubInfo: function(personId, options = {}, ylopoSession) {
		var fubURL;
		return this._getPersonFubIntegrationAttributes(personId, options, ylopoSession)
			.then(integrationAttributes => {
				fubURL = integrationAttributes.fubURL;
				return this._getLeadFromFub(integrationAttributes.integrationLeadId, integrationAttributes.apiKey);
			})
			.then(fubInfo => {
				// Merge our fubURL into the result as well.
				fubInfo.yFubURL = fubURL;
				return fubInfo;
			});
	},

	/**
	 * Update FollowUpBoss Person info. Patch update
	 * @param {number} personId
	 * @param {object} data
	 * @param {object} ylopoSession
	 * @return {Promise}
	 */
	updateFubInfo: function(personId, data, options = {}, ylopoSession) {
		return this._getPersonFubIntegrationAttributes(personId, options, ylopoSession)
			.then(integrationAttributes => {
				return this._updateFubLead(integrationAttributes.integrationLeadId, integrationAttributes.apiKey, data);
			})
			.then(fubInfo => {
				return fubInfo;
			});
	},

	_getPersonFubIntegrationAttributes(personId, options = {}, ylopoSession) {
		return leadService.getLeadIntegrations(personId, options, ylopoSession)
			.then((result) => {
				if (!result.leads || !result.leads.length) {
					let err = new Error(`Cannot find any leads for person ${personId}`);
					err.status = 404;
					return Promise.reject(err);
				}

				var apiKey;
				var integrationLeadId;
				var fubURL;
				var successStatus = constants.LeadIntegrationStatus.SUCCESS;
				var fubType = constants.IntegrationType.FOLLOW_UP_BOSS;

				result.leads.forEach( function(lead) {
					lead.leadIntegrations.forEach( function(integration) {
						if (integration.status === successStatus && integration.clientIntegration.type === fubType) {
							integrationLeadId = integration.integrationLeadId;
							apiKey = integration.clientIntegration.integrationAttributes.apiKey;
							fubURL = integration.clientIntegration.integrationAttributes.fubURL;
						}
					});
				} );

				if (!apiKey) {
					let err = new Error(`No successful FUB integrations found for person ${personId}`);
					err.status = 404;
					return Promise.reject(err);
				}

				return {
					integrationLeadId: integrationLeadId,
					apiKey: apiKey,
					fubURL: fubURL
				};
			});
	},

	/**
	 * Make api call to FUB to retrieve lead info.
	 * @param {number} integrationLeadId
	 * @param {string} apiKey
	 * @return {Promise}
     */
	_getLeadFromFub: function(integrationLeadId, apiKey) {
		let url = fubApiUrl + '/v1/people/' + integrationLeadId;
		debug('Getting fub person from url=' + url);

		return Promise.fromCallback(cb => {
			superagent
				.get( url )
				.type( 'json' )
				.auth( apiKey )
				.end(cb);
		}).then(res => {
			return res.body;
		});
	},

	/**
	 * Make api call to FUB to path update lead info.
	 * @param {number} integrationLeadId
	 * @param {string} apiKey
	 * @param {object} data
	 * @returns {BPromise}
	 */
	_updateFubLead: function(integrationLeadId, apiKey, data) {
		let url = fubApiUrl + '/v1/people/' + integrationLeadId;
		debug('Updating fub person, url=' + url);

		return Promise.fromCallback(cb => {
			superagent
				.put(url)
				.send(data)
				.type('json')
				.auth(apiKey)
				.end(cb);
		}).then(res => {
			return res.body;
		});
	}
};
