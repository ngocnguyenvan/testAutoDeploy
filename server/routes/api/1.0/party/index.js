/*

Party Routes

Routes relating to partys search and retrieving details, add, removal

*/
'use strict';

import { Router } from 'express';

import errorService from '../../../../services/errorService';
import partyService from '../../../../services/partyService';

export default Router()

	/**
	 *
	 * authenticateRoute
	 *
	 * [ TODO ] Ensure permission based access.  User can only access websites for parties they are associated.
	 *
	 */
	.use( '/:partyId', function authenticateRoute( res, re, next ) {
		next();
	})

	.get( '/', function( req, res ) {
		var options = req.query;
		if ( options.sort ) {
			options.sort = JSON.parse( options.sort );
		}
		if ( options.filter ) {
			options.filter = JSON.parse( options.filter );
		}
		partyService.getPartyList( options, req.ylopoSession )
			.then( ( partyList ) => {
				res
					.status( 200 )
					.json( partyList );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})

	.post( '/', function( req, res ) {
		partyService.createParty( req.body, req.ylopoSession )
			.then( ( party ) => {
				res
					.status( 200 )
					.json( party );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})


	.get( '/:partyId', function( req, res ) {
		partyService.getPartyById( req.params.partyId, req.query, req.ylopoSession )
			.then( ( party ) => {
				res
					.status( 200 )
					.json( party );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})

	.post( '/:partyId', function( req, res ) {
		partyService.updatePartyById( req.params.partyId, req.body, req.ylopoSession )
			.then( ( party ) => {
				res
					.status( 200 )
					.json( party );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})

	.delete( '/:partyId', function( req, res ) {
		partyService.deletePartyById( req.params.partyId, req.ylopoSession )
			.then( () => {
				res
					.status( 200 )
					.json();
			});
	});
