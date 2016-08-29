'use strict';

import amq from '@ylopo/service-amq';
import BPromise from 'bluebird';

/**
 * Promise wrapper around amq.publish.  We could use promisification, but that ends up being
 * trickier to deal with in our mocha tests.
 *
 * @param {string} queue
 * @param {object} msg
 * @return {Promise}
 */
export function amqPublish(queue, msg) {
	return BPromise.fromCallback(function(cb) {
		amq.publish(queue, msg, cb);
	});
};

export default {
	amqPublish
};
