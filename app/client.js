/* global document, window */
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import objectPath from 'object-path';

import loggingUtil from './utils/loggingUtil';
loggingUtil.initialize( objectPath.get( window, '__YLOPO_SITE_CONTENT__.version' ) );

import applicationActions from './actions/applicationActionCreators';
import history from './history';
import { ServerStatuses } from './Constants';
import { get, attachResponseInterceptor } from './utils/api';

import getRoutes from './routes';
import Loader from './components/core/Loader';

// initialize/instantiate dependencies
injectTapEventPlugin();
initializeAuthenticationCheck( history );

var rootElement = document.getElementById( 'app' );

// TODO rendering must match server rendering
// Render full screen loader
ReactDOM.render( <Loader fullScreen={ true }
						 status={ ServerStatuses.LOADING }
						 className="application-loader" />, rootElement );

// Load user session
applicationActions
	.initApplication()
	.then(() => {
		ReactDOM.render(
			<Router
				routes={ getRoutes() }
				history={ history }
			/>,
			rootElement
		);
	});


/**
 * initializeAuthenticationCheck
 *
 * Defines an inteceptor on all of the the ajax requests.
 * When 401 or 403 is received from an ajax response user is redirected to the `/auth` route.
 *
 * @param {object} historyObj
 * @returns {void}
 */
function initializeAuthenticationCheck( historyObj ) {
	// Check every hour
	setInterval(() => {
		get( '/auth/isAuthenticated' )
			.catch(() => {});
	}, 60 * 60 * 1000); // 1 hour is ms

	// Initialize response interceptor to catch broken/expired session
	attachResponseInterceptor(
		(response) => response,
		(error) => {
			// Redirect to login page if session is broken or expired and in the "secured" area
			if ( ( error.status === 401 || error.status === 403 ) &&
				document.location.pathname.indexOf( '/admin' ) !== -1 &&
				objectPath.get( error, 'config.url' ) !== '/api/1.0/myAccount'
			) {
				historyObj.push({
					pathname: '/auth',
					search: '?redirect=' + encodeURIComponent( document.location.pathname )
				});
			}
			else {
				return Promise.reject(error);
			}
		});
}
