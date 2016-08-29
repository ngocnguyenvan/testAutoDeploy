'use strict';

import { Router } from 'express';
import config from 'config';
import objectPath from 'object-path';

import listingService from '../../../../services/listingService';

const router = Router();

router.get('/', (req, res) => {
	const query = req.query.s ? JSON.parse(req.query.s) : {};
	var partyWebsite = req.query.partyWebsiteId ? JSON.parse(req.query.partyWebsiteId) : {};
	listingService.loadMapSearch(
		config.listing,
		{
			partyWebsiteId: partyWebsite
		},
		query,
		(propertyList) => {
			res.json(propertyList);
		},
		req.ylopoSession
	);
});

export default router;
