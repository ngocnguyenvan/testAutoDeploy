/* global document, window */
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import useRouterHistory from 'react-router/lib/useRouterHistory';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import qs from 'qs';

const createAppHistory = useRouterHistory( createBrowserHistory );
export var generateClientHistory = ()=> {
	return createAppHistory({
		parseQueryString: parseQueryString,
		stringifyQuery: stringifyQuery
	});
};

export function parseQueryString( queryString ) {
	return qs.parse( queryString );
}

export function stringifyQuery( query, options = { encode: true } ) {
	return qs.stringify( query, options );
}

// export "created" history in browser or compatible object
var history;
if ( process.env.BROWSER ) {
	history = generateClientHistory();
}
else {
	history = [];
}

export default history;
