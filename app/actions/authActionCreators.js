/*

Auth Action Creators

Actions relating to authenticating and de-authenticating the user

-  login
-  logout

*/
'use strict';

import { ActionTypes } from '../Constants';
import AppDispatcher from '../AppDispatcher';
import { post } from '../utils/api';

var actions = {
	login: function( credentials ) {
		AppDispatcher.handleAction({
			type: ActionTypes.LOGIN,
			credentials: credentials
		});

		post(
			'/auth/login',
			{},
			credentials
		)
			.then( actions.loginSuccess )
			.catch( actions.loginFailed );
	},

	loginSuccess: function( user ) {
		AppDispatcher.handleAction({
			type: ActionTypes.LOGIN_SUCCESS,
			user: user
		});
	},

	loginFailed: function( error ) {
		AppDispatcher.handleAction({
			type: ActionTypes.LOGIN_FAILED,
			error: error
		});
	},

	logout: function() {
		AppDispatcher.handleAction({
			type: ActionTypes.LOGOUT
		});

		post( '/auth/logout' )
			.then( actions.logoutSuccess )
			.catch( actions.logoutFailed );
	},

	logoutSuccess: function() {
		console.log( 'Success Logout' );
		window.location.href = window.location.origin;
	},

	logoutFailed: function(error) {
		console.log( 'Failed Logout' );
		console.log( error );
	},

	registerUser: function( user ) {
		AppDispatcher.handleAction({
			type: ActionTypes.USER_REGISTER,
			user: user
		});

		post( '/auth/register',
			{},
			user
		)
			.then(() => {
				actions.login(user);
			})
			.catch( actions.registerUserFailed );
	},

	registerUserFailed: function( error ) {
		AppDispatcher.handleAction({
			type: ActionTypes.USER_REGISTER_FAILED,
			error: error
		});
	}
};

export default actions;
