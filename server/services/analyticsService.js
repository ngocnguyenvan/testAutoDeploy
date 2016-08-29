/*

Analytics Service

Providing analyitcs

*/
'use strict';

import Promise from 'bluebird';
import moment from 'moment';

export default {

	/**
	 * loadChartData
	 *
	 * Loads the data for the given chart.
	 *
	 * @param  {number} id   Id of the chart we are loading
	 * @return {Promise}     Returns a list with date, value as attributes
	 */
	loadChartData( id ) {
		return new Promise( ( resolve, reject ) => {
			// [ NOTE ] -> Temporary data.
			var values = [];
			for ( var i = 0; i < 50; i++ ) {
				values.push({
					date: moment().subtract( i, 'days' ),
					value: Math.floor( Math.random() * 100 )
				});
			}

			resolve({
				xAxisType: 'DATE',
				yAxisType: 'NUMBER',
				xAxis: 'date',
				yAxis: 'value',
				values: values
			});
		});
	}

};
