'use strict';

import React from 'react';
import update from 'react-addons-update';
import BPromise from 'bluebird';
import objectPath from 'object-path';
import UsersList from '../UsersList';
import { get } from '../../../../../../utils/api';
import SelectFieldClassic from '../../../../../../components/core/SelectFieldClassic';
import MenuItem from 'material-ui/MenuItem';
import { directoryConstants } from '@ylopo/utils/dist/lib/security';
import { ServerStatuses, SortDirection } from '../../../../../../Constants';
import { sortBy, reverse, cloneDeep, some, chain, isEmpty } from 'lodash';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class UsersListContainer extends React.Component {
	constructor() {
		super();
		this.loadUsers = this.loadUsers.bind(this);
		this.loadClientsAsPromise = this.loadClientsAsPromise.bind(this);
		this.loadPartiesAsPromise = this.loadPartiesAsPromise.bind(this);
		this._getFilteredSortedUsers = this._getFilteredSortedUsers.bind(this);
		this._getFilteredParties = this._getFilteredParties.bind(this);
		this.onFilterChanged = this.onFilterChanged.bind(this);
		this.onSortChanged = this.onSortChanged.bind(this);
		this.state = {
			filters: {
				directory: '',
				clientId: null,
				partyId: null
			},
			usersDataSource: [],
			clientsDataSource: [],
			partiesDataSource: [],
			users: [],
			parties: [],
			sort: 'fullName',
			sortDirection: SortDirection.ASC,
			serverStatus: ServerStatuses.LOADING,
			serverMessage: undefined
		};
	}

	componentDidMount() {
		this.loadUsers();
	}

	loadUsers() {
		if (this.state.serverStatus !== ServerStatuses.LOADING) {
			this.setState({
				serverStatus: ServerStatuses.PROCESSING
			});
		}

		get('/user', { limit: 9999, sort: this.state.sort, dir: this.state.sortDirection })
			.then((users) => {
				return BPromise.props({
					clientsDataSource: this.loadClientsAsPromise(users),
					partiesDataSource: this.loadPartiesAsPromise(users),
					usersDataSource: users
				});
			})
			.then((results) => {
				this.setState({
					usersDataSource: results.usersDataSource,
					clientsDataSource: results.clientsDataSource,
					partiesDataSource: results.partiesDataSource,
					users: this._getFilteredSortedUsers(results.usersDataSource, this.state.filters, this.state.sort, this.state.sortDirection),
					serverStatus: ServerStatuses.SUCCESS
				});
			})
			.catch((error) => {
				this.setState({
					serverMessage: error.errorMessage,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	loadClientsAsPromise(usersDataSource) {
		return get('/client', { sort: { label: 'asc' }, active: true, limit: Number.MAX_SAFE_INTEGER })
			.then((clients) => {
				var usersClientIds = usersDataSource.map(user => objectPath.get(user, 'customData.clientId'))
					.filter(clientId => clientId);

				return chain(clients)
					.filter(client => usersClientIds.indexOf(client.id) !== -1)
					.sortBy('label') // current mf-business-api always sorts be desc
					.sortedUniq()
					.value();
			});
	}

	loadPartiesAsPromise(usersDataSource) {
		return get('/party', { limit: 9999 })
			.then((parties) => {
				var usersPartiesIds = chain(usersDataSource)
					.map(user => objectPath.get(user, 'customData.permissions'))
					.filter(permissions => permissions)
					.map(permissions => permissions.map((p) => objectPath.get(p, 'partyId')))
					.flatten()
					.filter(partyId => partyId)
					.sort()
					.sortedUniq()
					.value();

				return chain(parties)
					.filter(party => party !== null &&
						party.active &&
						usersPartiesIds.indexOf(party.id) !== -1)
					.sortBy('label') // current mf-business-api always sorts be desc
					.sortedUniq()
					.value();
			});
	}

	onFilterChanged(filterName, event, key, value) {
		var newFilters = this.state.filters;
		var newSortDirection = this.state.sortDirection;

		if (filterName === 'directory' && value !== this.state.filters.directory) {
			newFilters = update(newFilters, { partyId: { $set: null }, clientId: { $set: null } });
			newSortDirection = SortDirection.ASC;
		}
		else if (filterName === 'clientId' && value !== this.state.filters.clientId) {
			newFilters = update(newFilters, { partyId: { $set: null } });
			this.setState({
				parties: this._getFilteredParties(this.state.partiesDataSource, this.state.usersDataSource, value)
			});
		}

		newFilters = update(newFilters, { [filterName]: { $set: value } });
		this.setState({
			sortDirection: newSortDirection,
			filters: newFilters,
			users: this._getFilteredSortedUsers(this.state.usersDataSource, newFilters, this.state.sort, newSortDirection)
		});
	}

	onSortChanged(sort) {
		var dir = this.state.sortDirection;
		var dirinvert = this.state.sortDirection === SortDirection.DESC ? SortDirection.ASC : SortDirection.DESC;
		if (sort === this.state.sort) {
			dir = dirinvert;
		}

		this.setState({
			sort: sort,
			sortDirection: dir,
			users: this._getFilteredSortedUsers(this.state.usersDataSource, this.state.filters, sort, dir)
		});
	}

	_getFilteredSortedUsers(usersDataSource, filters, sort, sortDirection) {
		var newUsers = cloneDeep(usersDataSource);

		if (filters.directory) {
			newUsers = newUsers.filter(user => user.directory === filters.directory);
		}
		if (filters.clientId) {
			newUsers = newUsers.filter(user => objectPath.get(user, 'customData.clientId') === filters.clientId);
		}
		if (filters.partyId) {
			newUsers = newUsers.filter(user => {
				var permissions = objectPath.get(user, 'customData.permissions');
				if (permissions) {
					return some(permissions, (permission) => permission.partyId === filters.partyId);
				}
				else {
					return false;
				}
			});
		}

		newUsers = sortBy(newUsers, sort);
		if (sortDirection === SortDirection.DESC) {
			reverse(newUsers);
		}
		return newUsers;
	}

	_getFilteredParties(partiesDataSource, usersDataSource, clientId) {
		var usersPartiesIds = chain(usersDataSource)
			.filter(user => objectPath.get(user, 'customData.clientId') === clientId)
			.map(user => objectPath.get(user, 'customData.permissions'))
			.filter(permissions => permissions)
			.map(permissions => permissions.map((p) => objectPath.get(p, 'partyId')))
			.flatten()
			.filter(partyId => partyId)
			.value();

		return chain(usersPartiesIds)
			.map(partyId => partiesDataSource.find((party) => party.id === partyId) || { id: partyId, label: '' })
			.sortBy('label') // current mf-business-api always sorts be desc
			.sortedUniq()
			.value();
	}

	render() {
		return <div>
				<div className="filters">
					<div className="filter">
						<div className="label">Directory:</div>
						<SelectFieldClassic key="directory" value={this.state.filters.directory}
											onChange={this.onFilterChanged.bind(this, "directory")}
											disabled={this.state.serverStatus === ServerStatuses.PROCESSING ||
												this.state.serverStatus === ServerStatuses.LOADING}>
							<MenuItem key="any" value="" primaryText="Any Directory" />
							{
								Object.keys(directoryConstants).map((directoryKey) => {
									var directory = directoryConstants[directoryKey];
									return <MenuItem key={directory} value={directory} primaryText={directory}/>;
								})
							}
						</SelectFieldClassic>
					</div>
					<div className="filter">
						<div className="label">Client:</div>
						<SelectFieldClassic key="clientId" value={this.state.filters.clientId}
											onChange={this.onFilterChanged.bind(this, "clientId")}
											labelStyle={{ whiteSpace: "nowrap", overflow: "hidden" }}
											autoWidth={true}
											disabled={this.state.serverStatus === ServerStatuses.PROCESSING ||
												this.state.filters.directory !== directoryConstants.DIRECTORY_CLIENTS ||
												isEmpty(this.state.clientsDataSource)}>
							<MenuItem key="any" value={null} primaryText="Any Client" />
							{
								this.state.clientsDataSource.map((client) => {
									return <MenuItem key={client.id} value={client.id} primaryText={`${client.label} (${client.id})`}/>;
								})
							}
						</SelectFieldClassic>
					</div>
					<div className="filter">
						<div className="label">Party:</div>
						<SelectFieldClassic key="partyId" value={this.state.filters.partyId}
											onChange={this.onFilterChanged.bind(this, "partyId")}
											labelStyle={{ whiteSpace: "nowrap", overflow: "hidden" }}
											autoWidth={true}
											disabled={this.state.serverStatus === ServerStatuses.PROCESSING ||
												this.state.filters.directory !== directoryConstants.DIRECTORY_CLIENTS ||
												isEmpty(this.state.parties)}>
							<MenuItem key="any" value={null} primaryText="Any Party" />
							{
								this.state.parties.map((party) => {
									return <MenuItem key={party.id} value={party.id} primaryText={`${party.label} (${party.id})`}/>;
								})
							}
						</SelectFieldClassic>
					</div>
					<div className="clear"></div>
				</div>
				<UsersList sort={this.state.sort}
					sortDirection={this.state.sortDirection}
					users={this.state.users}
					serverStatus={this.state.serverStatus}
					onSortChanged={this.onSortChanged}
					onUserUpdated={this.loadUsers}
				/>
			</div>;
	}
}
