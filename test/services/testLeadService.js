'use strict';

import leadService from '../../server/services/leadService';
import { YlopoSession } from '../../server/services/sessionService';

import amq from '../../server/lib/amq';
import BPromise from 'bluebird';
import config from 'config';
import expect from '../chaiExpect';
import nock from 'nock';
import sinon from 'sinon';

var personApiBaseUrl = config.get('mfBusiness.apiUrl');

describe('leadService', function() {
	it('should be an object', function() {
		expect(leadService).to.be.an('object');
	});

	describe('createLead (nocked)', function() {
		var nockScope,
			amqPublishStub,
			ylopoSession,
			testPerson = {
				partyId: 10000,
				firstName: 'Bob',
				lastName: 'Smith',
				emailAddress: 'unittest@ylopo.com'
			};

		before(function() {
			// Setup nock routes that the below 'it' tests rely on.
			nockScope =
				nock(personApiBaseUrl)
				.post('/api/1.0/person', testPerson)
				.reply(200, {
					status: 'OK',
					id: 42
				})
				.post('/api/1.0/person', testPerson)
				.reply(409, {
					error: true,
					message: 'duplicate key value violates unique constraint "person_email_address_idx"'
				}
				);

			amqPublishStub = sinon.stub(amq, 'amqPublish');
			amqPublishStub.returns(BPromise.resolve());

			ylopoSession = new YlopoSession({
				session: {
					account: {},
					_authenticated: true
				}
			});
		});

		afterEach(function() {
			amqPublishStub.reset();
		});

		after(function() {
			amqPublishStub.restore();
		});

		// Note: this is not a comprehensive test by any means.
		it('should create person', function(testDone) {
			leadService.createLead(testPerson, {}, ylopoSession)
				.then(
					function(responseData) {
						expect(responseData).to.eql({ status: 'OK', id: 42 });
						expect(amqPublishStub.callCount).to.equal(1);
						expect(amqPublishStub.firstCall.args[0]).to.equal(config.get('amqKickoffNewLead'));
						expect(amqPublishStub.firstCall.args[1]).to.eql({
							personId: 42,
							partyId: 10000
						});
						testDone();
					},
					function(rejection) {
						if (rejection instanceof Error) {
							testDone(rejection);
						}
						else {
							testDone(new Error(JSON.stringify(rejection)));
						}
					}
				)
				.catch(testDone);
		});

		it('should throw an error when submitting duplicate person', function(testDone) {
			leadService.createLead(testPerson, {}, ylopoSession)
				.then(
					function(responseData) {
						testDone(new Error('Did not expect a "success" response: ' + JSON.stringify(responseData)));
					},
					function(rejection) {
						expect(rejection).to.eql({
							status: 409,
							message: 'duplicate key value violates unique constraint "person_email_address_idx"',
							errorMessage: 'duplicate key value violates unique constraint "person_email_address_idx"',
							clientMessage: 'A user already exists with that email'
						});
						expect(amqPublishStub.callCount).to.equal(0);
						testDone();
					}
				)
				.catch(function(err) {
					testDone(err);
				});
		});

		it('should not have any pending nocks left', function() {
			nockScope.done(); // Throws exception if not done.
		});
	});
});
