/*

My Account Routes

Routes relating to current user

-  GET /

*/
'use strict';

import { Router } from 'express';

import userService from '../../../../services/userService';
import errorService from '../../../../services/errorService';

var router = Router();

/**
 * Returns the current active session
 */
router.get( '/', function( req, res ) {
	var accountData = req.ylopoSession.getAccountData();
	if ( accountData ) {
		userService.getById(accountData.id)
			.then(( user ) => {
				res.status( 200 )
					.json( user );
			})
			.catch(( error ) => {
				errorService.respondWithError({
					res: res,
					status: error.code,
					error: error
				});
			});
	}
	else {
		errorService.respondWithError({ res: res, status: 403, clientMessage: 'Unauthorized' });
	}
});

/**
 * Updates current user data
 */
router.post('/', function(req, res) {
	// Secured route, it always has req.ylopoSession and accountData
	var accountData = req.ylopoSession.getAccountData();
	var user = req.body;
	user.emailAddress = accountData.emailAddress; // Ensure we are changing current user

	userService.update(user)
		.then(( userFromResult ) => {
			res.status( 200 )
				.json( userFromResult );
		})
		.catch(( error ) => {
			errorService.respondWithError({
				res: res,
				status: error.code,
				error: error
			});
		});
});

export default router;
