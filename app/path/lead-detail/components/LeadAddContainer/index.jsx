import React from 'react';
import BPromise from 'bluebird';
import LeadSearchDetails from '../../../../components/lead/LeadSearchDetails';
import { sortBy } from 'lodash';
import objectPath from 'object-path';
import FormFieldsMaterial from '../../../../components/input/FormFieldsMaterial';
import formUtil, { Validators } from '../../../../utils/formUtil';
import { ServerStatuses } from '../../../../Constants';
import { Block, BlockHeader, BlockContent } from '../../../../components/core/Block';
import Button from '../../../../components/core/Button';
import Checkbox from '../../../../components/core/Checkbox';
import MessageBin from '../../../../components/core/MessageBin';
import UserStore from '../../../../stores/UserStore';
import { get, post } from '../../../../utils/api';
import history from '../../../../history';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class LeadAddContainer extends React.Component {

	formFields = [
		{
			autoFocus: true,
			type: 'textbox',
			name: 'firstName',
			attribute: 'firstName',
			placeholder: 'First Name',
			style: {
				width: '100%'
			},
			validator: Validators.required
		},
		{
			type: 'textbox',
			name: 'lastName',
			attribute: 'lastName',
			placeholder: 'Last Name',
			style: {
				width: '100%'
			},
			validator: Validators.required
		},
		{
			type: 'textbox',
			name: 'emailAddress',
			placeholder: 'Email Address',
			attribute: 'emailAddress',
			style: {
				width: '100%'
			},
			validators: [Validators.required, Validators.email]
		},
		{
			type: 'textbox',
			name: 'phoneNumber',
			placeholder: 'Phone Number',
			attribute: 'phoneNumber',
			style: {
				width: '100%'
			},
			validators: [Validators.required, Validators.phone]
		},
		{
			type: 'select-classic',
			name: 'partyId',
			attribute: 'partyId',
			placeholder: 'Party',
			title: 'Party',
			optionKey: 'id',
			optionLabel: 'label',
			optionList: () => {
				return this.state.partiesList.map((party) => {
					return {
						id: party.id,
						label: `${party.label} (${party.id})`
					};
				});
			},

			style: {
				width: '100%'
			},
			validators: [Validators.required]
		}
	];

	constructor() {
		super();

		this.loadPartiesList = this.loadPartiesList.bind(this);
		this.createLead = this.createLead.bind(this);
		this.handleUserStoreChange = this.handleUserStoreChange.bind(this);
		this.handleFormFieldsMaterialChange = this.handleFormFieldsMaterialChange.bind(this);
		this.state = {
			currentUser: UserStore.getState(),
			partiesList: [],
			createSavedSearch: false,
			displayErrors: false,
			serverStatus: ServerStatuses.READY,
			serverMessage: '',
			partyId: ''
		};
	}

	componentDidMount() {
		UserStore.addChangeListener( this.handleUserStoreChange );
		this.loadPartiesList();
	}

	componentWillUnmount() {
		UserStore.removeChangeListener( this.handleUserStoreChange );
	}

	handleUserStoreChange() {
		this.setState({
			currentUser: UserStore.getState()
		}, () => {
			this.loadPartiesList();
		});
	}
	handleFormFieldsMaterialChange(object, field) {
		if (field.name === 'partyId' && object.partyId > 0) {
			this.setState({
				partyId: object.partyId
			});
		}
	}
	loadPartiesList() {
		if (!this.state.currentUser) {
			this.setState({
				partiesList: []
			});
			return BPromise.resolve();
		}

		var clientId = objectPath.get(this.state.currentUser, 'customData.clientId');
		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		});

		if (clientId) {
			return get(`/client/${clientId}`, { include: 'partyMembers,partyMembers.party' })
				.then((client) => {
					this.setState({
						partiesList: sortBy(client.partyMembers.map((partyMember) => partyMember.party)
							.filter((party) => party !== null && party.active), 'label'),
						serverStatus: ServerStatuses.READY
					});
				})
				.catch((error) => {
					this.setState({
						serverMessage: error.errorMessage || error,
						serverStatus: ServerStatuses.FAIL
					});
				});
		}
		else {
			return get(`/party`, { sort: { label: 'asc' }, active: true, limit: Number.MAX_SAFE_INTEGER })
				.then((parties) => {
					this.setState({
						partiesList: sortBy(parties, 'label'), // current mf-business-api always sorts be desc,
						serverStatus: ServerStatuses.READY
					});
				})
				.catch((error) => {
					this.setState({
						serverMessage: error.errorMessage || error,
						serverStatus: ServerStatuses.FAIL
					});
				});
		}
	}

	createLead() {
		var lead = this.refs.formFieldsComponent.getFieldsStateObject();
		if ( formUtil.areFieldsValid( lead, this.formFields ) &&
			(!this.state.createSavedSearch || this.refs.leadSearchDetails.isValid())) {
			// Specifying the sourceCode field (this will help us later to track what leads were entered manually)
			lead.sourceCode = 'STARS:MANUAL';
			this.setState({
				serverStatus: ServerStatuses.PROCESSING
			});

			post('/lead', {}, lead)
				.then((result) => {
					if (this.state.createSavedSearch) {
						return this.refs.leadSearchDetails.updateSearch(result.id, null, null)
							.then(() => {
								return result;
							});
					}
					else {
						return result;
					}
				})
				.then((result) => {
					return get(`/lead/${result.id}`)
						.then((createdLead) => {
							history.push(`/lead-detail/${createdLead.uuid}`);
						});
				})
				.catch((error) => {
					this.setState({
						serverMessage: error.errorMessage || error,
						serverStatus: ServerStatuses.FAIL
					});
				});
		}
		else {
			this.setState({
				displayErrors: true
			});
		}
	}

	render() {
		return <div className="lead-add">
			<div className="main">
				<div className="item">
					<Block style={{ height: "100%" }}>
						<BlockHeader title="New Lead Details" />
						<BlockContent>
							<MessageBin
								status={this.state.serverStatus}
								message={this.state.serverMessage}
							/>
							<FormFieldsMaterial ref="formFieldsComponent"
												className="large"
												fields={this.formFields}
												onSubmit={this.updateUser}
												object={{}}
												displayErrors={this.state.displayErrors}
												onChange={this.handleFormFieldsMaterialChange}
							/>
						</BlockContent>
					</Block>
				</div>
				<div className="item">
					<Block>
						<BlockHeader title="New Lead Saved Search" />
						<BlockContent>
							<Checkbox label="Create Saved Search"
								style={{ width: 'auto' }}
								checked={this.state.createSavedSearch}
								onCheck={(event) => {
									this.setState({
										createSavedSearch: event.target.checked
									});
								}}
							/>
							{this.state.createSavedSearch &&
							<LeadSearchDetails ref="leadSearchDetails" partyId={this.state.partyId} saveButtonVisible={false}/>
							}
						</BlockContent>
					</Block>
				</div>
			</div>
			<div className="buttons">
				<Button
					label="Submit and Save"
					large={true}
					style={{ width: 250, float: 'right' }}
					onClick={this.createLead}
					disabled={this.state.serverStatus === ServerStatuses.PROCESSING}
				/>
				<div className="clear"></div>
			</div>
		</div>;
	}
}
