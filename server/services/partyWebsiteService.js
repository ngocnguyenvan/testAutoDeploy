/*

Party Website Service

Wrapper for interacting with the party websites

- getWebsites

*/
'use strict';

import Promise from 'bluebird';
import objectPath from 'object-path';
import { getYlopoIdentityHeaders } from '@ylopo/utils/dist/lib/security/serverApi';
import { formatAndRethrowError, get, post, del } from './../lib/api';
import config from 'config';
import S3Service from './S3Service';

var apiUrl = config.get( 'mfBusiness.apiUrl' );

export default {

	getWebsiteList: function(options, ylopoSession) {
		// Compatibility with current mf-business-api
		if (options.filter && options.filter.partyId) {
			if (Array.isArray(options.filter.partyId)) {
				options.party = options.filter.partyId.join(',');
			}
			else {
				options.party = options.filter.partyId;
			}
		}
		return get(`${apiUrl}/api/1.0/party-website`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Get website by id
	 * @param {int} websiteId
	 * @param {object} options
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	getWebsiteById: function(websiteId, options, ylopoSession) {
		return get(`${apiUrl}/api/1.0/party-website/${websiteId}`, {
			params: options,
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Delete website by id
	 * @param {int} websiteId
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	deleteWebsiteById: function(websiteId, ylopoSession) {
		return del(`${apiUrl}/api/1.0/party-website/${websiteId}`, {
			headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
		})
			.then((result) => {
				return result.data;
			})
			.catch(formatAndRethrowError);
	},

	/**
	 * Create new website
	 * Files are uploaded to S3, S3 object url saved to path specified in files array key.
	 * Example:
	 *   files = [ "content.clientDetails.imageSrc" = { ... file stuff } ]
	 * Then:
	 *   data.content.clientDetails.imageSrc = uploaded s3 file url
	 * @param {object} data
	 * @param {Array} files
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	createWebsite: function(data, files = [], ylopoSession) {
		if (data.active === undefined) {
			data.active = true;
		}

		/* eslint-disable camelcase */
		data.create_user_id = config.mfBusiness.internalApplicationId;
		data.update_user_id = config.mfBusiness.internalApplicationId;
		/* eslint-enable camelcase */

		return Promise.map(files, (fileInfo) => {
			return S3Service.uploadFile(fileInfo).then((url) => {
				return {
					path: fileInfo.fieldname,
					url: url
				};
			});
		}).then((results) => {
			for (var i = 0; i < results.length; i++) {
				objectPath.set(data, results[i].path, results[i].url);
			}
		}).then(() => {
			return post(`${apiUrl}/api/1.0/party-website`, data, {
				headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
			})
				.then((result) => {
					return result.data;
				})
				.catch(formatAndRethrowError);
		});
	},

	/**
	 * Updates existing website
	 * Files are uploaded to S3, S3 object url saved to path specified in files array key.
	 * Example:
	 *   files = [ "content.clientDetails.imageSrc" = { ... file stuff } ]
	 * Then:
	 *   data.content.clientDetails.imageSrc = uploaded s3 file url
	 * @param {int} websiteId
	 * @param {object} data
	 * @param {Array} files
	 * @param {object} ylopoSession
	 * @returns {Promise}
	 */
	updateWebsiteById: function(websiteId, data, files = [], ylopoSession) {
		// data.update_user_id = config.mfBusiness.internalApplicationId;

		return Promise.map(files, (fileInfo) => {
			return S3Service.uploadFile(fileInfo).then((url) => {
				return {
					path: fileInfo.fieldname,
					url: url
				};
			});
		}).then((results) => {
			for (var i = 0; i < results.length; i++) {
				objectPath.set(data, results[i].path, results[i].url);
			}
		}).then(() => {
			return post(`${apiUrl}/api/1.0/party-website/${websiteId}`, data, {
				headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
			})
				.then((result) => {
					return data;
				 })
				.catch(formatAndRethrowError);
		});
	}
};
