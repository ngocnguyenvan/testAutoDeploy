/**
 *
 * Services specifically responsible for handling and returning errors
 *
 */
'use strict';
import { get, post, del } from '../lib/api';
import config from 'config';
import { merge } from 'lodash';
var apiUrl = config.get( 'mfBusiness.apiUrl' );

export default {

	getSavedList: function( personId, callback ) {
		get(
			`${apiUrl}/api/1.0/push/${personId}/results`
		)
			.then(( response ) => {
				callback( response.data );
			})
			.catch((response) => {
				callback( [] );
			});
	},

	createSavedList: function( personId, options, callback ) {
		post(
			`${apiUrl}/api/1.0/push/${personId}/results`, options
		)
			.then((response) =>{
				callback(response.data);
			})
			.catch((response) => {
				callback( [] );
			});
	},

	deleteSavedList: function( personId, savedListId) {
		del(
			`${apiUrl}/api/1.0/push/${personId}/results/${savedListId}`
		)
			.then((response) =>{
				return response;
			});
	}
};
