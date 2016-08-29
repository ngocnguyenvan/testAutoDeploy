'use strict';
import { formatAndRethrowError, get, post, del } from '../lib/api';
import config from 'config';
var apiUrl = config.get( 'mfBusiness.apiUrl' );

export default {

	getSavedList: function( personId ) {
		return get(
			`${apiUrl}/api/1.0/person/${personId}/pushNotification/results`
		)
			.then(( response ) => {
				return response.data;
			})
			.catch((error) => {
				return error;
			});
	},

	createSavedList: function( personId, options ) {
		return post(
			`${apiUrl}/api/1.0/person/${personId}/pushNotification/results`, options
		)
			.then((response) =>{
				return response.data;
			})
			.catch((error) => {
				return error.data;
			});
	},

	deleteSavedList: function( personId, savedListId) {
		return del(
			`${apiUrl}/api/1.0/person/${personId}/pushNotification/results/${savedListId}`
		)
			.then((response) =>{
				return response;
			});
	}
};
