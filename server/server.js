/*

 Base server file for setting up an Express/React app.

 */
'use strict';

global.navigator = { userAgent: 'all' }; // For Material-UI

var express = require('express'),
	config = require('config'),
	sessionManager = require('./sessionManager'),
	favicon = require('serve-favicon'),
	Path = require('path'),
	compression = require('compression'),
	bodyParser = require('body-parser'),
	stormpathService = require('./services/stormpathService'),
	sessionService = require('./services/sessionService'),
	debug = require('debug')('ylopo:stars:server'),
	morgan = require('morgan'),
	logger = require('@ylopo/service-logger');

if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'development';
}

debug('NODE_ENV: [' + process.env.NODE_ENV + ']');
debug('Starting Express Server');
debug('Config:');
debug(config);

var server = module.exports = express();
server.locals = {
	config: config,
	rootDirectory: Path.join(__dirname, '../'),
	package: require('../package.json')
};

server.set('trust proxy', true);
server.disable('x-powered-by');

// logging http requests
if (process.env.NODE_ENV === 'production') {
	server.use(morgan('combined', {
		skip: function(req, res) {
			return req.originalUrl === '/heartbeat';
		}
	}));
}
else if (process.env.NODE_ENV !== 'testing') {
	server.use(morgan('dev'));
}

// webpack proxy server - hot reload, etc.
if (process.env.NODE_ENV === 'development') {
	// if flag is set, the expectation is that webpack is running alongside
	// this allows webpack process to do its HMR, and nodemon to restart server quicker
	if (!process.env.STANDALONE_WEBPACK)
		require('../webpack/server');

	var proxy = require('http-proxy').createProxyServer();

	server
		.all('/build/*', function(req, res) {
			proxy.web(req, res, {
				target: config.get('webpack.contentBase')
			});
		});
}

sessionManager.initialize(server);
stormpathService.initialize()
	.then((stormpathApplication) => {
		server
			.set('query parser', 'extended')
			.use(bodyParser.json())
			.use(compression())
			.use(function(req, res, next) {
				req.locals = server.locals;
				next();
			})
			.use('/heartbeat', require('./heartbeat'))

			// static assets.
			.use(favicon(Path.join(__dirname, '../', '/app/assets/favicon.ico')))
			.use('/favicon.png', express.static(
				Path.join(__dirname, '../', '/app/assets/favicon.png'), config.get('serveStatic')))
			.use('/assets', express.static(
				Path.join(__dirname, '../', '/app/assets/'), config.get('serveStatic')))
			.use('/assets', function(req, res, next) {
				res.status('404');
				res.send('Static Fail: File not Found');
			})
			.use('/build', express.static(
				Path.join(__dirname, '../', '/build/'),
				config.get('serveStatic')))
			.use('/build', function(req, res, next) {
				res.status('404');
				res.send('Static Fail: File not Found');
			})

			// Everything after this middleware will have access to the req.ylopoSession service.
			.use(sessionService.initializeSessionRequest)
			.use('/api/1.0', require('./routes/api/1.0'));

		if (process.env.NODE_ENV === 'development')
			server.use('/', require('./renderIndexDoc'));
		else
			server.use('/', require('./isomorphicReact'));

		// Start the server if we're not in testing mode.
		if (process.env.NODE_ENV !== 'testing') {
			server.listen(config.get('port'), function() {
				logger.info('Listening on port %d', config.get('port'));
				if (process.send) {
					process.send('online');
				}
			});
		}
		else {
			// Test mode.
			server.emit('ready-for-tests');
			server.set('ready-for-tests', true);
		}
	})
	.catch((e) => {
		logger.error('Fatal: Server initial configuration: ', e);
	});
