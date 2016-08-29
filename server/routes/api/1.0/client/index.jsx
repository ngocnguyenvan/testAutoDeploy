/*

Client Routes

Routes relating to clients search and retrieving details, add, removal

-  /
-  /:clientId
- POST
- DELETE /:clientId

*/
'use strict';

import { Router } from 'express';

import errorService from '../../../../services/errorService';
import clientService from '../../../../services/clientService';

var router = Router();

router.get( '/', function( req, res ) {
	var options = req.query;
	if (options.sort) {
		options.sort = JSON.parse(options.sort);
	}
	clientService.getClients(options, req.ylopoSession)
		.then( ( clients ) => {
			res
				.status( 200 )
				.json( clients );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:clientId', function( req, res ) {
	var clientId = req.params.clientId;
	var options = req.query;
	clientService.getById(clientId, options, req.ylopoSession)
		.then( ( client ) => {
			res
				.status( 200 )
				.json( client );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.post( '/', function( req, res ) {
	var data = req.body;
	clientService.create(data, req.ylopoSession)
		.then( ( client ) => {
			res
				.status( 200 )
				.json( client );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.post( '/:clientId', function( req, res ) {
	var clientId = req.params.clientId;
	var data = req.body;
	clientService.updateById(clientId, data, req.ylopoSession)
		.then( ( client ) => {
			res
				.status( 200 )
				.json( client );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.delete( '/:clientId', function( req, res ) {
	var clientId = req.params.clientId;
	clientService.deleteById(clientId, req.ylopoSession)
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
