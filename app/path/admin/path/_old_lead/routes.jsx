/*

Routes for the lead sections

*/
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import objectPath from 'object-path';
import { Route, IndexRoute } from 'react-router';

import Layout from './layout';
import LeadDetailsContainer from './components/LeadDetailsContainer';
import LeadSearchDetails from '../../../../components/lead/LeadSearchDetails';
import LeadList from './components/LeadList';

export default function generateRoutes( props ) {
	var rootPath = objectPath.get( props, 'path', '/' );
	return <Route
		path={ rootPath }
		component={( props2 ) => {
			return <Layout rootPath={ rootPath } { ...props2 } />;
		}}
		{ ...props }
	>
		<IndexRoute component={ LeadList } />
		<Route path=":leadId">
			<IndexRoute component={ LeadDetailsContainer } />
			<Route path="search">
				<Route path="create" component={ LeadSearchDetails } />
				<Route path=":searchId" component={ LeadSearchDetails } />
			</Route>
		</Route>
	</Route>;
}
