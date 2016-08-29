'use strict';

import { ActionTypes } from '../Constants';
import AppDispatcher from '../AppDispatcher';
import { get } from '../utils/api';

var actions = {
	initApplication: function() {
		// check and load the existing session
		return get( '/myAccount' )
			.then((user) => {
				AppDispatcher.handleAction({
					type: ActionTypes.SESSION_LOAD_SUCCESS,
					user: user
				});
			})
			.catch((error) => {
				AppDispatcher.handleAction({
					type: ActionTypes.SESSION_LOAD_FAILED,
					error: error
				});
			})
			.then(() => {
				AppDispatcher.handleAction({
					type: ActionTypes.LOADED_APPLICATION
				});
			});
	}
};

export default actions;
