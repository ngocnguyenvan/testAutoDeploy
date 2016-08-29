'use strict';

import React from 'react';
import LeadLoadContainer from '../../../../components/lead/LeadLoadContainer';
import LeadDetailContainer from '../LeadDetailContainer';
import { post } from '../../../../utils/api';

export default class ReadOnlyLeadDetailsContainer extends LeadLoadContainer {
	apiRoute = '/open';
	leadAttribute = 'uuid';
	LeadComponent = LeadDetailContainer ;
	LeadComponentParams = {
		onLeadUpdate: this.updateLead.bind(this)
	};
	include = [ 'party', 'party.partyWebsites', 'partyWebsite' ];

	/**
	 * Update lead
	 * @param {object} leadUpdated
	 * @returns {BPromise}
     */
	updateLead(leadUpdated) {
		var leadId = this.props.params[this.leadAttribute];
		return post(`${ this.apiRoute }/${ leadId }`, { updateFubInfo: true }, leadUpdated)
			.then(() => {
				// User experience optimization here
				// We want Promise to be returned before this.loadLeadData and its long state update operation
				setTimeout(() => {
					this.loadLeadData(
						this.props.params[ this.leadAttribute ],
						{ include: this.include }
					);
				}, 10);
			});
	}
}
