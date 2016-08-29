'use strict';

import React from 'react';
import { find } from 'lodash';

import { Block, BlockContent } from '../../../../components/core/Block';

import Tabs from '../../../../components/core/Tabs/tabs';
import Tab from '../../../../components/core/Tabs/tab';
import LeadListingsList from '../../../../components/lead/LeadListingsList';
import LeadListingsFavoriteList from '../../../../components/lead/LeadListingsFavoriteList';
import LeadSessionsList from '../../../../components/lead/LeadSessionsList';
import LeadSearchList from '../../../../components/lead/LeadSearchList';
import LeadStatistics from '../../../../components/lead/LeadStatistics';
import { get } from '../../../../utils/api';
import LeadUserAction from '../../../../components/lead/LeadUserAction';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class ReadOnlyLeadDetails extends React.Component {

	static propTypes = {
		lead: React.PropTypes.object,
		onLeadUpdate: React.PropTypes.func
	};

	static contextTypes = {
		location: React.PropTypes.object
	};

	constructor() {
		super();
		this.getPartyWebsite = this.getPartyWebsite.bind(this);
	}
	getPartyWebsite(lead) {
		if (lead.partyWebsite) {
			return lead.partyWebsite;
		}
		else if (lead.party && lead.party.partyWebsites) {
			return find(lead.party.partyWebsites, (website) => {
				return website.active &&
					website.type.indexOf('PORTAL_') === 0;
			});
		}
		else {
			return null;
		}
	}
	render() {
		var lead = this.props.lead;
		var leadUuid = lead && lead.uuid ? lead.uuid : '';
		var partyWebsite = this.getPartyWebsite(lead) || null;
		return <div className="lead-details row">
			<LeadStatistics leadUuid={ leadUuid } />
			<LeadUserAction leadUuid={ leadUuid } />
			<LeadSearchList leadUuid={ leadUuid } />
			<Block className="lead-details-cell">
				<BlockContent style={{ padding: 0 }}>
					<Tabs>
						<Tab key={1} label="Lead Listings Viewed">
							<LeadListingsList uuid={ leadUuid } leadPartyWebsite={partyWebsite} />
						</Tab>
						<Tab key={2} label="Favorite Listings">
							<LeadListingsFavoriteList uuid={ leadUuid } leadPartyWebsite={partyWebsite} />
						</Tab>
						<Tab key={3} label="Sessions">
							<LeadSessionsList uuid={ leadUuid } leadPartyWebsite={partyWebsite} />
						</Tab>
					</Tabs>
				</BlockContent>
			</Block>
		</div>
	}
}
