/*

Analytics Routes

Different charts and data being retuned to the system.

*/
'use strict';

import { Router } from 'express';

import analyticsService from '../../../../services/analyticsService';
import errorService from '../../../../services/errorService';

var router = Router();

router.get( '/chart/:chartId', function( req, res ) {
	analyticsService.loadChartData( req.params.chartId )
		.then(( data ) => {
			res.status( 200 )
				.json( data );
		})
		.catch(( error ) => {
			errorService.respondWithError({
				res: res,
				status: 500,
				error: error
			});
		});
});

export default router;
