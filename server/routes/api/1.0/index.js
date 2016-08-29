'use strict';

import { Router } from 'express';
import errorService from '../../../services/errorService';
import logger from '@ylopo/service-logger';

import analyticRoutes from './analytics';
import authRoutes from './auth';
import openRoutes from './open';
import userRoutes from './user';
import myAccountRoutes from './myAccount';
import leadRoutes from './lead';
import clientRoutes from './client';
import listingRoutes from './listing';
import savedListRoutes from'./savedList';
import mapsearchRoutes from'./mapsearch';
import partyRoutes from './party';
import partyWebsiteRoutes from './partyWebsite';
import { checkPermission, directoryConstants } from '@ylopo/utils/dist/lib/security';

export default Router()

	.use( disableBrowserCache )
	.use( '/auth', authRoutes )
	// All routes below here are secured...
	.use( secureRoutes )
	.use( '/open', openRoutes )
	.use( '/myAccount', myAccountRoutes )
	.use( '/lead', leadRoutes )
	.use( '/client', clientRoutes )
	.use( '/listing', listingRoutes )
	.use( '/party', partyRoutes )
	.use( '/party-website', partyWebsiteRoutes )
	.use( '/analytics', analyticRoutes )
	.use( '/savedList', savedListRoutes)
	.use( '/mapsearch', mapsearchRoutes)
	// All routes below here are for users with Directory=Administrators only...
	.use( adminRoutes )
	.use( '/user', userRoutes )
	.all( '/*', function( req, res ) {
		res.status( 404 );
		res.json({
			errorList: [
				{
					code: '404',
					message: 'API route not found'
				}
			],
			path: req.path
		});
	})
	.use(errorHandler);

function secureRoutes( req, res, next ) {
	if ( typeof req.ylopoSession.isAuthenticated === 'function' && req.ylopoSession.isAuthenticated() ) {
		next();
	}
	else {
		errorService.respondWithStandardError( res, null, 'UNAUTHORIZED' );
	}
}

function adminRoutes( req, res, next ) {
	if (checkPermission({
		directory: directoryConstants.DIRECTORY_ADMINISTRATORS
	}, req.ylopoSession.getAccountData())) {
		next();
	}
	else {
		errorService.respondWithStandardError( res, null, 'UNAUTHORIZED' );
	}
}

function disableBrowserCache( req, res, next) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	next();
}

function errorHandler(err, req, res, next) {
	logger.error("Error in global error handler", err);
	res.status(500).send();
}
