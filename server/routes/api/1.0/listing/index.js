'use strict';

import { Router } from 'express';
import config from 'config';
import objectPath from 'object-path';

import listingService from '../../../../services/listingService';

var router = Router();

router.get('/', (req, res) => {
	// [TODO] - make promise based...  this is not good.
	// [TODO] - add default client search.

	const query = req.query.s ? JSON.parse(req.query.s) : {};
	const partyWebsite = req.query.partyWebsiteId ? JSON.parse(req.query.partyWebsiteId) : {};

	listingService.load(
		config.listing,
		{
			partyWebsiteId: partyWebsite
		},
		query,
		objectPath.get(req, 'ylopo.client.advancedSearchConfig'),
		(propertyList) => {
			res.json(propertyList);
		},
		req.ylopoSession
	);
});

router.get( '/:listingId', function( req, res ) {
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
		},
		req.ylopoSession
	);
});

router.get( '/:listingId([0-9]+)/neighbors', function( req, res ) {
	listingService.getNearbyListings(
		config.listing,
		req.params.listingId,
		function( err, listings ) {
			if ( err ) {
				res
					.status( err.status || 404 )
					.send( err.data );
			}
			res.json( listings );
		},
		req.ylopoSession
	);
});

export default router;
