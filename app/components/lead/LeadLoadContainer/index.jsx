/*

Lead Load Container


Helps with loading leads and related data.

*/
'use strict';

import React from 'react';
import objectPath from 'object-path';
import { ServerStatuses } from '../../../Constants';
import { get } from '../../../utils/api';
import Loader from '../../core/Loader';
import MessageBin from '../../core/MessageBin';
import { Snackbar } from 'material-ui';

export default class LeadLoadContainer extends React.Component {

	apiRoute = '/lead';
	leadAttribute = 'leadId';
	LeadComponent = null;
	LeadComponentParams = {}
	include = null;

	static propTypes = {
		params: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.object
		])
	};

	constructor( props ) {
		super( props );
		this.loadLeadData = this.loadLeadData.bind( this );
		this.sendMailSuccess = this.sendMailSuccess.bind( this );
		this.handleRequestClose = this.handleRequestClose.bind( this );
		this.state = {
			lead: undefined,
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined,
			isOpenPopup: false,
			messagePopup: "Your Push Notification was Delivered! " +
			"We’ve sent your push notification to this lead, their " +
			"replies will come straight to your inbox."
		};
	}
	componentWillMount() {
		this.loadLeadData(
			this.props.params[ this.leadAttribute ],
			{ include: this.include }
		);
	}
	handleRequestClose() {
		this.setState({
			isOpenPopup: false
		});
	}
	sendMailSuccess() {
		this.setState({
			isOpenPopup: true
		});
	}
	/**
	 * loadData
	 *
	 * Loads all data
	 *
	 * @param {int} leadId
	 * @param {object} options
	 * @returns {BPromise}
	 */
	loadLeadData( leadId, options ) {
		return get( `${ this.apiRoute }/${ leadId }`, options )
			.then((lead) => {
				this.setState({
					serverStatus: ServerStatuses.SUCCESS,
					lead: lead
				});
			})
			.catch((error) => {
				this.setState({
					serverMessage: error,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	render() {
		return <div className="lead-details-container">
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
			{ this.state.lead &&
				<this.LeadComponent
					lead={ this.state.lead }
					sendMailSuccess={this.sendMailSuccess}
					{...this.LeadComponentParams}
					{...this.props} />
			}
			<Loader status={ this.state.serverStatus } />
			<Snackbar
				open={this.state.isOpenPopup}
				message={this.state.messagePopup}
				autoHideDuration={5000}
				onRequestClose={this.handleRequestClose}
				bodyStyle={{ background: '#9eb445', height: 'auto', lineHeight: '30px' }}
			/>
		</div>;
	}
}
