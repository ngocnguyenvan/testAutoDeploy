'use strict';

var Path = require( 'path'),
	fs = require( 'fs' );

function readJSFile( file ) {
	var fileName = Path.join( __dirname, '../build/js/stats.json' );
	if ( fs.existsSync( fileName ) ) {
		var json = JSON.parse( fs.readFileSync( fileName, 'utf8' ) );
		if ( json && json.assetsByChunkName ) {
			return '/build/js/' + json.assetsByChunkName[ file ];
		}
	}
}

// Certain frontend values contained in app/Constants.js
module.exports = {
	environment: 'production',
	port: 7811,
	serverFileName: './server/server',

	analytics: {
		googleId: 'UA-58311306-6'
	},

	js: {
		main: readJSFile( 'main' )
	},

	aws: {
		region: 'us-west-2',
		key: 'AKIAJPZQJA5EDQY4IZXA',
		secret: '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',
		s3: {
			bucket: 'yl-clients-prod'
		}
	},

	google: {
		apiKey: 'AIzaSyC_8qB_V9A44Y_Gj0KMu0wT_ifq4DssLRw'
	},

	listing: {
		apiUrl: 'http://listing-api.prod.ylopo:7781',
		portalUrl: 'http://portal.ylopo.com',
		resizeUrl: '//d25fhp1qfwqa2h.cloudfront.net'
	},

	mfBusiness: {
		apiUrl: 'http://internal-Ylopo-Prod-01-LB-Persona-274063157.us-west-2.elb.amazonaws.com:7761',
		internalApplicationId: 10003
	},

	fub: {
		apiUrl: 'https://api.followupboss.com'
	},

	redis: {
		sentinel: {
			name: 'mymaster',
			endPoints: [
				{ host: 'portal-01.prod.ylopo', port: 26379 },
				{ host: 'portal-02.prod.ylopo', port: 26379 },
				{ host: 'scrappy-01.prod.ylopo', port: 26379 }
			]
		}
	},

	serveStatic: {
		maxAge: 1000 * 60 * 24 * 365 * 10 // 10 years
	},

	session: {
		name: 'stars.sid',
		secret: 'hedUWenr8fioohkBgJpUfNaevEHYxchJPgjBTdBXXEsehzTVK2',
		maxAgeMs: 86400 * 30 * 1000, // 30 days in ms
		useRedis: true // Must be true for production.
	},

	stormpath: {
		apiKey: {
			id: '315SD49HTC8U87ABVIOUL3YY3',
			secret: 'cN9J6Lu4DREPYrKE48qq8CMt+ojnmlilJ3x+S5cp9Kw'
		},
		appName: 'Thousand Stars'
	},

	// The queue that we should submit to after a person is created in order to trigger proper assignment, dispatch, etc.
	amqKickoffNewLead: 'person-filter-apply-flags'
};
