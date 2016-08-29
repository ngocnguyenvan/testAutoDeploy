'use strict';

import { isEqual, isEmpty, transform } from 'lodash';

/**
 * Return object contains changed data of object compared to originalObject
 * @param {object} object
 * @param {object} originalObject
 * @returns {object}
 */
export var getObjectChanges = function( object, originalObject ) {
	var getChangesFunc = (obj, originalObj) => transform(obj, (result, n, key) => {
		if (typeof n === 'object' && !Array.isArray(n) && typeof originalObj[key] === 'object') {
			var changes = getChangesFunc(n, originalObj[key]);
			if (!isEmpty(changes)) {
				result[key] = changes;
			}
		}
		else if (!isEqual(n, originalObj[key])) {
			result[key] = n;
		}
	});

	return getChangesFunc(object, originalObject);
};

export default {
	getObjectChanges
};
