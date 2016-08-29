/**
 * Set up express sessions backed by Redis.
 *
 * Our Redis client comes via redis-sentinel, the high-availability
 * wrapper around redis.
 */
'use strict';

var config = require('config'),
	session = require('express-session'),
	sentinel = require('redis-sentinel'),
	RedisStore = require('connect-redis')(session),
	logger = require('@ylopo/service-logger'),
	debug = require('debug')('ylopo:stars:session');

export var initialize = function(server) {
	if (config.get('session.useRedis') === false && process.env.NODE_ENV !== 'production') {
		// setup memorystore sessions
		logger.warn('Using MemoryStore for session backend - dev only!');
		debug('Setup memorystore session middleware');
		server.use(session({
			name: config.get('session.name'),
			cookie: {
				expires: new Date(Date.now() + config.get('session.maxAgeMs'))
			},
			secret: config.get('session.secret'),
			resave: false,
			saveUninitialized: false
		}));
	}
	else {
		debug('Attempting to connect to redis-sentinel endpoints', config.get('redis.sentinel.endPoints'));

		// setup redis client via sentinel
		var redisClient = sentinel.createClient(
			config.get('redis.sentinel.endPoints'),
			config.get('redis.sentinel.name'),
			{ role: 'master' }
		);

		redisClient.on('ready', function() {
			debug('Redis client ready');
		});

		redisClient.on('error', function(err) {
			logger.error('Redis error while connecting to', config.get('redis.sentinel.endPoints'), err);
		});

		// setup redis sessions
		debug('Setup session middleware');
		server.use(session({
			name: config.get('session.name'),
			store: new RedisStore({
				client: redisClient,
				prefix: 'sess-stars:'
			}),
			cookie: {
				expires: new Date(Date.now() + config.get('session.maxAgeMs'))
			},
			secret: config.get('session.secret'),
			resave: false,
			saveUninitialized: false
		}));
	}

	// special session debugging route in development
	if (process.env.NODE_ENV === 'development') {
		debug('Enabling session debugging route /session-debug');
		server.get('/session-debug', function sessionDebug(req, res) {
			if (req.query.set) {
				var keyVal = req.query.set.split(','),
					val;
				try {
					val = JSON.parse(keyVal[1]);
				}
				catch (e) {
					val = keyVal[1];
				}
				debug('Setting debug session var %s => %s', keyVal[0], val);
				req.session[ keyVal[0] ] = val;
			}
			res.end('Session ID: ' + req.session.id + '\n' + JSON.stringify(req.session, null, 4));
		});
	}
};

export default {
	initalize: initialize
};
