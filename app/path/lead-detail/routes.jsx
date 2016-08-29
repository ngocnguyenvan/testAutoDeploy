/*

Routes for the authenticated user area.

*/
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import { Route, IndexRedirect, IndexRoute } from 'react-router';
import Layout from './layout';
import LeadAddContainer from './components/LeadAddContainer';
import ReadOnlyLeadDetailsContainer from './components/ReadOnlyLeadDetailsContainer';
import { authenticationRequired } from '../../utils/routeUtil';
import LeadPushNotification from './components/LeadPushNotification';
import ReadOnlyLeadDetails from './components/ReadOnlyLeadDetails';
export default function generateRoutes( req ) {
	return <Route path="lead-detail" component={ Layout }>
		<Route path="add" component={ LeadAddContainer } onEnter={ authenticationRequired.bind(this, req) } />
		<Route path=":uuid" component={ ReadOnlyLeadDetailsContainer} onEnter={ authenticationRequired.bind(this, req) } >
			<IndexRoute component={ReadOnlyLeadDetails}/>
			<Route path="push-notification" component={ LeadPushNotification } onEnter={ authenticationRequired.bind(this, req) } />
		</Route>
		<IndexRedirect to="/" />
	</Route>;
}
