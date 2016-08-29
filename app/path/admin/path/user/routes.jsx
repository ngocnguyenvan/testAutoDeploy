/*

Routes for the users sections

*/
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import objectPath from 'object-path';
import { Route, IndexRoute } from 'react-router';

import Layout from './layout';
import UsersListContainer from './components/UsersListContainer';

export default function generateRoutes( props ) {
	var rootPath = objectPath.get( props, 'path', '/' );
	return <Route
		path={ rootPath }
		component={( props2 ) => {
			return <Layout rootPath={ rootPath } { ...props2 } />;
		}}
		{ ...props }
	>
		<IndexRoute component={ UsersListContainer } />
	</Route>;
}
