'use strict';

var BPromise = require('bluebird'),
	config = require('config'),
	expect = require('../chaiExpect'),
	nock = require('nock'),
	_ = require('lodash'),
	sinon = require('sinon');

describe('services/fubService', () => {
	let fubService;
	let leadService;
	let getLeadIntegrationsStub;

	before(() => {
		fubService = require('../../server/services/fubService');
		leadService = require('../../server/services/leadService');

		getLeadIntegrationsStub = sinon.stub(leadService, 'getLeadIntegrations');
	});

	afterEach(() => {
		getLeadIntegrationsStub.reset();
	});

	after(() => {
		nock.cleanAll();
		getLeadIntegrationsStub.restore();
	});

	describe('getFubInfo', () => {
		it('should be a function', () => {
			expect(fubService.getFubInfo).to.be.a('function');
		});

		it('should reject when person has no leads', () => {
			getLeadIntegrationsStub.returns(BPromise.resolve(require('./data/person_with_no_leads.json')));

			var personWithNoFubId = 1;
			return fubService
				.getFubInfo(personWithNoFubId)
				.then(result => {
					return BPromise.reject(new Error(`Did not expect to find result for person ${personWithNoFubId}`));
				})
				.catch(err => {
					expect(err).to.be.an.instanceOf(Error);
					expect(err).to.have.property('status').and.equal(404);
					expect(err).to.have.property('message').and.equal(`Cannot find any leads for person ${personWithNoFubId}`);
				});
		});

		it('should reject when person does not exist on ylopo', () => {
			getLeadIntegrationsStub.returns(BPromise.reject(new Error('Stubbed (test) lead does not exist')));
			let fakeId = 666;
			return fubService
				.getFubInfo(fakeId)
				.then(result => {
					return BPromise.reject(new Error(`Did not expect to find result for person ${fakeId}`));
				})
				.catch(err => {
					expect(err).to.be.an.instanceOf(Error);
					expect(err).to.have.property('message').and.equal('Stubbed (test) lead does not exist');
				});
		});

		it('should reject when person has leads, but none of those leads have active FUB integrations', () => {
			getLeadIntegrationsStub.returns(BPromise.resolve(require('./data/person_with_unsuccessful_fub_integrations.json')));
			let fakeId = 42;
			return fubService
				.getFubInfo(fakeId)
				.then(result => {
					return BPromise.reject(new Error(`Did not expect to find result for person ${fakeId}`));
				})
				.catch(err => {
					expect(err).to.be.an.instanceOf(Error);
					expect(err).to.have.property('message')
						.and.equal(`No successful FUB integrations found for person ${fakeId}`);
				});
		});

		it('should get fub info when lead has valid fub info', () => {
			getLeadIntegrationsStub.returns(BPromise.resolve(require('./data/person_with_successful_fub_integrations.json')));

			let personId = 29034;
			return fubService
				.getFubInfo(personId)
				.then(fubInfo => {
					expect(fubInfo).to.be.an('object');
					expect(fubInfo).to.have.property('sourceUrl')
						.and.equal('http://stars.ylopo.com/lead-detail/de6399ed-884a-4497-8415-3785c70a05ed');
					expect(fubInfo.name).to.equal('Testing McTesterson');
					expect(fubInfo.source).to.equal('Ylopo');
					expect(fubInfo.yFubURL, 'fubInfo.yFubURL').to.equal('https://some-client.followupboss.com');
				});
		});

		it.skip('TODO: Should gracefully handle case when more than one FuB lead found for person!');
	});

	describe('updateFubInfo', () => {
		it('should be a function', () => {
			expect(fubService.updateFubInfo).to.be.a('function');
		});

		it('should reject when person has no leads', () => {
			getLeadIntegrationsStub.returns(BPromise.resolve(require('./data/person_with_no_leads.json')));

			var personWithNoFubId = 1;
			return fubService
				.updateFubInfo(personWithNoFubId, { test: "test" })
				.then(result => {
					return BPromise.reject(new Error(`Did not expect to find result for person ${personWithNoFubId}`));
				})
				.catch(err => {
					expect(err).to.be.an.instanceOf(Error);
					expect(err).to.have.property('status').and.equal(404);
					expect(err).to.have.property('message').and.equal(`Cannot find any leads for person ${personWithNoFubId}`);
				});
		});

		it('should reject when person does not exist on ylopo', () => {
			getLeadIntegrationsStub.returns(BPromise.reject(new Error('Stubbed (test) lead does not exist')));
			let fakeId = 666;
			return fubService
				.updateFubInfo(fakeId, { test: "test" })
				.then(result => {
					return BPromise.reject(new Error(`Did not expect to find result for person ${fakeId}`));
				})
				.catch(err => {
					expect(err).to.be.an.instanceOf(Error);
					expect(err).to.have.property('message').and.equal('Stubbed (test) lead does not exist');
				});
		});

		it('should reject when person has leads, but none of those leads have active FUB integrations', () => {
			getLeadIntegrationsStub.returns(BPromise.resolve(require('./data/person_with_unsuccessful_fub_integrations.json')));
			let fakeId = 42;
			return fubService
				.updateFubInfo(fakeId, { test: "test" })
				.then(result => {
					return BPromise.reject(new Error(`Did not expect to find result for person ${fakeId}`));
				})
				.catch(err => {
					expect(err).to.be.an.instanceOf(Error);
					expect(err).to.have.property('message')
						.and.equal(`No successful FUB integrations found for person ${fakeId}`);
				});
		});

		it('should update fub info when lead has valid fub info', function() {
			this.timeout(10 * 1000);

			getLeadIntegrationsStub.returns(BPromise.resolve(require('./data/person_with_successful_fub_integrations.json')));

			let personId = 29034;
			let originalEmails;
			let modifiedEmails;
			return fubService
				.getFubInfo(personId)
				.then(fubInfo => {
					originalEmails = _.cloneDeep(fubInfo.emails);
					modifiedEmails = fubInfo.emails;
					modifiedEmails[0].value = modifiedEmails[0].value + "c";

					return fubService
						.updateFubInfo(personId, {
							emails: modifiedEmails
						});
				})
				.then(() => {
					return fubService
						.getFubInfo(personId);
				})
				.then(fubInfo => {
					expect(fubInfo.emails).to.eql(modifiedEmails);

					return fubService
						.updateFubInfo(personId, {
							emails: originalEmails
						});
				})
				.then(() => {
					return fubService
						.getFubInfo(personId);
				})
				.then(fubInfo => {
					expect(fubInfo.emails).to.eql(originalEmails);
				});
		});
	});

	describe('_getLeadFromFub', () => {
		let testFubApiKey = '50e2e356f74c61033de1d4faec636bb4f12b79', // ylopo demo account
			testLeadIntegrationId = 5;

		it('should be a function', () => {
			expect(fubService._getLeadFromFub).to.be.a('function');
		});

		it('should get existing lead', () => {
			let nockScope = nock(config.get( 'fub.apiUrl' ))
				.log(console.log)
				.get('/v1/people/' + testLeadIntegrationId)
				.reply(200, require('./data/fub_lead5.json'));

			return fubService._getLeadFromFub(testLeadIntegrationId, testFubApiKey)
				.then(fubLeadInfo => {
					expect(fubLeadInfo).to.be.an('object');
					expect(fubLeadInfo).to.have.property('name').and.equal('Testing McTesterson');
					expect(fubLeadInfo).to.include.keys([
						'id',
						'name',
						'stage',
						'tags',
						'emails',
						'phones',
						'assignedTo',
						'assignedLenderName'
					]);
					nockScope.done();
				});
		});

		it('should 404 when lead does not exist', () => {
			let nonExistentFubLeadId = 4;
			let nockScope = nock(config.get( 'fub.apiUrl' ))
				.log(console.log)
				.get('/v1/people/' + nonExistentFubLeadId)
				.reply(404, { errorMessage: 'Requested resource was not found.' });

			return fubService._getLeadFromFub(nonExistentFubLeadId, testFubApiKey)
				.then(fubLeadInfo => {
					console.log(fubLeadInfo);
					return BPromise.reject(new Error('Did not expect to get here'));
				})
				.catch(err => {
					expect(err).to.be.an.instanceOf(Error);
					expect(err.status).to.equal(404);
					expect(err.message).to.equal('Not Found');
					nockScope.done();
				});
		});
	});
});
