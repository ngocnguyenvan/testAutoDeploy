import React from 'react';
import BPromise from 'bluebird';
import { isEmpty } from 'lodash';
import { getTimezone } from '../../../../../../utils/dateUtil';
import { Validators } from '../../../../../../utils/formUtil';
import { ServerStatuses } from '../../../../../../Constants';
import moment from 'moment-timezone';
import MessageBin from '../../../../../../components/core/MessageBin';
import EditableCard from '../../../../../../components/crud/EditableCard';
import FormFieldsMaterial from '../../../../../../components/input/FormFieldsMaterial';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class LeadInformation extends React.Component {

	static propTypes = {
		lead: React.PropTypes.object.isRequired,
		onLeadUpdate: React.PropTypes.func
	};

	constructor() {
		super();
		this.updateLead = this.updateLead.bind(this);

		this.state = {
			displayErrors: false,
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined,
			tempEmailAddress: undefined // User experience optimization. See updateLead()
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			tempEmailAddress: undefined
		});
	}

	updateLead() {
		var formComponent = this.refs.form;

		if (formComponent.isValid()) {
			var objectChanges = formComponent.getFieldsStateObjectChanges();
			if (isEmpty(objectChanges)) {
				return BPromise.resolve();
			}
			if (this.props.onLeadUpdate) {
				this.setState({
					serverStatus: ServerStatuses.PROCESSING
				});
				return this.props.onLeadUpdate(objectChanges)
					.then(() => {
						this.setState({
							tempEmailAddress: objectChanges.emailAddress,
							serverStatus: ServerStatuses.SUCCESS,
							serverMessage: undefined
						});
						// User experience optimization
						// At this point we know that emailAddress was successfully changed on server
						// Shows updated emailAddress to user immediately
						// Not waiting for full React props refresh, which is slow because of very heavy page we have
					})
					.catch((error) => {
						this.setState({
							serverStatus: ServerStatuses.FAIL,
							serverMessage: error.errorMessage || error
						});
					});
			}
		}
		else {
			return BPromise.reject();
		}
	}

	renderContent(editMode) {
		return <div className="profileCard">
			<MessageBin
				status={this.state.serverStatus}
				message={this.state.serverMessage}
			/>
			<div className="row clearfix">
				<div className="title">First Name:</div>
				<div className="value">{this.props.lead.firstName}</div>
			</div>
			<div className="row clearfix">
				<div className="title">Last Name:</div>
				<div className="value">{this.props.lead.lastName}</div>
			</div>
			<div className="row clearfix">
				<div className="title">Phone:</div>
				<div className="value"><a href={'tel:' + this.props.lead.phoneNumber}>{this.props.lead.phoneNumber}</a></div>
			</div>
			<div className="row clearfix">
				<div className="title">Email:</div>
				<div className="value" style={{ width: "100%" }} >
					{ editMode ?
						<FormFieldsMaterial ref="form"
							fields={[
								{
									autoFocus: true,
									type: 'textbox',
									name: 'emailAddress',
									attribute: 'emailAddress',
									placeholder: 'Email Address',
									style: {
										width: '100%',
										marginTop: 6
									},
									validators: [
										Validators.required, Validators.email
									]
								}
							]}
							editMode={true}
							onSubmit={this.updateLead}
							object={this.props.lead}
							displayErrors={this.state.displayErrors} /> :
						<a className="sized-email"
							title={this.state.tempEmailAddress || this.props.lead.emailAddress}
							href={'mailto:' + (this.state.tempEmailAddress || this.props.lead.emailAddress)}>
							{this.state.tempEmailAddress || this.props.lead.emailAddress}
						</a>
					}
				</div>
			</div>
			<div className="row clearfix">
				<div className="title">Created:</div>
				<div className="value">
					{moment.tz(this.props.lead.creationDate, getTimezone()).format('MM/DD/YY hh:mma z')}
				</div>
			</div>
		</div>;
	}

	render() {
		return <EditableCard title="Lead Information"
			blockHeaderProps={{ primary: true }}
			className="lead-details-cell lead-information"
			editMode={false}
			viewModeContent={this.renderContent(false)}
			editModeContent={this.renderContent(true)}
			buttonsVisible={!isEmpty(this.props.lead)}
			editButtonClassName="edit-button"
			editButtonDisabled={this.state.serverStatus === ServerStatuses.PROCESSING}
			saveButtonDisabled={this.state.serverStatus === ServerStatuses.PROCESSING}
			cancelButtonDisabled={this.state.serverStatus === ServerStatuses.PROCESSING}
			onEditSubmit={this.updateLead}
		/>;
	}
}
