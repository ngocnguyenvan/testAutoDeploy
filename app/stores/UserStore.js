'use strict';

import AppDispatcher from '../AppDispatcher';
import { EventEmitter } from 'events';
import { ServerStatuses, ActionTypes, StoreDebounceRate } from '../Constants';
import { map, assign, debounce } from 'lodash';
import { checkPermission } from '@ylopo/utils/dist/lib/security';

var events = new EventEmitter();
var CHANGE_EVENT = 'CHANGE';

var state = {
	serverStatus: ServerStatuses.READY,
	serverMessage: undefined,

	fullName: undefined,
	emailAddress: undefined,
	password: undefined,
	confirmPassword: undefined,
	agreeToTerms: false,
	authenticated: false
};

/**
 * initialize
 *
 * creates the initial user based upon passed in data.
 *
 * @param {object} initialState - state initial state of this store
 * @returns {void}
 */
function initialize( initialState ) {
	// do not emit a change as this should happen in "client".
	assign(
		state,
		initialState
	);
}

function emitChange() {
	events.emit( CHANGE_EVENT );
}

var debouncedChange = debounce( emitChange, StoreDebounceRate );

function setState( newState ) {
	assign( state, newState );
	debouncedChange();
}

function registerUser( user ) {
	user.serverStatus = ServerStatuses.PROCESSING;
	user.serverMessage = undefined;
	setState( user );
}

function loginSuccess( user ) {
	user.serverStatus = ServerStatuses.SUCCESS;
	user.serverMessage = undefined;
	user.authenticated = true;
	setState( user );
}

function actionInProgress() {
	setState({
		serverStatus: ServerStatuses.PROCESSING,
		serverMessage: undefined
	});
}

function actionFailed( error ) {
	if (error.errorList) {
		error = map(error.errorList, (e) => e.message).join('\n');
	}
	setState({
		serverStatus: ServerStatuses.FAIL,
		serverMessage: error
	});
}

var UserStore = {

	addChangeListener( fn ) {
		events.addListener( CHANGE_EVENT, fn );
	},

	removeChangeListener( fn ) {
		events.removeListener( CHANGE_EVENT, fn );
	},

	isAuthenticated() {
		return state.authenticated;
	},

	checkPermission(options) {
		return checkPermission(options, state);
	},

	getState() {
		return state;
	},

	resetServerMessages() {
		setState({
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined
		});
	},

	initialize: initialize
};

UserStore.dispatchToken = AppDispatcher.register(function( payload ) {
	switch ( payload.type ) {
		case ActionTypes.USER_REGISTER:
			registerUser( payload.user );
			break;
		case ActionTypes.USER_UPDATE_SUCCESS:
		case ActionTypes.SESSION_LOAD_SUCCESS:
		case ActionTypes.LOGIN_SUCCESS:
			loginSuccess( payload.user );
			break;
		case ActionTypes.LOGIN:
			actionInProgress();
			break;
		case ActionTypes.USER_REGISTER_FAILED:
		case ActionTypes.USER_UPDATE_FAILED:
		case ActionTypes.LOGIN_FAILED:
			actionFailed( payload.error );
			break;
		default:
			break;
	}
});

export default UserStore;
