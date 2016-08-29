'use strict';

import React from 'react';
import { Link } from 'react-router';
import objectPath from 'object-path';

import FormFields from '../../../../components/input/FormFields';
import { ServerStatuses } from '../../../../Constants';
import ProgressButton from '../../../../components/core/ProgressButton';

import UserStore from '../../../../stores/UserStore';
import { registerUser } from '../../../../actions/authActionCreators';

import formUtil from '../../../../utils/formUtil';
import history from '../../../../history';

var formFields = [
	{
		autoFocus: true,
		type: 'text',
		name: 'fullName',
		attribute: 'fullName',
		placeholder: 'Full Name',
		required: true
	},
	{
		type: 'text',
		name: 'emailAddress',
		placeholder: 'Email Address',
		attribute: 'emailAddress',
		required: true
	},
	{
		type: 'password',
		name: 'password',
		placeholder: 'Password',
		attribute: 'password',
		required: true
	},
	{
		type: 'password',
		name: 'confirmPassword',
		placeholder: 'Confirm Password',
		attribute: 'confirmPassword',
		required: true,
		validator: ( value, user ) => {
			return value && value === objectPath.get( user, 'password' );
		}
	},
	{
		type: 'checkbox',
		name: 'agreeToTerms',
		attribute: 'agreeToTerms',
		label: 'I agree to the Terms of Service and Privacy Policy',
		required: true
	}
];

class Registration extends React.Component {

	static propTypes = {
		className: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.registerUser = this.registerUser.bind( this );
		this.fieldChanged = this.fieldChanged.bind( this );
		this.buttonStatusChange = this.buttonStatusChange.bind( this );
		this.handleUserStoreChange = this.handleUserStoreChange.bind( this );
		this.triggerButtonClick = this.triggerButtonClick.bind( this );
		this.state = {
			displayErrors: false,
			buttonStatus: ServerStatuses.READY,
			user: UserStore.getState()
		};
	}

	componentDidMount() {
		UserStore.addChangeListener( this.handleUserStoreChange );
	}

	componentWillUnmount() {
		UserStore.removeChangeListener( this.handleUserStoreChange );
	}

	handleUserStoreChange() {
		var userState = UserStore.getState();

		if ( userState.serverStatus === ServerStatuses.SUCCESS ) {
			UserStore.removeChangeListener( this.handleUserStoreChange );

			// delay to make it "nicer"
			setTimeout( () => {
				history.push('/admin');
			}, 500 );
		}
		else {
			this.setState({
				buttonStatus: userState.serverStatus,
				user: userState
			});
		}
	}

	registerUser() {
		if ( formUtil.areFieldsValid( this.state.user, formFields ) ) {
			registerUser( this.state.user );
		}
		else {
			setTimeout( () => {
				this.setState({
					displayErrors: true,
					buttonStatus: ServerStatuses.FAIL
				});
			}, 500 );
		}
	}

	buttonStatusChange( status ) {
		this.setState({
			buttonStatus: status
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
			{ this.state.user.serverMessage &&
				<div className="message-bin">{this.state.user.serverMessage }</div>
			}
			<FormFields
				fields={formFields}
				onSubmit={this.triggerButtonClick}
				onChange={this.fieldChanged}
				object={this.state.user}
				displayErrors={this.state.displayErrors}
			/>
			<ProgressButton
				ref="progressButton"
				onClick={this.registerUser}
				status={this.state.buttonStatus}
				statusChangeCallback={this.buttonStatusChange}
			>
				Register
			</ProgressButton>
			<div className="footer">
				Already Registered?{' '}
				<Link to={"/auth/login"}>Login</Link>
			</div>
		</div>;
	}
}

module.exports = Registration;
