/* global window */
/*

Interacting with `Raven`.  getSentry.com's logging tool

*/
'use strict';

import Raven from 'raven-js';


export function initialize( version ) {
	if ( process.env.NODE_ENV !== 'development' ) {
		Raven.config(
			'https://681e4a3e3e9a4a0ab827a9fa7cd9c464@app.getsentry.com/63943',
			{
				release: version
			}
		).install();
	}
}

export function logException( ex, context ) {
	Raven.captureException(
		ex,
		{
			extra: context
		}
	);

	if (window.console && console.error) {
		console.error( ex );
	}
}

export default {
	initialize,
	logException
};
