'use strict';

import moment from 'moment-timezone';

export var getTimezone = () => {
	var tz = moment.tz.guess();
	if (!tz) {
		tz = 'America/Los_Angeles';
	}
	return tz;
};

export default {
	getTimezone
};
