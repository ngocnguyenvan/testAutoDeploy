/*

Auth Routes

Routes relating to authenticating and de-authenticating user

-  login
-  logout

*/
'use strict';

import { Router } from 'express';

import authService from '../../../../services/authService';
import errorService from '../../../../services/errorService';

var router = Router();

router.get( '/isAuthenticated', function( req, res ) {
	if ( req.ylopoSession.isAuthenticated() ) {
		res
			.status( 200 )
			.end();
	}
	else {
		errorService.respondWithError({ res: res, status: 401, clientMessage: 'Not authenticated' });
	}
});

router.post( '/login', function( req, res ) {
	authService.authenticate({
		emailAddress: req.body.emailAddress,
		password: req.body.password
	})
		.then( ( account ) => {
			return req.ylopoSession.initialize( account )
				.then(function() {
					res
						.status( 200 )
						.json( account );
				});
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.post( '/logout', function( req, res ) {
	req.ylopoSession.deInitialize()
		.then( () => {
			res
				.status( 200 )
				.end();
		})
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/* router.post( '/register', function( req, res ) {
	var user = req.body;
	authService.register(user)
		.then( ( createdUser ) => {
			res
				.status( 200 )
				.json(createdUser);
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});*/

router.post( '/resetPassword', function( req, res ) {
	authService.resetPassword({
		email: req.body.email
	})
		.then( () => {
			res
				.status( 200 )
				.end();
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

export default router;
