/*

 Enables the serving of isomorphic react.

 */
'use strict';

import { match } from 'react-router';
import createLocation from 'history/lib/createLocation';
import getRoutes from '../app/routes';
import logger from '@ylopo/service-logger';
import renderIndexDoc from './renderIndexDoc';


export default function processServerRoutes(req, res) {
	// Note that req.url here should be the full URL path from
	// the original request, including the query string.
	const location = createLocation(req.url);
	match({ routes: getRoutes(req), location: location }, (error, redirectLocation, renderProps) => {
		if (error) {
			logger.error(`Fatal: Server Route.  Location: ${ location }.  Error: `, error);
			res
				.status(500)
				.set('Content-Type', 'text/html')
				.send('');
		}
		else if (redirectLocation) {
			res.redirect(303, redirectLocation.pathname + redirectLocation.search);
		}
		else {
			if (!renderProps) res.status(404);
			renderIndexDoc(req, res);
		}
	});
}
