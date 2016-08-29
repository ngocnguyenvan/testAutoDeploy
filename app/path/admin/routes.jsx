/*

Routes for the authenticated user area.

*/
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import objectPath from 'object-path';
import { Route, IndexRedirect } from 'react-router';

import Layout from './layout';
import userRoutes from './path/user/routes';

export default function generateRoutes( props ) {
	var rootPath = objectPath.get( props, 'path', '/' );
	return <Route
		path={ rootPath }
		component={( props2 ) => {
			return <Layout rootPath={ rootPath } { ...props2 } />;
		}}
		{ ...props }
	>
		{ userRoutes({
			path: 'user'
		}) }
		<IndexRedirect to="user" />
	</Route>;
}
