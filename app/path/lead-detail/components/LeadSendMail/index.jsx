'use strict';

import React from 'react';
import { find } from 'lodash';
import objectPath from 'object-path';
import { Block, BlockContent } from '../../../../components/core/Block';
import Tabs from '../../../../components/core/Tabs/tabs';
import Tab from '../../../../components/core/Tabs/tab';
import LeadListingsList from '../../../../components/lead/LeadListingsList';
import { get, post } from '../../../../utils/api';
import { ServerStatuses } from '../../../../Constants';
import Loader from '../../../../components/core/Loader';
import MessageBin from '../../../../components/core/MessageBin';
import LeadInformation from '../ReadOnlyLeadDetails/components/LeadInformation';
import LeadDetails from '../ReadOnlyLeadDetails/components/LeadDetails';
import LeadMailContainer from '../../../../components/lead/LeadMailContainer';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}
export default class LeadSendMail extends React.Component {
	apiRoute = '/open';
	leadAttributeUuid = 'uuid';
	leadAttributeListingId = 'listingId';
	include = [ 'party', 'party.partyWebsites', 'partyWebsite' ];
	static propTypes = {
		params: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.object
		])
	};

	static contextTypes = {
		location: React.PropTypes.object
	};

	constructor() {
		super();
		this.loadFubInfo = this.loadFubInfo.bind(this);
		this.updateLead = this.updateLead.bind(this);
		this.loadLeadData = this.loadLeadData.bind(this);
		this.state = {
			lead: {},
			onLeadUpdate: this.updateLead.bind(this),
			fubInfo: null,
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined
		};
	}
	componentWillMount() {
		this.loadLeadData(
			this.props.params[this.leadAttributeUuid],
			{ include: this.include }
		);
		this.loadFubInfo(this.props.params[this.leadAttributeUuid]);
	}

	loadLeadData( leadId, options ) {
		return get( `${ this.apiRoute }/${ leadId }`, options )
			.then((lead) => {
				debugger;
				this.setState({
					serverStatus: ServerStatuses.SUCCESS,
					lead: lead
				});
			})
			.catch((error) => {
				debugger;
				this.setState({
					serverMessage: error,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}
	loadFubInfo(uuid) {
		get('/open/' + uuid + '/fub')
			.then((result) => {
				this.setState({
					fubInfo: {
						id: result.id,
						tags: result.tags,
						stage: result.stage,
						assignedTo: result.assignedTo,
						assignedLenderName: result.assignedLenderName,
						yFubURL: result.yFubURL,
						loaded: true
					}
				});
			})
			.catch((error) => {
				// what to do?
			});
	}
	updateLead(leadUpdated) {
		var leadId = this.props.params[this.leadAttributeUuid];
		return post(`${ this.apiRoute }/${ leadId }`, { updateFubInfo: true }, leadUpdated)
			.then(() => {
				// User experience optimization here
				// We want Promise to be returned before this.loadLeadData and its long state update operation
				setTimeout(() => {
					this.loadLeadData(
						leadId,
						{ include: this.include }
					);
				}, 10);
			});
	}
	render() {
		var lead = this.state.lead;
		var leadUuid = this.props.params[this.leadAttribute];
		return ( <div className="lead-details-container">
			{ 	objectPath.get(this, 'state.serverStatus') === ServerStatuses.FAIL &&
				objectPath.get(this, 'state.serverMessage.errorMessage') &&
				objectPath.get(this, 'state.serverMessage.errorMessage').indexOf("Permissions check failed.") === 0 ?
					<div style={{ padding: 20 }}>
						Your account does not have permission to view this resource. For help, email <a
						href="mailto:support@ylopo.com">support@ylopo.com</a>.
					</div> :
					<MessageBin
						style={{ padding: 20 }}
						status={ objectPath.get( this, 'state.serverStatus' ) }
						message={ objectPath.get( this, 'state.serverMessage' ) }
						messageSuffix={
							<span>
								 For help, email <a href="mailto:support@ylopo.com">support@ylopo.com</a>.
							</span>
						}
					/>
				}
				{ lead &&
					<div className="lead-details">
						<div className="row">
							<div className="left-column">
								<LeadInformation lead={ lead } onLeadUpdate={ this.state.onLeadUpdate }/>
								<LeadDetails lead={ lead } fubInfo={ this.state.fubInfo }/>
							</div>
							<div className="right-column">
								<LeadMailContainer lead={lead} {...this.props}/>
							</div>
						</div>
					</div>
				}
				<Loader status={ this.state.serverStatus } />
			</div> );
	}
}
