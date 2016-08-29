/* global window */
'use strict';

import objectPath from 'object-path';
import { formatMoneyShort, formatPriceLabel } from './formatUtil';

/**
 *
 * translateToApiSearch
 *
 * Translates the search to one which is structured specifically for the API.
 *
 * -  Api uses a "human readable" page parameter, starting with 1
 *
 * @param {object} search - the search object from the application
 * @returns {object}
 *
 */
export var translateToApiSearch = function( search ) {
	var apiSearch = Object.assign(
		{
			limit: 10,
			page: 0
		},
		search
	);
	apiSearch.page ++;

	return apiSearch;
};

/**
 * Translate listings status to meaningful status
 *
 * [ NOTE ] we have no guarantee that global google exists.  Consider wrapping in a function which queue methods for
 * firing when/if the library has loaded.
 *
 * @param  {string} status
 * @return {object} returns a string with the cooresponding phrase
 *                  returns -1 on error
 */
export var listingStatus = function( status ) {
	switch (status) {
		case 'Active':
			return 'Available to View';
		default:
			return 'Comming Soon';
	}
};


/**
 * Translate an address to lat lng coordinate object using google geocoding api
 *
 * [ NOTE ] we have no guarantee that global google exists.  Consider wrapping in a function which queue methods for
 * firing when/if the library has loaded.
 *
 * @param {string} address any address
 * @param {function} callback
 * @return {object} returns an object containing a lat and lng
 *                  returns -1 on error
 */
export var addressToLatLng = function( address, callback ) {
	var google = window.google;
	if ( google ) {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ address: address }, function(results, status) {
			if ( status === google.maps.GeocoderStatus.OK ) {
				callback( results[0].geometry.location );
			}
			else {
				callback( undefined );
			}
		});
	}
	else {
		callback( undefined );
	}
};

/**
 * generateUrl
 *
 * Determines the url to the current listing based upon the client/party
 *
 *
 * @param  {Object} listing  The listing we are getting a url for
 * @param  {String} clientDomain
 * @return {String} listing URL
 */
export var generateUrl = function( listing, clientDomain ) {
	return 'http://' + ( clientDomain ? clientDomain : 'portal.ylopo.com' ) + '/listing-detail/' + objectPath.get( listing, 'id' );
};

/**
 * Returns string like "5 Bedroom, 4 Bath, 1234 Sqft, 500k$"
 * @param {object} listing
 * @returns {string}
 */
export var getPropertyInfoString = function( listing ) {
	var returnValParts = [];

	if (listing.bedrooms) {
		returnValParts.push(listing.bedrooms + ' Bedroom');
	}
	if (listing.bathrooms) {
		returnValParts.push(listing.bathrooms + '+ Bath');
	}
	if (listing.livingAreaSqFt) {
		returnValParts.push(listing.livingAreaSqFt + '+ Sqft');
	}
	if (listing.price) {
		returnValParts.push(formatMoneyShort(listing.price));
	}

	return returnValParts.join(', ').trim();
};
export function generateSearchSummary(search = {}) {

	let bedsString = '';
	let priceString = '';
	if ((search.s_price_min && search.s_price_min !== 'No Min') && (search.s_price_max && search.s_price_max !== 'No Max')) {
		priceString = `Between $${formatPriceLabel(search.s_price_min)} - $${formatPriceLabel(search.s_price_max)}`;
	} else if (search.s_price_min && search.minPrice !== 'No Min') {
		priceString = `Over $${formatPriceLabel(search.s_price_min)}`;
	}
	if (search.s_beds && search.s_beds > 0) {
		bedsString = `${search.s_beds} Bed`;
	}

	if (objectPath.get(search, 's_locations.length') > 2) {
		console.log(search);
		return `${bedsString} Homes in ${search.s_locations.length} Locations ${priceString}`;
	} else if (objectPath.get(search, 's_locations.length') > 0) {
		return `${bedsString} Homes in
			${objectPath.get(search, 's_locations').map((location) => {
			if (location.city && location.state) {
				return ` ${location.city}, ${location.state}`;
			} else if (location.postalCode) {
				return ` ${location.postalCode}`;
			}
			return '';
		})}
		${priceString}`;
	}
	return `${bedsString} ${priceString}`;
}
export default {
	translateToApiSearch,
	addressToLatLng,
	listingStatus,
	generateUrl
};
