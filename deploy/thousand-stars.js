/**
 * Deployment configuration for Thousand Stars
 */

'use strict';

// Project-specific config that want to share between environments.
var pmPort = 7810,
	webPort = 7811,
	pmUser = 'strong-pm-thousand-stars';

var pkg = require('../package.json'),
	YlopoInstaller = require('@ylopo/sys-installer');

new YlopoInstaller(
	{
		pkg: {
			name: pkg.name,
			version: pkg.version
		},

		environments: {
			development: {

			},

			staging: {
				svcName: 1,
				pmUser: pmUser,
				pmPort: pmPort,
				webPort: webPort,
				servers: [
					'microsite-01.stage.ylopo'
				],
				heartbeatPath: '/heartbeat'
			},

			'pre-production': {
				svcName: 1,
				pmUser: pmUser,
				pmPort: pmPort,
				webPort: webPort,
				servers: [
					'microsite-01-pre.prod.ylopo'
				],
				heartbeatPath: '/heartbeat'
			},

			production: {
				svcName: 1,
				pmUser: pmUser,
				pmPort: pmPort,
				webPort: webPort,
				servers: [
					'microsite-01.prod.ylopo',
					'microsite-02.prod.ylopo',
					'microsite-03.prod.ylopo'
				],
				sentryDSN: 'https://681e4a3e3e9a4a0ab827a9fa7cd9c464:a5a70426096243f0bc8ca96455317a74@app.getsentry.com/63943',
				aws: {
					// Change behavior of load balancers during deployment to be "sticky"
					loadBalancerName: 'Ylopo-Prod-01-LB-Stars',
					loadBalancerPorts: [ 80, 443 ],
					stickyDuringDeploy: true
				},
				heartbeatPath: '/heartbeat'
			}
		}
	}
).run();
