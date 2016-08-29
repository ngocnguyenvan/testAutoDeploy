'use strict';

import React from 'react';
import objectPath from 'object-path';

import { Block, BlockHeader, BlockContent } from '../../../../components/core/Block';
import Button from '../../../../components/core/Button';

import userActions from '../../../../actions/userActionCreators';
import FormFieldsMaterial from '../../../../components/input/FormFieldsMaterial';
import formUtil, { Validators } from '../../../../utils/formUtil';
import { ServerStatuses } from '../../../../Constants';
import UserStore from '../../../../stores/UserStore';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

var formFields = [
	{
		autoFocus: true,
		type: 'text',
		name: 'fullName',
		attribute: 'fullName',
		placeholder: 'Full Name',
		validator: Validators.required
	},
	{
		type: 'text',
		name: 'emailAddress',
		placeholder: 'Email Address',
		attribute: 'emailAddress',
		validators: [Validators.required, Validators.email]
	},
	{
		type: 'password',
		name: 'password',
		placeholder: 'Password',
		attribute: 'password'
	},
	{
		type: 'password',
		name: 'confirmPassword',
		placeholder: 'Confirm Password',
		attribute: 'confirmPassword',
		validator: function validator( value, user ) {
			validator.errorText = 'Passwords must match.';

			value = value || '';
			var password = objectPath.get( user, 'password' ) || '';
			return value === password;
		}
	}
];

export default class Account extends React.Component {

	constructor() {
		super();
		this.updateUser = this.updateUser.bind(this);
		this.fieldChanged = this.fieldChanged.bind(this);
		this.handleUserStoreChange = this.handleUserStoreChange.bind(this);

		var { password, confirmPassword, ...userDetails } = UserStore.getState();
		this.state = {
			displayErrors: false,
			formFields: formFields,
			buttonStatus: ServerStatuses.READY,
			user: userDetails
		};
	}

	componentDidMount() {
		UserStore.addChangeListener( this.handleUserStoreChange );
	}

	componentWillUnmount() {
		UserStore.removeChangeListener( this.handleUserStoreChange );
	}

	handleUserStoreChange() {
		var { password, confirmPassword, ...userDetails } = UserStore.getState();
		this.setState({
			user: userDetails,
			buttonStatus: userDetails.serverStatus
		});
	}

	fieldChanged() {
		if (this.state.buttonStatus !== ServerStatuses.READY) {
			this.setState({
				buttonStatus: ServerStatuses.READY
			});
		}
	}

	updateUser() {
		var userUpdated = this.refs.formFieldsComponent.getFieldsStateObject();
		if ( formUtil.areFieldsValid( userUpdated, this.state.formFields ) ) {
			if (!userUpdated.password) {
				delete userUpdated.password;
				delete userUpdated.confirmPassword;
			}

			this.setState({
				buttonStatus: ServerStatuses.PROCESSING
			});
			userActions.updateUser(userUpdated);
		}
		else {
			this.setState({
				displayErrors: true,
				buttonStatus: ServerStatuses.FAIL
			});
		}
	}

	render() {
		return <div className="page-account">
			<Block className="wrapper">
				<BlockHeader title="My Account" />
				<BlockContent>
					{ this.state.user.serverMessage ?
					<div className="message-bin">{this.state.user.serverMessage}</div> : null
						}
					<FormFieldsMaterial ref="formFieldsComponent"
						fields={this.state.formFields}
						onSubmit={this.updateUser}
						onChange={this.fieldChanged}
						object={this.state.user}
						displayErrors={this.state.displayErrors}
					/>
					<div className="form-buttons">
						<Button primary={true} onClick={this.updateUser}
									label={this.state.buttonStatus === ServerStatuses.SUCCESS ? 'Saved' : 'Save'}
									backgroundColor={this.state.buttonStatus === ServerStatuses.SUCCESS ? '#C3DA62' : ''}
									disabled={this.state.buttonStatus === ServerStatuses.PROCESSING} />
					</div>
				</BlockContent>
			</Block>
		</div>;
	}
}
