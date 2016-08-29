'use strict';

var assert = require('assert'),
	expect = require('../chaiExpect'),
	supertest = require('supertest');

describe('Heartbeat Route', function() {
	var app;

	before(function(done) {
		this.timeout(10 * 1000);
		app = require('../../server/server.js');
		if (app.get('ready-for-tests')) {
			done();
		}
		else {
			app.on('ready-for-tests', done);
		}
	});

	it('should have a /heartbeat route', function(done) {
		supertest(app)
			.get('/heartbeat')
			.expect(200)
			.expect('Content-type', 'application/json; charset=utf-8')
			.end(function(err, res) {
				assert.ifError(err);

				var heartBeatJson = res.body;
				expect(heartBeatJson.status).to.equal('OK', 'Status is OK' );
				expect(heartBeatJson.version).to.match(/^\d+\.\d+\.\d+(-\d+)?$/);
				done();
			});
	});
});
