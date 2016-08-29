/*

Open Routes

Unsecured Routes

-  /
-  /:uuid

*/
'use strict';

import { Router } from 'express';
import config from 'config';
import { intersection } from 'lodash';

import errorService from '../../../../services/errorService';
import leadService from '../../../../services/leadService';
import fubService from '../../../../services/fubService';
import listingService from '../../../../services/listingService';

var router = Router();

const uuidParam = '/:uuid([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})';

router.get( uuidParam, function( req, res ) { // eslint-disable-line max-len
	var options = req.query;

	// Ensuring we are not exposing too much data for open endpoint
	if (options.include) {
		// Valid includes
		options.include = intersection([ 'party', 'party.partyWebsites', 'partyWebsite'], options.include);
	}

	leadService.getLeadByUuid( req.params.uuid, options, req.ylopoSession )
		.then( ( lead ) => {
			// Ensuring we are not exposing too much data for open endpoint
			if (lead.partyWebsite) {
				lead.partyWebsite = {
					domain: lead.partyWebsite.domain
				};
			}
			if (lead.party && lead.party.partyWebsites) {
				if (lead.partyWebsiteId !== null) {
					lead.listingAlertWebsiteId = lead.partyWebsiteId;
				}
				else {
					for (var i = 0; i < lead.party.partyWebsites.length; i++) {
						if (lead.party.partyWebsites[i].useForListingAlerts === true ) {
							lead.listingAlertWebsiteId = lead.party.partyWebsites[i].id;
							break;
						}
					}
				}
				lead.party.partyWebsites = lead.party.partyWebsites.map(
					(website) => {
						return {
							domain: website.domain
						};
					});
			}

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

router.get( `${uuidParam}/activity`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getLeadActivity(lead.id, options, req.ylopoSession);
		})
		.then( ( activity ) => {
			res
				.status( 200 )
				.json( activity );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/fub`, function( req, res ) {
	var uuid = req.params.uuid;
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( person ) => {
			return fubService.getFubInfo(person.id, options, req.ylopoSession);
		})
		.then( (info) => {
			res
				.status(200)
				.json(info);
		})
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/listings`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getListingsViewed(lead.id, options, req.ylopoSession);
		})
		.then( ( listings ) => {
			res
				.status( 200 )
				.json( listings );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/listings-favorite`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getListingsFavorite(lead.id, options, req.ylopoSession);
		})
		.then( ( listings ) => {
			res
				.status( 200 )
				.json( listings );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/sessions`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getSessions(lead.id, options, req.ylopoSession);
		})
		.then( ( sessions ) => {
			res
				.status( 200 )
				.json( sessions );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/session/:sessionId/activity`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}
	options.sessionId = Number(req.params.sessionId);

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getLeadActivity(lead.id, options, req.ylopoSession);
		})
		.then( ( activity ) => {
			res
				.status( 200 )
				.json( activity );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/statistics`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getStatistics(lead.id, options, req.ylopoSession);
		})
		.then( ( statistics ) => {
			res
				.status( 200 )
				.json( statistics );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/search`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;
	if (options.filter) {
		options.filter = JSON.parse(options.filter);
	}

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getSavedSearches(lead.id, options, req.ylopoSession);
		})
		.then( ( savedSearches ) => {
			res
				.status( 200 )
				.json( savedSearches );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.get( `${uuidParam}/search/:searchId`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var searchId = req.params.searchId;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.getSavedSearch(lead.id, searchId, req.ylopoSession);
		})
		.then( ( savedSearch ) => {
			res
				.status( 200 )
				.json( savedSearch );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.post( `${uuidParam}`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;
	var data = req.body;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.updateLead(lead.id, data, options, req.ylopoSession);
		})
		.then( ( lead ) => {
			res
				.status( 200 )
				.json( lead );
		} )
		.catch( ( error ) => {
			console.error(error); // TODO delete
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.post( `${uuidParam}/search`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var options = req.query;
	var data = req.body;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.createSavedSearch(lead.id, data, options, req.ylopoSession);
		})
		.then( ( savedSearch ) => {
			res
				.status( 200 )
				.json( savedSearch );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

router.post( `${uuidParam}/search/:searchId`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var searchId = req.params.searchId;
	var options = req.query;
	var data = req.body;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.updateSavedSearch(lead.id, searchId, data, options, req.ylopoSession);
		})
		.then( ( savedSearch ) => {
			res
				.status( 200 )
				.json( savedSearch );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		} );
});

/**
 * Delete Saved Search
 */
router.delete( `${uuidParam}/search/:searchId`, function( req, res ) {
	var uuid = req.params.uuid;
	var searchId = req.params.searchId;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.deleteSavedSearch(lead.id, searchId, req.ylopoSession);
		})
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
router.post( `${uuidParam}/search-alert/:searchId`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var data = req.body;
	var options = req.query;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.createSearchAlert(data, options, req.ylopoSession);
		})
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
router.post( `${uuidParam}/search-alert/:searchId/:searchAlertId`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var searchAlertId = req.params.searchAlertId;
	var data = req.body;
	var options = req.query;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.updateSearchAlert(searchAlertId, data, options, req.ylopoSession);
		})
		.then( ( searchAlert ) => {
			res
				.status( 200 )
				.json( searchAlert );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});

router.post(`${uuidParam}/search-alert/:searchId/:searchAlertId/enqueue`, function (req, res) {
	const uuid = req.params.uuid;
	const searchAlertId = req.params.searchAlertId;

	leadService.getLeadByUuid(uuid, {}, req.ylopoSession)
		.then(lead => {
			if (lead) {
				return leadService.enqueueSearchAlert(searchAlertId, req.ylopoSession)
					.then(() => res.sendStatus(200));
			}
			else res.sendStatus(404);
		})
		.catch(error => {
			errorService.respondWithError({ res: res, error: error });
		});
});

/**
 * Disable Search Alert for Saved Search
 */
router.delete( `${uuidParam}/search-alert/:searchId/:searchAlertId`, function( req, res ) { // eslint-disable-line max-len
	var uuid = req.params.uuid;
	var searchAlertId = req.params.searchAlertId;

	leadService.getLeadByUuid( uuid, {}, req.ylopoSession )
		.then( ( lead ) => {
			return leadService.disableSearchAlert(searchAlertId, req.ylopoSession);
		})
		.then( ( searchAlert ) => {
			res
				.status( 200 )
				.json( searchAlert );
		} )
		.catch( ( error ) => {
			errorService.respondWithError({ res: res, error: error });
		});
});


router.get( '/listing/:listingId', function( req, res ) {
	listingService.getListing(
		config.listing,
		req.params.listingId,
		function( err, property ) {
			if ( err ) {
				res
					.status( err.status || 404 )
					.send( err.data );
			}
			res.json( property );
		}
	);
});

export default router;
