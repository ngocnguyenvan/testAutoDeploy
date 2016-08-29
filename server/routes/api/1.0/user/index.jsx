/*

User Routes

Routes relating to user

-  GET /

*/
'use strict';

import { Router } from 'express';

import userService from '../../../../services/userService';
import errorService from '../../../../services/errorService';

var router = Router();

/**
 * Get list of users
 */
router.get( '/', function( req, res ) {
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}
	userService.getUsers(options)
		.then(( users ) => {
			res.status( 200 )
				.json( users );
		})
		.catch(( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});

/**
 * Get user by id
 */
router.get( '/:id', function( req, res ) {
	var id = req.params.id;
	userService.getById(id)
		.then(( user ) => {
			res.status( 200 )
				.json( user );
		})
		.catch(( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});

/**
 * Create new user
 */
router.post( '/', function( req, res ) {
	var user = req.body;
	userService.create(user)
		.then( ( createdUser ) => {
			res
				.status( 200 )
				.json(createdUser);
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Update user
 */
router.post( '/:userId', function( req, res ) {
	var userId = req.params.userId;
	var user = req.body;
	user.id = userId;
	userService.update(user)
		.then(( userFromResult ) => {
			res.status( 200 )
				.json( userFromResult );
		})
		.catch(( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});

/**
 * Delete user
 */
router.delete( '/:userId', function( req, res ) {
	var userId = req.params.userId;
	userService.deleteById(userId)
		.then( () => {
			res
				.status( 200 )
				.json();
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

export default router;
