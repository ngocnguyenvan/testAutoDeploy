'use strict';

import React from 'react';
import { Link } from 'react-router';
import objectPath from 'object-path';

import FormFields from '../../../../components/input/FormFields';
import { ServerStatuses } from '../../../../Constants';
import ProgressButton from '../../../../components/core/ProgressButton';

import UserStore from '../../../../stores/UserStore';
import { login } from '../../../../actions/authActionCreators';

import formUtil from '../../../../utils/formUtil';
import history from '../../../../history';

var formFields = [
	{
		autoFocus: true,
		type: 'text',
		name: 'emailAddress',
		placeholder: 'Email address',
		attribute: 'emailAddress',
		required: true
	},
	{
		type: 'password',
		name: 'password',
		placeholder: 'Password',
		attribute: 'password',
		required: true
	}
];

class Login extends React.Component {

	static propTypes = {
		className: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.login = this.login.bind( this );
		this.fieldChanged = this.fieldChanged.bind( this );
		this.buttonStatusChange = this.buttonStatusChange.bind( this );
		this.handleUserStoreChange = this.handleUserStoreChange.bind( this );
		this.triggerButtonClick = this.triggerButtonClick.bind( this );
		this.timeout = undefined;
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
		clearTimeout( this.timeout );
	}

	handleUserStoreChange() {
		var userState = UserStore.getState();

		if ( userState.serverStatus === ServerStatuses.SUCCESS ) {
			UserStore.removeChangeListener( this.handleUserStoreChange );

			// Help the button change to a "success" and transition to admin, nicely.
			this.setState(
				{ buttonStatus: ServerStatuses.SUCCESS },
				() => {
					clearTimeout( this.timeout );
					this.timeout = setTimeout( () => {
						history.push( objectPath.get( this.props, 'location.query.redirect' ) || '/' );
					}, 300 );
				}
			);
		}
		else {
			this.setState({
				buttonStatus: userState.serverStatus,
				user: userState
			});
		}
	}

	login() {
		if ( formUtil.areFieldsValid( this.state.user, formFields ) ) {
			login( this.state.user );
		}
		else {
			clearTimeout( this.timeout );
			this.timeout = setTimeout( () => {
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
				onChange={this.fieldChanged}
				onSubmit={this.triggerButtonClick}
				object={this.state.user}
				displayErrors={this.state.displayErrors}
			/>
			<div className="password-reset pull-right">
				<span>Forgot Password?{' '}</span><Link to={'/auth/forgotPassword'}>Reset</Link>
			</div>
			<ProgressButton
				ref="progressButton"
				onClick={this.login}
				status={this.state.buttonStatus}
				statusChangeCallback={this.buttonStatusChange}
			>
				Login
			</ProgressButton>
			<div className="footer">
				{/* Not a member yet?{' '}
				<Link to={'/auth/registration'}>Signup</Link>*/}
			</div>
		</div>;
	}
}

module.exports = Login;
