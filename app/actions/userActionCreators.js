/*

User Action Creators

Actions relating to user data

-  update

*/
'use strict';

import { ActionTypes } from '../Constants';
import AppDispatcher from '../AppDispatcher';
import { post } from '../utils/api';

var actions = {

	updateUser: function( user ) {
		AppDispatcher.handleAction({
			type: ActionTypes.USER_UPDATE
		});

		post( '/myAccount',
			{},
			user
		)
			.then( actions.updateUserSuccess )
			.catch( actions.updateUserFailed );
	},

	updateUserSuccess: function(user) {
		AppDispatcher.handleAction({
			type: ActionTypes.USER_UPDATE_SUCCESS,
			user: user
		});
	},

	updateUserFailed: function( error ) {
		AppDispatcher.handleAction({
			type: ActionTypes.USER_UPDATE_FAILED,
			error: error
		});
	}
};

export default actions;
