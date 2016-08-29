/*

Lead Routes

Routes relating to leads search and retrieving details and activity

-  /
-  /:leadId
-  /:leadId/activity

*/
'use strict';

import { Router } from 'express';

import errorService from '../../../../services/errorService';
import leadService from '../../../../services/leadService';

var router = Router();

router.get( '/', function( req, res ) {
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}
	leadService.getLeads(options, req.ylopoSession)
		.then( ( leads ) => {
			res
				.status( 200 )
				.json( leads );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;
	leadService.getLeadById(leadId, options, req.ylopoSession)
		.then( ( lead ) => {
			res
				.status( 200 )
				.json( lead );
		} )
		.catch( ( error ) => {
			if (error.status === 404) {
				error.clientMessage = "Lead not found";
			}
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/activity', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}

	leadService.getLeadActivity(leadId, options, req.ylopoSession)
		.then( ( activity ) => {
			res
				.status( 200 )
				.json( activity );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/listings', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;

	leadService.getListingsViewed(leadId, options, req.ylopoSession)
		.then( ( listings ) => {
			res
				.status( 200 )
				.json( listings );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/listings-favorite', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;

	leadService.getListingsFavorite(leadId, options, req.ylopoSession)
		.then( ( listings ) => {
			res
				.status( 200 )
				.json( listings );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/sessions', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;

	leadService.getSessions(leadId, options, req.ylopoSession)
		.then( ( sessions ) => {
			res
				.status( 200 )
				.json( sessions );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/session/:sessionId/activity', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}
	options.sessionId = Number(req.params.sessionId);

	leadService.getLeadActivity(leadId, options, req.ylopoSession)
		.then( ( activity ) => {
			res
				.status( 200 )
				.json( activity );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/statistics', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;

	leadService.getStatistics(leadId, options, req.ylopoSession)
		.then( ( statistics ) => {
			res
				.status( 200 )
				.json( statistics );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/search', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}

	leadService.getSavedSearches(leadId, options, req.ylopoSession)
		.then( ( result ) => {
			res
				.status( 200 )
				.json( result );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( '/:leadId/search/:searchId', function( req, res ) {
	var leadId = req.params.leadId;
	var searchId = req.params.searchId;

	leadService.getSavedSearch(leadId, searchId, req.ylopoSession)
		.then( ( search ) => {
			res
				.status( 200 )
				.json( search );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Create New Lead
 */
router.post( '/', function( req, res ) {
	var options = req.query;
	var data = req.body;

	leadService.createLead(data, options, req.ylopoSession)
		.then( ( lead ) => {
			res
				.status( 200 )
				.json( lead );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Update Lead
 */
router.post( '/:leadId', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;
	var data = req.body;

	leadService.updateLead(leadId, data, options, req.ylopoSession)
		.then( ( lead ) => {
			res
				.status( 200 )
				.json( lead );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Create Saved Search
 */
router.post( '/:leadId/search', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.query;
	var data = req.body;

	leadService.createSavedSearch(leadId, data, options, req.ylopoSession)
		.then( ( search ) => {
			res
				.status( 200 )
				.json( search );
		})
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Update Saved Search
 */
router.post( '/:leadId/search/:searchId', function( req, res ) {
	var leadId = req.params.leadId;
	var searchId = req.params.searchId;

	var options = req.query;
	var searchData = req.body;

	leadService.updateSavedSearch(leadId, searchId, searchData, options, req.ylopoSession)
		.then( ( result ) => {
			res
				.status( 200 )
				.json( result );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});

/**
 * Delete Saved Search
 */
router.delete( '/:leadId/search/:searchId', function( req, res ) {
	var leadId = req.params.leadId;
	var searchId = req.params.searchId;

	leadService.deleteSavedSearch(leadId, searchId, req.ylopoSession)
		.then( ( result ) => {
			res
				.status( 200 )
				.json( result );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Create Search Alert for Saved Search
 */
router.post( '/:leadId/search-alert/:searchId', function( req, res ) {
	var data = req.body;
	var options = req.query;

	leadService.createSearchAlert(data, options, req.ylopoSession)
		.then( ( searchAlert ) => {
			res
				.status( 200 )
				.json( searchAlert );
		})
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Update Search Alert for Saved Search
 */
router.post( '/:leadId/search-alert/:searchId/:searchAlertId', function( req, res ) {
	var searchAlertId = req.params.searchAlertId;
	var data = req.body;
	var options = req.query;

	leadService.updateSearchAlert(searchAlertId, data, options, req.ylopoSession)
		.then( ( searchAlert ) => {
			res
				.status( 200 )
				.json( searchAlert );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});

/**
 * Disable Search Alert for Saved Search
 */
router.delete( '/:leadId/search-alert/:searchId/:searchAlertId', function( req, res ) {
	var searchAlertId = req.params.searchAlertId;

	leadService.disableSearchAlert(searchAlertId, req.ylopoSession)
		.then( ( searchAlert ) => {
			res
				.status( 200 )
				.json( searchAlert );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});

/**
 * Push notification
 */
router.post( '/:leadId/send', function( req, res ) {
	var leadId = req.params.leadId;
	var options = req.body;

	leadService.pushNotification(
		leadId,
		options
	)
		.then((result) => {
			res
			.status(200)
			.json(result);
		})
		.catch((error) => {
			errorService.respondWithError({ res: res, error: error });
		});
});
export default router;
