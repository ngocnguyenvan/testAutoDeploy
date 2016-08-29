/*

Routes for the authenticated user area.

*/
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import objectPath from 'object-path';
import { Route, IndexRoute } from 'react-router';

import ForgotPassword from './path/forgotPassword';
import Layout from './layout';
import Login from './path/login';

export default function generateRoutes( props ) {
	var rootPath = objectPath.get( props, 'path', '/' );

	if ( !props.authenticationCheck ) {
		throw new Error( 'authenticationCheck Method Required' );
	}

	if ( !props.authenticatedGetDefaultRedirectPath ) {
		throw new Error( 'authenticatedGetDefaultRedirectPath is Required' );
	}

	return <Route
		path={ rootPath }
		component={( props2 ) => {
			return <Layout rootPath={ rootPath } { ...props2 } />;
		}}

		// redirect to authenticated route or previously requested route if authenticationCheck is true
		onEnter={( nextState, replace ) => {
			if ( props.authenticationCheck() ) {
				replace( objectPath.get( nextState, 'location.query.redirect' ) || props.authenticatedGetDefaultRedirectPath() );
			}
		}}
		{ ...props }
	>
		<IndexRoute component={Login} />
		<Route path="forgotPassword" component={ForgotPassword} />
		<Route path="login" component={Login} />
	</Route>;
}

generateRoutes.propTypes = {
	authenticationCheck: React.PropTypes.func.isRequired,
	authenticatedGetDefaultRedirectPath: React.PropTypes.func.isRequired
};
