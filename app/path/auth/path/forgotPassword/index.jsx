'use strict';

import React from 'react';
import { Link } from 'react-router';
import objectPath from 'object-path';

import { post } from '../../../../utils/api';
import { Validators } from '../../../../utils/formUtil';
import FormFields from '../../../../components/input/FormFields';
import { ServerStatuses } from '../../../../Constants';
import ProgressButton from '../../../../components/core/ProgressButton';

import history from '../../../../history';

var formFields = [
	{
		autoFocus: true,
		type: 'text',
		name: 'emailAddress',
		placeholder: 'Email address',
		attribute: 'emailAddress',
		required: true
	}
];

class ForgotPassword extends React.Component {

	static propTypes = {
		className: React.PropTypes.string
	};

	static contextTypes = {
		location: React.PropTypes.object
	};

	constructor( props ) {
		super( props );
		this.resetPassword = this.resetPassword.bind( this );
		this.fieldChanged = this.fieldChanged.bind( this );
		this.buttonStatusChange = this.buttonStatusChange.bind( this );
		this.triggerButtonClick = this.triggerButtonClick.bind( this );
		this.timeout = undefined;
		this.state = {
			displayErrors: false,
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined,
			user: {
				emailAddress: undefined
			}
		};
	}

	componentDidMount() {
		this.setState({
			user: {
				emailAddress: this.context.location.query.emailAddress
			}
		});
	}

	resetPassword() {
		if (Validators.email(this.state.user.emailAddress, this.state.user)) {
			post('/auth/resetPassword',
				{},
				{
					email: this.state.user.emailAddress
				})
				.then(() => {
					this.setState({
						serverMessage: undefined,
						serverStatus: ServerStatuses.SUCCESS
					});
					// delay to make it "nicer"
					setTimeout(() => {
						history.push('/auth/login');
					}, 1500);
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
				serverMessage: Validators.email.errorText,
				serverStatus: ServerStatuses.FAIL
			});
		}
	}

	buttonStatusChange( status ) {
		this.setState({
			serverStatus: status
		});
	}

	fieldChanged( newValue, details ) {
		var userUpdate = objectPath.get( this.state, 'user' );
		objectPath.set( userUpdate, details.attribute, newValue );
		if ( details.validator ) {
			details.validator( newValue, userUpdate );
		}
		this.setState({ user: userUpdate });
	}

	triggerButtonClick() {
		this.refs.progressButton.handleClick();
	}

	render() {
		return <div className={this.props.className}>
			{ this.state.serverMessage &&
				<div className="message-bin">{this.state.serverMessage }</div>
			}
			<p style={{ marginBottom: 35 }}>Enter your e-mail address below to reset your password.</p>
			<FormFields
				ref="form"
				fields={formFields}
				onChange={this.fieldChanged}
				onSubmit={this.triggerButtonClick}
				object={this.state.user}
				displayErrors={this.state.displayErrors}
			/>
			<ProgressButton
				ref="progressButton"
				onClick={this.resetPassword}
				status={this.state.serverStatus}
				statusChangeCallback={this.buttonStatusChange}
			>
				Reset
			</ProgressButton>
			<div className="footer">
				Already Registered?{' '}
				<Link to={"/auth/login"}>Login</Link>
			</div>
		</div>;
	}
}

module.exports = ForgotPassword;
