'use strict';

module.exports = {
	environment: 'staging',

	aws: {
		region: 'us-west-2',
		key: 'AKIAJJKGN2JM2E6LDBCQ',
		secret: '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',
		s3: {
			bucket: 'yl-clients-staging'
		}
	},

	listing: {
		apiUrl: 'http://portal-01.stage.ylopo:7781',
		resizeUrl: 'http://portal-01.stage.ylopo:7771'
	},

	mfBusiness: {
		apiUrl: 'http://portal-01.stage.ylopo:7761'
	},

	redis: {
		sentinel: {
			name: 'mymaster',
			endPoints: [
				{ host: 'portal-01.stage.ylopo', port: 26379 },
				{ host: 'scrappy-01.stage.ylopo', port: 26379 }
			]
		}
	},

	serveStatic: {
		maxAge: 0
	},

	session: {
		name: 'stars-staging.sid',
		secret: 'YBsEpTDfBjVP7GwMgYYdUUiuteFxCXMsDCeZ4VxcFGgpjgMVsd',
		maxAgeMs: 86400 * 1000 * 30, // 30 days in ms
		useRedis: true
	}
};
