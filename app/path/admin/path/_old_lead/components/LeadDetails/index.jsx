'use strict';

import React from 'react';
import { find } from 'lodash';

import moment from 'moment';

import Tabs from '../../../../../../components/core/Tabs/tabs';
import Tab from '../../../../../../components/core/Tabs/tab';
import { Block, BlockHeader, BlockContent } from '../../../../../../components/core/Block';
import LeadListingsList from '../../../../../../components/lead/LeadListingsList';
import LeadListingsFavoriteList from '../../../../../../components/lead/LeadListingsFavoriteList';
import LeadSessionsList from '../../../../../../components/lead/LeadSessionsList';
import LeadActivityContainer from '../../../../../../components/lead/LeadActivityContainer';
import LeadSearchList from '../../../../../../components/lead/LeadSearchList';
import LeadStatistics from '../../../../../../components/lead/LeadStatistics';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LeadDetails extends React.Component {

	static propTypes = {
		lead: React.PropTypes.object.isRequired
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
				return website.active && website.type.indexOf('PORTAL_') === 0;
			});
		}
		else {
			return null;
		}
	}

	render() {
		var lead = this.props.lead;
		var leadId = lead && lead.id ? lead.id : 0;

		var partyWebsite = this.getPartyWebsite(lead);

		return <div className="lead-details">
			<div className="row">
				<div className="left-column">
					<Block className="lead-details-cell">
						<BlockHeader primary={true} title="Lead Information" />
						<BlockContent>
							<div className="profileCard">
								<div className="row clearfix">
									<div className="title">First Name:</div>
									<div className="value">{lead.firstName}</div>
								</div>
								<div className="row clearfix">
									<div className="title">Last Name:</div>
									<div className="value">{lead.lastName}</div>
								</div>
								<div className="row clearfix">
									<div className="title">Phone:</div>
									<div className="value"><a href={'tel:' + lead.phoneNumber}>{lead.phoneNumber}</a></div>
								</div>
								<div className="row clearfix">
									<div className="title">Email:</div>
									<div className="value"><a href={'mailto:' + lead.emailAddress}>{lead.emailAddress}</a></div>
								</div>
								<div className="row clearfix">
									<div className="title">Registration Date:</div>
									<div className="value">{lead.creationDate ? moment(lead.creationDate).format('L') : null}</div>
								</div>
								<div className="row clearfix">
									<div className="title">Last login date:</div>
									<div className="value">{lead.lastRoutedDate ? moment(lead.lastRoutedDate).format('L') : null}</div>
								</div>
							</div>
						</BlockContent>
					</Block>
				</div>
				<div className="right-column">
					<LeadStatistics leadId={ leadId } />
				</div>
			</div>
			<div className="row">
				<div className="left-column">
				</div>
				<div className="right-column">
					<Block className="lead-details-cell">
						<BlockContent style={{ padding: 0 }}>
							<Tabs>
								<Tab key={1} label="Lead Listings Viewed">
									<LeadListingsList id={ leadId } leadPartyWebsite={partyWebsite} />
								</Tab>
								<Tab key={2} label="Favorite Listings">
									<LeadListingsFavoriteList id={ leadId } leadPartyWebsite={partyWebsite} />
								</Tab>
								<Tab key={3} label="Sessions">
									<LeadSessionsList id={ leadId } leadPartyWebsite={partyWebsite} />
								</Tab>
							</Tabs>
						</BlockContent>
					</Block>
					<LeadSearchList leadId={leadId} />
					<Block className="lead-details-cell">
						<BlockHeader title="Activity" />
						<BlockContent>
							<LeadActivityContainer leadId={leadId} leadPartyWebsite={partyWebsite} />
						</BlockContent>
					</Block>
				</div>
			</div>
		</div>;
	}
}
