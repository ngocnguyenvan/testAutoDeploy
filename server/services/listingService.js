'use strict';

import { getYlopoIdentityHeaders } from '@ylopo/utils/dist/lib/security/serverApi';
import { get } from '../lib/api';
import numeral from 'numeral';
import objectPath from 'object-path';
import { cloneDeep, merge, forEach } from 'lodash';

var ListingService = {

	/**
	 * load
	 *
	 * Loads a list of listings via a search.  We query a third party server
	 * passing in options from our JSON object:
	 *
	 * {
	 *		"load": true,
	 *		"beds": 3,
	 *		"baths": 3,
	 *		"city": "Boulder",
	 *		"state": "CO",
	 *		"postalCode": 80113,
	 *		"minPrice": 500000,
	 *		"maxPrice": 700000
	 *	}
	 *
	 * @param {object} config
	 * @param {object} options
	 * @param {bool} searchOverride
	 * @param {function} callback
	 * @param {object} ylopoSession
	 * @returns {void}
	**/
	load: function( config, options, searchOverride, homeFeatures, callback, ylopoSession ) {
		options = merge( options, searchOverride );
		options.limit = options.limit || 100;
		get(
			config.apiUrl + '/api/1.0/search',
			{
				params: this._buildSearchParamsFromOptions( options ),
				headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
			}
		).then(
			function( response ) {
				callback( response.data.map( function( listing ) {
					return ListingService.formatListing( config, listing, homeFeatures );
				}) );
			},
			function( response ) {
				callback( [] );
			}
		);
	},

	loadMapSearch: function loadMapSearch( config, options, searchOverride, callback, ylopoSession ) {
		options = merge( options, searchOverride );

		// Limit results to 500 listings to prevent memory issues.  This value
		// was chosen somewhat arbitrarily and should probably be revisited.
		options.limit = options.limit || 500;
		get(
			config.apiUrl + '/api/1.0/mapsearch',
			{
				params: options
			}
		)
			.then(( response ) => {
				var markersList = ListingService.formatMapMarkers(objectPath.get( response, 'data.results' ));
				callback( markersList );
			})
			.catch(( response ) => {
				callback( [] );
			});
	},

	/**
	 * Convert malabar search options to listing-api search options.
	 *
	 * @param {object} searchOptions
	 * @param {object} ylopoSession
	 * @return {object}
	 * @private
	 */
	_buildSearchParamsFromOptions: function _buildSearchParamsFromOptions(searchOptions) {
		var options = cloneDeep( searchOptions );

		if (options.bbox) {
			// Bounding box searches override any city/state/zip info.
			delete options.city;
			delete options.state;
			delete options.postalCode;
		}

		/* eslint-disable camelcase */
		return {
			partyWebsiteId: options.partyWebsiteId,
			s_beds: options.beds,
			s_baths: options.baths,
			s_price_min: options.minPrice,
			s_price_max: options.maxPrice,
			s_bbox: options.bbox,
			s_city: options.city,
			s_state: options.state,
			s_zip: options.postalCode,
			s_yb_max: options.ybMax,
			s_yb_min: options.ybMin,
			s_year_min: options.yearMin,
			s_year_max: options.yearMax,
			s_sqft_min: options.sqftMin,
			s_sqft_max: options.sqftMax,
			s_age_days_max: options.maxDays,
			s_amenities: options.amenities,
			s_locations: JSON.stringify(options.locations),
			's_listing_id[]': options.listingIds,
			's_type[]': options.types,
			s_cat: 'Purchase',
			page: options.page || 1,
			limit: options.limit || 100,
			s_da: 't',
			'ob[]': options.orderBy || [
				'preferred,desc',
				'price,desc'
			]
		};
		/* eslint-enable camelcase */
	},

	/**
	 * Fetch an individual listing's detail.
	 * @param {object} config
	 * @param {int} listingId
	 * @param {object} options
	 * @param {function} callback
	 * @param {object} ylopoSession
	 * @returns {void}
	 */
	getListing: function( config, listingId, options, callback, ylopoSession ) {
		get(
			config.apiUrl + '/api/1.0/listing/' + listingId,
			{
				headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
			}
		).then(
			function( response ) {
				callback( null, ListingService.formatListing( config, response.data ) );
			},
			function( response ) {
				callback( response );
			}
		);
	},

	/**
	 * Given a listingId, get nearby listings ("neighbors")
	 *
	 * @param {object} config
	 * @param {int} listingId
	 * @param {object} options
	 * @param {function} callback
	 * @param {object} ylopoSession
	 * @returns {void}
	 */
	getNearbyListings: function( config, listingId, options, callback, ylopoSession ) {
		get(
			// Find 3 closest listings within 10,000m (Configurable in the querystring below)
			config.apiUrl + '/api/1.0/listing/' + listingId + '/neighbors?limit=3&distance=10000',
			{
				headers: getYlopoIdentityHeaders(ylopoSession.getAccountData())
			}
		).then(
			function( response ) {
				var formattedListings = response.data.map( function( listing ) {
					return ListingService.formatListing( config, listing );
				});
				callback( null, formattedListings );
			},
			function( response ) {
				callback( response );
			}
		);
	},


	/**
	 * Translate mapsearch API response to the correct marker structure
	 * Also, this checks for and excluded invalid API responses
	 *
	 * @param {Array} listings
	 * 	the array of lean listings from API endpoint /mapsearch
	 * @returns {Array}
	 */
	formatMapMarkers: function( listings ) {
		var markers = [];
		listings.forEach( (listing, index) => {
			var lat = objectPath.get(listing, 'lat');
			var lng = objectPath.get(listing, 'lng');
			var id = objectPath.get(listing, 'id');
			if (lat && lng && id) {
				var marker = {
					position: {
						lat: parseFloat(lat),
						lng: parseFloat(lng)
					},
					id: id,
					defaultAnimation: 2
				};
				markers.push(marker);
			}
		});
		return markers;
	},

	/**
	 * formatListing
	 *
	 * Structures the listing in a format necessary for display in this microsite
	 *
	 * @param {object} config
	 * @param {object} listing
	 * @returns {object}
	**/
	formatListing: function( config, listing ) {
		listing.formattedPrice = numeral( listing.price ).format( '$0,0' );
		listing.mainPhoto = ListingService.formatListingUrl(
			config, listing.listingPhotos ? listing.listingPhotos[ 0 ] : undefined, { width: 245, height: 170 } );
		listing.mainPhotoLarge = ListingService.formatListingUrl(
			config, listing.listingPhotos ? listing.listingPhotos[ 0 ] : undefined, { width: 600, height: 'auto' } );

		// transform entire listingPhotos array

		// height of simple carousel - carousel top and bottom border (6px total)
		listing.largeListingPhotos = [];
		for (var i = 0; i < listing.listingPhotos.length; i++) {
			listing.largeListingPhotos.push(
				ListingService.formatListingUrl( config, listing.listingPhotos[i], { width: 'auto', height: 650 } ) );
			listing.listingPhotos[i] =
				ListingService.formatListingUrl( config, listing.listingPhotos[i], { width: 'auto', height: 294 } );
		}

		listing.link = config.portalUrl + ListingService.listingDetailsUrl( listing ) + '?l=9999999';

//		if ( config.apiUrl === 'LOCAL' ) {
//			listing.mainPhotoLarge = listing.mainPhoto = '/static/mocks/properties/' + listing.listingPhotos[ 0 ].id + '_300_auto.jpg';
//		}
//

		this.pricePerSquareFoot(listing);

		// Only include fields we want to expose on client side.
		this.pruneUnnecessaryFields( listing );

		return listing;
	},


	pricePerSquareFoot( listing ) {
		// fast ceiling of price / sq ft
		/* eslint-disable no-bitwise */
		/* eslint-disable no-extra-parens */
		var pricePerSquareFoot = ((parseFloat(listing.price)) / listing.livingAreaSqFt + 1) | 0;
		/* eslint-enable no-bitwise */
		/* eslint-enable no-extra-parens */
		listing.pricePerSquareFoot = pricePerSquareFoot;

		return listing;
	},

	/**
	 * formatListingUrl
	 *
	 * Reformats the Photo Url to render through our internal system
	 *
	 * @param {object} config
	 * @param {object} image
	 * @param {object} options
	 * @returns {string}
	**/
	formatListingUrl: function( config, image, options ) {
		if ( image && image.id ) {
			return config.resizeUrl + '/' + image.id + '_' + options.width + '_' + options.height;
		}
		else {
			return '/assets/images/no_photo_available.jpg';
		}
	},

	listingDetailsUrl: function(listing) {
		return '/listing-detail/' + listing.id + '/' + listing.linkFragment;
	},

	/**
	 * Remove unnecessary fields from the listing.
	 *
	 * @param {object} listing
	 * @return {object} The listing minus the fields we've removed.
	 */
	pruneUnnecessaryFields: function pruneUnnecessaryFields( listing ) {
		var listingFieldsToPrune = [
				'modificationTimestamp',
				'propertySubTypeOtherdescription',
				'propertyTypeOtherdescription',
				'sourceListingId'
			],
			listingPhotoFieldsToPrune = [
				'inactiveDate',
				'mediaUrl'
			];

		// Prune top level attrs
		forEach(listingFieldsToPrune, function(fieldName) {
			delete listing[ fieldName ];
		});

		// Prune attrs in listingPhotos array.
		forEach( listing.listingPhotos, function(photo) {
			forEach( listingPhotoFieldsToPrune, function(fieldName) {
				delete photo[ fieldName ];
			});
		});

		return listing;
	}
};

export default ListingService;
