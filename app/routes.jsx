'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import { Router, Route, IndexRoute } from 'react-router';
import { authenticatedGetDefaultRedirectPath,
	authenticationCheck,
	authenticationRequired,
	redirectToAuth,
	authenticationDefaultPath } from './utils/routeUtil';

import authRoutes from './path/auth/routes';
import adminRoutes from './path/admin/routes';
import leadRoutes from './path/lead-detail/routes';

import Application from './Application';
import NotFound from './path/notFound';
import IndexComponent from './path';

import UserStore from './stores/UserStore';
import { directoryConstants, checkPermission } from '@ylopo/utils/dist/lib/security';

var getRoutes = function(req) {
	return <Router>
		<Route path="/" component={ Application } >
			{ leadRoutes(req) }
			{ authRoutes({
				path: authenticationDefaultPath,
				authenticatedGetDefaultRedirectPath,
				authenticationCheck: authenticationCheck.bind(this, req)
			}) }
			{ adminRoutes({
				path: 'admin',
				onEnter: (nextState, replace) => {
					if (!process.env.BROWSER) {
						if (!req.ylopoSession || !req.ylopoSession.isAuthenticated()) {
							redirectToAuth(nextState, replace);
						}
						else if (!checkPermission({ directory: directoryConstants.DIRECTORY_ADMINISTRATORS }, req.ylopoSession.getAccountData())) {
							replace({
								pathname: "/"
							});
						}
					}
					else if (!UserStore.isAuthenticated()) {
						redirectToAuth(nextState, replace);
					}
					else if (!UserStore.checkPermission({ directory: directoryConstants.DIRECTORY_ADMINISTRATORS })) {
						replace({
							pathname: "/"
						});
					}
				}
			}) }
			<IndexRoute component={ IndexComponent } onEnter={ authenticationRequired.bind(this, req) } />
			<Route status={ 404 } path="*" component={ NotFound }/>
		</Route>
	</Router>;
};

export default getRoutes;
