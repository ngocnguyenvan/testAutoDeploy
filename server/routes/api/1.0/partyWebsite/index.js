/*

Party Website Routes

Routes relating to a specific party's website.  Assumes that the route has a param of partyId somewhere ie:
`.../:partyId/...`

-*/
'use strict';

import { Router } from 'express';
import multer from 'multer';

import errorService from '../../../../services/errorService';
import partyWebsiteService from '../../../../services/partyWebsiteService';

var upload = multer();

export default Router()

	.get( '/', function( req, res ) {
		var options = req.query;
		var ylopoSession = req.ylopoSession;
		if ( options.filter ) {
			options.filter = JSON.parse( options.filter );
		}
		partyWebsiteService.getWebsiteList( options, ylopoSession )
			.then( ( websites ) => {
				res
					.status( 200 )
					.json( websites );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})
	.get( '/byPartyId/:partyId', function( req, res) {
		var options = req.query;
		var partyId = req.params.partyId;
		var ylopoSession = req.ylopoSession;
		options.filter = {
			partyId: partyId
		}
		partyWebsiteService.getWebsiteList( options, ylopoSession )
			.then( ( websites ) => {
				var listAlertWebsiteId = 0;
				for (var i = 0; i < websites.length; i++) {
					if (websites[i].useForListingAlerts === true ) {
						listAlertWebsiteId = websites[i].id;
						break;
					}
				}
				partyWebsiteService.getWebsiteById( listAlertWebsiteId, null, ylopoSession )
					.then((partyWebsite)=>{
						res
							.status( 200 )
							.json( partyWebsite );
					})
					.catch( ( error ) => {
						errorService.respondWithError({ res: res, error: error });
					} );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})
	.get( '/:websiteId', function( req, res ) {
		var websiteId = req.params.websiteId;
		var options = req.query;
		var ylopoSession = req.ylopoSession;
		partyWebsiteService.getWebsiteById( websiteId, options, ylopoSession )
			.then( ( website ) => {
				res
					.status( 200 )
					.json( website );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})

	.post( '/', upload.any(), function( req, res ) {
		var data = req.body;
		if (typeof data.content === 'string') {
			data.content = JSON.parse(data.content);
		}
		var files = req.files;
		partyWebsiteService.createWebsite(data, files)
			.then( ( website ) => {
				res
					.status( 200 )
					.json( website );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})

	.post( '/:websiteId', upload.any(), function( req, res ) {
		var websiteId = req.params.websiteId;
		var data = req.body;
		if (typeof data.content === 'string') {
			data.content = JSON.parse(data.content);
		}
		var files = req.files;
		partyWebsiteService.updateWebsiteById(websiteId, data, files)
			.then( ( website ) => {
				res
					.status( 200 )
					.json( website );
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	})

	.delete( '/:websiteId', function( req, res ) {
		var websiteId = req.params.websiteId;
		partyWebsiteService.deleteWebsiteById(websiteId)
			.then( () => {
				res
					.status( 200 )
					.json();
			} )
			.catch( ( error ) => {
				errorService.respondWithError({ res: res, error: error });
			} );
	});
