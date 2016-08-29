/*

 User Routes

 Routes relating to user

 -  GET /

 */
'use strict';

import { Router } from 'express';

import savedListService from '../../../../services/savedListService';
import errorService from '../../../../services/errorService';

var router = Router();

router.get( '/byLeadId/:leadId', function( req, res ) {
	var leadId = req.params.leadId;
	savedListService.getSavedList(
		leadId
	)
		.then((response)=>{
			res
				.status(200)
				.json(response);
		})
		.catch((error)=>{
			errorService.respondWithError({ res: res, error: error });
		});
});

router.post( '/:leadId', function( req, res ) {
	var leadId = req.params.leadId;
	var data = req.body;
	var saveListId = req.query.id ? JSON.parse(req.query.id) : 0;
	savedListService.createSavedList(
		leadId,
		data
	)
		.then((response)=>{
			res
				.status(200)
				.json(response);
		})
		.catch((error)=>{
			errorService.respondWithError({ res: res, error: error });
		});
	if (saveListId !== 0) {
		savedListService.deleteSavedList(leadId, saveListId);
	}
});

router.delete( '/:leadId/result/:saveListId', function( req, res ) {
	var leadId = req.params.leadId;
	var saveListId = req.params.saveListId;
	savedListService.deleteSavedList(
		leadId,
		saveListId
	)
		.then(() =>{
			res
				.status(200)
				.json();
		})
		.catch((error) =>{
			errorService.respondWithError({ res: res, error: error });
		});
});
export default router;
