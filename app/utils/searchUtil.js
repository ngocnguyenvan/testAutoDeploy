'use strict';

import { formatMoneyShort } from './formatUtil';

/**
 * Returns string like "Los Angeles, CA 90007, 2+ Beds, 3+ Baths $100-$500k"
 * @param {object} search
 * @returns {string}
 */
export var getSearchDescription = function( search ) {
	var returnValParts = [];

	// Address
	if (search.city) {
		returnValParts.push(search.city);
	}
	if (search.state) {
		returnValParts.push(search.state);
	}
	if (search.postalCode) {
		if (returnValParts.length > 0) {
			returnValParts[returnValParts.length - 1] += ' ' + search.postalCode;
		}
		else {
			returnValParts.push(search.postalCode);
		}
	}

	// Search params
	if (search.beds) {
		returnValParts.push(search.beds + '+ Beds');
	}
	if (search.baths) {
		returnValParts.push(search.baths + '+ Baths');
	}
	if (search.sqftMin) {
		returnValParts.push(search.sqftMin + '+ Sqft');
	}

	// Price:  min, max, or range.
	var priceDesc = '';
	if (search.minPrice && search.maxPrice) {
		priceDesc = formatMoneyShort(search.minPrice) + '-' + formatMoneyShort(search.maxPrice);
	}
	else if (search.minPrice) {
		priceDesc = formatMoneyShort(search.minPrice) + '+';
	}
	else if (search.maxPrice) {
		priceDesc = '<' + formatMoneyShort(search.maxPrice);
	}
	if (priceDesc !== '') {
		returnValParts[returnValParts.length - 1] += ' ' + priceDesc;
	}

	return returnValParts.join(', ').trim();
};

export default {
	getSearchDescription
};
