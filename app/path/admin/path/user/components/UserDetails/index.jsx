'use strict';

import React from 'react';
import update from 'react-addons-update';
import objectPath from 'object-path';
import BPromise from 'bluebird';
import classnames from 'classnames';
import { isEmpty, isEqualWith, filter, cloneDeep, sortBy, chain } from 'lodash';
import { ServerStatuses } from '../../../../../../Constants';
import { get, post, del } from '../../../../../../utils/api';
import { directoryConstants } from '@ylopo/utils/dist/lib/security';
import { getObjectChanges } from '../../../../../../utils/objectUtil';

import Loader from '../../../../../../components/core/Loader';
import MessageBin from '../../../../../../components/core/MessageBin';
import Button from '../../../../../../components/core/Button';
import Formsy from 'formsy-react';
import FormsySelect from 'formsy-material-ui/lib/FormsySelect';
import FormsyText from 'formsy-material-ui/lib/FormsyText';
import FormsyCheckbox from 'formsy-material-ui/lib/FormsyCheckbox';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import MenuItem from 'material-ui/MenuItem';

import { compositeContainer } from '../../../../../../styles/material-ui-theme';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class UserDetails extends React.Component {

	permissionsKey = "customData_permissions";

	static propTypes = {
		userId: React.PropTypes.string,
		onUpdated: React.PropTypes.func,
		onDeleted: React.PropTypes.func
	};

	constructor( props ) {
		super( props );
		this.loadUser = this.loadUser.bind( this );
		this.loadPartiesList = this.loadPartiesList.bind( this );
		this.onFormChange = this.onFormChange.bind( this );
		this.updateUser = this.updateUser.bind( this );
		this.deleteUser = this.deleteUser.bind( this );
		this.addClientPermissionsItem = this.addClientPermissionsItem.bind( this );
		this.deleteClientPermissionsItem = this.deleteClientPermissionsItem.bind( this );
		this.renderClientPermissions = this.renderClientPermissions.bind( this );
		this.state = {
			user: {},
			formValues: {},
			clientsList: [],
			partiesList: [],
			displayErrors: false,
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined
		};
	}

	componentDidMount() {
		this.loadUser();
	}

	loadUser() {
		var userId = this.props.userId;

		this.setState({
			serverStatus: ServerStatuses.LOADING
		});

		return BPromise.props({
			user: userId ? get(`/user/${userId}`) : Promise.resolve({}),
			clients: get('/client', { sort: { label: 'asc' }, active: true, limit: Number.MAX_SAFE_INTEGER })
		}).then((result) => {
			var formValues = cloneDeep(result.user);
			this._convertUserPermissionsToFormsy(formValues);

			this.setState({
				serverStatus: ServerStatuses.READY,
				user: result.user,
				formValues: formValues,
				clientsList: sortBy(result.clients, 'label') // current mf-business-api always sorts be desc
			});

			this.loadPartiesList(objectPath.get(result.user, "customData.clientId"));
		});
	}

	/**
	 * Workaround of formsy don't support "customData.permissions[0]" syntax for now
	 * @param {object} user
	 * @returns {void}
	 * @private
     */
	_convertUserPermissionsToFormsy(user) {
		if (objectPath.get(user, "customData.permissions")) {
			objectPath.set(user, this.permissionsKey, user.customData.permissions);
			delete user.customData.permissions;

			// Workaround of formsy don't support non-boolean checkbox values
			user[this.permissionsKey].forEach((permission) => {
				permission.roles = permission.roles.reduce((result, value) => { result[value] = true; return result; }, {});
			});
		}
	}

	/**
	 * Workaround of formsy don't support "customData.permissions[0]" syntax for now
	 * @param {object} formData
	 * @returns {void}
	 * @private
	 */
	_convertFormsyToUserPermissions(formData) {
		if (formData[this.permissionsKey]) {
			objectPath.set(formData, "customData.permissions", formData[this.permissionsKey]);
			delete formData[this.permissionsKey];

			// Workaround of formsy don't support non-boolean checkbox values
			formData.customData.permissions.forEach((permission) => {
				permission.roles = filter(Object.keys(permission.roles), (roleName) => permission.roles[roleName]);
			});
		}
	}

	loadPartiesList(clientId) {
		if (!clientId) {
			this.setState({
				partiesList: []
			});
			return BPromise.resolve();
		}

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		});

		return get('/party', { limit: 9999, active: true })
			.then((parties) => {
				this.setState({
					partiesList: chain(parties)
						.filter((party) => party !== null)
						.sortBy(p => p.label.toLowerCase())
						.value(),
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

	updateUser(formData) {
		this._convertFormsyToUserPermissions(formData);

		var userId = this.props.userId;
		var isNew = !userId;

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		});

		return Promise.resolve()
			.then(() => {
				var objectChanges = getObjectChanges(formData, this.state.user);
				// Permissions are always rewritten on any change to support deletion
				if (!isEmpty(objectPath.get(formData, "customData.permissions")) ||
					!isEmpty(objectPath.get(this.state.user, "customData.permissions"))) {
					objectPath.set(objectChanges, "customData.permissions", objectPath.get(formData, "customData.permissions") || []);
				}
				if (!isNew && isEmpty(objectChanges)) {
					return null;
				}

				var url = isNew ? '/user' : `/user/${userId}`;
				return post(url, {}, objectChanges);
			})
			.then((userUpdated) => {
				this.setState({
					serverMessage: undefined,
					serverStatus: ServerStatuses.SUCCESS
				});

				if (typeof this.props.onUpdated === 'function') {
					this._convertUserPermissionsToFormsy(userUpdated);
					this.props.onUpdated(userUpdated);
				}
			})
			.catch((error) => {
				this.setState({
					serverMessage: error.errorMessage || error,
					serverStatus: ServerStatuses.FAIL
				});
				return Promise.reject();
			});
	}

	deleteUser() {
		/* eslint-disable no-alert */
		if (!confirm('Are you sure?')) {
			return;
		}
		if (!confirm('Are you really sure? This cannot be undone')) {
			return;
		}
		/* eslint-enable no-alert */
		var userId = this.props.userId;

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		});

		del(`/user/${userId}`)
			.then(() => {
				this.setState({
					serverMessage: undefined,
					serverStatus: ServerStatuses.SUCCESS
				});
				if (typeof this.props.onDeleted === 'function') {
					this.props.onDeleted(userId);
				}
			})
			.catch((error) => {
				this.setState({
					serverMessage: error.errorMessage || error,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	onFormChange(currentValues, isChanged) {
		var model = this.refs.form.getModel();

		var clientId = objectPath.get(model, "customData.clientId");
		if (clientId && clientId !== objectPath.get(this.state.formValues, "customData.clientId")) {
			this.loadPartiesList(objectPath.get(model, "customData.clientId"));
		}

		var directory = model.directory;
		if (directory && (directory !== objectPath.get(this.state.formValues, "directory") ||
			objectPath.get(model, "customData.clientId") !== objectPath.get(this.state.formValues, "customData.clientId"))) {
			this.setState({
				formValues: model
			});
		}
		else if (!isEqualWith(model[this.permissionsKey], this.state.formValues[this.permissionsKey],
				(val1, val2) => val1 && val2 ? val1.partyId === val2.partyId : true)) {
			// Selected parties are changed, need to update list of available parties
			this.setState({
				formValues: model
			});
		}
	}

	addClientPermissionsItem() {
		var model = this.refs.form.getModel();
		if (!model[this.permissionsKey]) {
			model[this.permissionsKey] = [];
		}
		var modifiedFormValues = update(model, {
			[this.permissionsKey]: { $push: [{}] }
		});
		this.setState({
			formValues: modifiedFormValues
		});
	}

	deleteClientPermissionsItem(permission, index) {
		var model = this.refs.form.getModel();
		var modifiedFormValues = update(model, {
			[this.permissionsKey]: { $splice: [[index, 1]] }
		});
		this.setState({
			formValues: modifiedFormValues
		});
	}

	renderClientPermissions() {
		var permissions = objectPath.get(this.state.formValues, this.permissionsKey) || [];
		var alreadyAssignedPartiesIds = permissions.map((permission) => permission.partyId);

		var addNewItemDisabled = this.state.serverStatus === ServerStatuses.PROCESSING ||
			alreadyAssignedPartiesIds.length === this.state.partiesList.length;

		return <Paper className="composite-container list-field" zDepth={0}>
			<h4>Permissions</h4>
			<div className="add-btn-wrapper">
				<Button onClick={this.addClientPermissionsItem}
						label="Add new item"
						disabled={addNewItemDisabled}
						primary={true}/>
			</div>
			{ permissions.map((permission, index) => {
				var roles = permission.roles || {};
				var partiesList = this.state.partiesList.filter((party) =>
					alreadyAssignedPartiesIds.indexOf(party.id) === -1 || party.id === permission.partyId);

				var permissionItemUniqueId = Math.random();
				var errorMessageElemId = `${permissionItemUniqueId}_errorMessage`;

				var rolesRequiredValidation = (formValues, value) => {
					var userRoleChecked = Boolean(formValues[`${this.permissionsKey}[` + index + "][roles][user]"]);
					var adminRoleChecked = Boolean(formValues[`${this.permissionsKey}[` + index + "][roles][admin]"]);
					var isValid = userRoleChecked || adminRoleChecked;
					if (document.getElementById(errorMessageElemId)) {
						document.getElementById(errorMessageElemId).style.display = isValid ? "none" : "block";
					}
					return isValid;
				};

				return <div className="list-field-item" key={permission.partyId}>
					<FormsySelect
						name={`${this.permissionsKey}[` + index + "][partyId]"}
						validations="isExisty"
						validationError="Field is required."
						floatingLabelText="Party"
						labelStyle={{ whiteSpace: "nowrap" }}
						autoWidth={true}
						value={alreadyAssignedPartiesIds.indexOf(permission.partyId) !== -1 ? permission.partyId : null}
					>
						{ partiesList.map((party) =>
							<MenuItem value={party.id} primaryText={`${party.label} (${party.id})`} />)}
					</FormsySelect>
					<div className="clearfix" />
					<FormsyCheckbox
						name={`${this.permissionsKey}[` + index + "][roles][user]"}
						label="User"
						defaultChecked={roles.user}
						style={{ width: 'auto', float: 'left', paddingRight: 34 }}
						validations={{
							rolesRequiredValidation
						}}
					/>
					<FormsyCheckbox
						name={`${this.permissionsKey}[` + index + "][roles][admin]"}
						label="Admin"
						defaultChecked={roles.admin}
						style={{ width: 'auto', float: 'left', paddingRight: 34 }}
						validations={{
							rolesRequiredValidation
						}}
					/>
					<div id={errorMessageElemId} style={{ display: "none" }}>
						<div className="clearfix" />
						<div className="error" style={{ marginTop: 10 }}>At least one role should be selected</div>
					</div>
					<div className="clearfix" />
					<div className="delete-btn-wrapper">
						<IconButton onClick={this.deleteClientPermissionsItem.bind(this, permission, index)}
									disabled={this.state.serverStatus === ServerStatuses.PROCESSING}>
							<NavigationClose />
						</IconButton>
					</div>
				</div>;
			})}
			<PlaceholderForValidation
				name="fake"
				validationError="At least one permissions item should be added"
				validations={{
					permissionsRequiredValidation: (formValues, value) => {
						if (this.refs.form) {
							var model = this.refs.form.getModel();
							return model[this.permissionsKey] && model[this.permissionsKey].length > 0;
						}
						return false;
					}
				}} />
		</Paper>;
	}

	render() {
		var isNew = !this.props.userId;

		return	<div className={ classnames({
			"user-details": true,
			"user-details-loading": this.state.serverStatus === ServerStatuses.LOADING
		})}>
				<MessageBin
					status={this.state.serverStatus}
					message={this.state.serverMessage}
				/>
				<Formsy.Form
					ref="form"
					onChange={this.onFormChange}
					onValidSubmit={this.updateUser}
					disabled={this.state.serverStatus === ServerStatuses.PROCESSING}
				>
					<FormsyText
						name="fullName"
						required
						validationError="Field is required."
						hintText="Full Name"
						floatingLabelText="Full Name"
						value={this.state.user.fullName}
					/>
					<br />
					<FormsyText
						name="emailAddress"
						required
						validations="isEmail"
						validationError="Field value must be a valid email."
						hintText="Email Address"
						floatingLabelText="Email Address"
						value={this.state.user.emailAddress}
					/>
					<br />
					<FormsyText
						name="password"
						type="password"
						hintText="Password"
						floatingLabelText="Password"
						required={isNew}
						validations={{
							matchRegexp: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20})/
						}}
						validationError="Password must contain at least 8 characters, 1 lowecase, 1 uppercase, 1 digit."
					/>
					<br/>
					<FormsyText
						name="confirmPassword"
						type="password"
						hintText="Confirm Password"
						floatingLabelText="Confirm Password"
						validations="equalsField:password"
						validationError="Passwords must match."
					/>
					<br/>
					<FormsySelect
						name="directory"
						validations="isExisty"
						validationError="Field is required."
						disabled={!isNew}
						floatingLabelText="Directory"
						value={this.state.user.directory}
					>
						<MenuItem value={directoryConstants.DIRECTORY_ADMINISTRATORS} primaryText="Administrators" />
						<MenuItem value={directoryConstants.DIRECTORY_CLIENTS} primaryText="Clients" />
					</FormsySelect>
					<br />
					{ this.state.formValues.directory === directoryConstants.DIRECTORY_CLIENTS &&
					<Paper className="composite-container" zDepth={0} style={compositeContainer.style}>
						<div style={compositeContainer.labelStyle}>Client Fields</div>
						<FormsySelect
							name="customData.clientId"
							validations="isExisty"
							validationError="Field is required."
							floatingLabelText="Client"
							labelStyle={{ whiteSpace: "nowrap" }}
							autoWidth={true}
							value={objectPath.get(this.state.user, "customData.clientId")}
						>
							{ this.state.clientsList.map((client) =>
								<MenuItem value={client.id} primaryText={`${client.label} (${client.id})`} />)}
						</FormsySelect>
						<br />
						{this.renderClientPermissions()}
					</Paper>
					}
					<div>
						{ !isNew &&
						<Button
							label="Delete User"
							large={true}
							primary={true}
							style={{ width: 250, float: 'left' }}
							onClick={this.deleteUser}
							disabled={this.state.serverStatus === ServerStatuses.PROCESSING}
						/>
						}
						<Button
							label="Submit and Save"
							large={true}
							style={{ width: 250, float: 'right' }}
							type="submit"
							disabled={this.state.serverStatus === ServerStatuses.PROCESSING}
						/>
						<div className="clearfix"></div>
					</div>
				</Formsy.Form>
			<Loader status={ this.state.serverStatus } />
		</div>;
	}
};

const PlaceholderForValidation = React.createClass({

	// Add the Formsy Mixin
	mixins: [Formsy.Mixin],

	render() {
		// An error message is returned ONLY if the component is invalid
		// or the server has returned an error message
		const errorMessage = this.getErrorMessage();

		return errorMessage ?
			<div>
				<div className="clearfix" />
				<div className="error" style={{ marginTop: 10 }}>{errorMessage}</div>
			</div> : null;
	}
});
