'use strict';

import React from 'react';
import objectPath from 'object-path';
import { assign, filter, isEmpty, template,trim} from 'lodash'
import { ServerStatuses } from '../../../Constants';
import { Block, BlockHeader, BlockContent } from '../../core/Block';
import TextBox from '../../core/TextBox'
import history from '../../../history';
import Button from '../../../components/core/Button';
import { get,post } from '../../../utils/api';
import MessageBin from '../../../components/core/MessageBin';
if (process.env.BROWSER) {
	require( './styles.less' );
}

export default class LeadMailContainer extends React.Component {
	static propTypes = {
		lead: React.PropTypes.object,
		selectedListingIds: React.PropTypes.array,
		searchQuery: React.PropTypes.object,
		onSearch: React.PropTypes.func,
		saveListId: React.PropTypes.number,
		sendMailSuccess: React.PropTypes.func,
		saveName: React.PropTypes.string
	};
	constructor( props ) {
		super( props )
		this.handleChangeBody = this.handleChangeBody.bind(this);
		this.loadPartyWebsite = this.loadPartyWebsite.bind(this);
		this.sendEmail = this.sendEmail.bind(this);
		this.handleChangeSubject = this.handleChangeSubject.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.state = {
			serverStatus: ServerStatuses.LOADING,
			serverMessage: undefined,
			disabled: false,
			subjectMail: '',
			bodyMail: '',
			displayErrors: false,
			errorText: 'Push notifications require a subject!'
		};
	}
	componentWillMount() {
		if (!isEmpty(this.props.lead) && this.props.lead.listingAlertWebsiteId > 0) {
			this.loadPartyWebsite(this.props.lead.listingAlertWebsiteId);
		}
	}
	loadPartyWebsite(listingAlertWebsiteId) {
		return get(`/party-website/${listingAlertWebsiteId}`)
			.then((partyWebsite) => {
				var compiled = template('Hi ${FIRST_NAME},\n\n' +
					'Based on your home search interests I’ve found a few homes that I think would be perfect for you. ' +
					'Can you take a look and let me know which ones you like & which ones you don’t? I’ll use your feedback ' +
					'to keep an eye out for other listings that I think you’ll like. ' +
					'Feel free to call me at ${CLIENT_PHONE_NUMBER} anytime to discuss!\n\n' +
					'${CLIENT_NAME}\n' +
					'${CLIENT_BROKERAGE_NAME}\n' +
					'${CLIENT_PHONE_NUMBER}\n' +
					'${CLIENT_EMAIL_ADDRESS}'
				);
				const bodyMail = compiled({
					"FIRST_NAME": this.props.lead.firstName,
					"CLIENT_PHONE_NUMBER" : partyWebsite.content.clientDetails.phone,
					"CLIENT_NAME" : partyWebsite.content.clientDetails.name,
					'CLIENT_BROKERAGE_NAME' : partyWebsite.content.companyDetails.name.displayName,
					'CLIENT_EMAIL_ADDRESS' : partyWebsite.content.companyDetails.email
				});
				this.setState({
					bodyMail: bodyMail,
					subjectMail: "A few listings that I just hand picked for you"
				});
			})
			.catch((error) => {
			});
	}
	handleChangeBody(e) {
		var bodyMail = e.target.value;
		this.setState({
			bodyMail: bodyMail
		});
	}
	handleChangeSubject(e) {
		var subjectMail = trim(e.target.value);
		if (subjectMail <= 0) {
			this.setState({
				subjectMail: e.target.value,
				displayErrors: true
			});
		}
		else {
			this.setState({
				subjectMail: e.target.value,
				displayErrors: false
			});
		}
	}
	sendEmail() {
		if (this.state.displayErrors) {
			return;
		}
		this.setState({
			disabled: true
		});
		const sendMail = {
			listingIds: this.props.selectedListingIds,
			subject: trim(this.state.subjectMail),
			body: trim(this.state.bodyMail)
		};
		post(`/lead/${this.props.lead.id}/send`, {}, sendMail)
		.then((result) => {
			history.push(`/lead-detail/${this.props.lead.uuid}`);
			this.props.sendMailSuccess();
		})
		.catch((error) => {
			this.setState({
				disabled: false,
				serverMessage: error.errorMessage || error,
				serverStatus: ServerStatuses.FAIL
			});
		});
	}
	onSearch() {
		this.props.onSearch(this.props.searchQuery, this.props.saveListId, this.props.saveName, this.props.selectedListingIds);
	}
	render() {
		return ( <Block className="lead-details-cell lead-search-list-block ">
				<BlockHeader className="header" title="Push Notification" fontSize={17}/>
			<BlockContent style={{ padding: 0 }} className="box-send-mail">
				<MessageBin
					status={this.state.serverStatus}
					message={this.state.serverMessage}
				/>
				<div className="box-body">
					<h4 className="step-title">Push Configuration</h4>
					<div className="box-step">
						<div className="send-mail">
							<TextBox
								className="form-group form-control"
								placeholder="Subject"
								value={this.state.subjectMail}
								onChange={this.handleChangeSubject}
								displayErrors={this.state.displayErrors}
								errorText={this.state.errorText}
							/>
							<textarea
								onChange={this.handleChangeBody}
								className="form-group form-control"
								value={this.state.bodyMail}>
							</textarea>
							<div className="form-submit">

								<Button
									disabled={this.state.disabled}
									className="btn btn-success btn-submit"
									label="Send Push Notification"
									onClick={this.sendEmail}
									style={{ marginRight: 10, marginBottom: 10, float: 'left' }}
								/>
								<Button
									className="btn btn-success btn-submit"
									label="Back to Listing Result"
									onClick={this.onSearch}
								/>
							</div>
						</div>
					</div>
				</div>
			</BlockContent>
		</Block> );
	}
}
