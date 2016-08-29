'use strict';

module.exports = {
	environment: 'testing',

	js: {
		main: '/build/js/main.js'
	},

	aws: {
		region: 'us-west-2',
		key: 'AKIAJJKGN2JM2E6LDBCQ',
		secret: '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',
		s3: {
			bucket: 'yl-clients-testing'
		}
	},

	listing: {
		apiUrl: 'http://barwin.alpha.ylopo:7781',
		resizeUrl: '//d2jr2entdme2tx.cloudfront.net'
	},

	mfBusiness: {
		apiUrl: 'http://barwin.alpha.ylopo:7761'
	},

	redis: {
		sentinel: {
			name: 'mymaster',
			endPoints: [
				{ host: 'barwin.alpha.ylopo', port: 26379 }
			]
		}
	},

	serveStatic: {
		maxAge: 0
	},

	session: {
		name: 'stars-testing.sid',
		secret: 'YBsEpTDfBjVP7GwMgYYdUUiuteFxCXMsDCeZ4VxcFGgpjgMVse',
		maxAgeMs: 86400 * 1000, // 1 day in ms
		useRedis: true // Switch to false if you're not on the VPN
	},

	webpack: {
		port: 7812,
		domainName: 'localhost',
		contentBase: 'http://localhost:7812',
		publicPath: '',
		hot: true,
		stats: {
			colors: true,
			assets: true,
			version: false,
			hash: false,
			timings: true,
			chunks: false,
			chunkModules: false
		},
		historyApiFallback: true
	}
};
