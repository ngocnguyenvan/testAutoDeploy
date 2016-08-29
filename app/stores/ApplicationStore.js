'use strict';

import AppDispatcher from '../AppDispatcher';
import { EventEmitter } from 'events';
import { ActionTypes, StoreDebounceRate } from '../Constants';
import { assign, debounce } from 'lodash';

var events = new EventEmitter();
var CHANGE_EVENT = 'CHANGE';

var state = {
	applicationLoaded: false
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

var ApplicationStore = {

	addChangeListener( fn ) {
		events.addListener( CHANGE_EVENT, fn );
	},

	removeChangeListener( fn ) {
		events.removeListener( CHANGE_EVENT, fn );
	},

	getState() {
		return state;
	},

	initialize: initialize
};

ApplicationStore.dispatchToken = AppDispatcher.register(function( payload ) {
	switch ( payload.type ) {
		case ActionTypes.LOADED_APPLICATION:
			setState({
				applicationLoaded: true
			});
			break;
		default:
			break;
	}
});

export default ApplicationStore;
