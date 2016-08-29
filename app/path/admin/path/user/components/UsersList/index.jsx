'use strict';

import React from 'react';
import { assign } from 'lodash';
import { ServerStatuses, SortDirection } from '../../../../../../Constants';
import { directoryConstants } from '@ylopo/utils/dist/lib/security';
import objectPath from 'object-path';

import { Block, BlockHeader, BlockContent } from '../../../../../../components/core/Block';
import Table from '../../../../../../components/core/Table/table';
import TableBody from '../../../../../../components/core/Table/table-body';
import TableHeader from '../../../../../../components/core/Table/table-header';
import TableHeaderColumn from '../../../../../../components/core/Table/table-header-column';
import TableRow from '../../../../../../components/core/Table/table-row';
import TableRowColumn from '../../../../../../components/core/Table/table-row-column';
import Button from '../../../../../../components/core/Button';
import Dialog from '../../../../../../components/core/Dialog';
import ContentAddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';

import UserDetails from '../UserDetails';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class UsersList extends React.Component {

	static propTypes = {
		style: React.PropTypes.string,
		sort: React.PropTypes.string,
		sortDirection: React.PropTypes.oneOf(Object.keys(SortDirection).map(key => SortDirection[key])),
		users: React.PropTypes.arrayOf(React.PropTypes.object),
		serverStatus: React.PropTypes.oneOf(Object.keys(ServerStatuses)),
		onSortChanged: React.PropTypes.func,
		onUserUpdated: React.PropTypes.func
	};

	constructor() {
		super();
		this.state = {
			editDialogOpen: false,
			editDialogUser: null
		};
		this.newUserClick = this.newUserClick.bind(this);
		this.editUserClick = this.editUserClick.bind(this);
		this.renderDialog = this.renderDialog.bind(this);
		this.dialogClose = this.dialogClose.bind(this);
		this.setSort = this.setSort.bind(this);
	}

	setSort(sort) {
		if (this.props.onSortChanged) {
			this.props.onSortChanged(sort);
		}
	}

	renderDialog() {
		return <Dialog
			key="content_dialog"
			title={this.state.editDialogUser ?
				'Edit User: “' + this.state.editDialogUser.fullName + '”' :
				'Add User'}
			modal={true}
			open={this.state.editDialogOpen}
			onRequestClose={this.dialogClose}
			contentStyle={{ width: 700 }}
			style={{ paddingTop: 0 }}
			repositionOnUpdate={false}
		>
			<UserDetails
				user={this.state.editDialogSearch}
				userId={objectPath.get(this.state, 'editDialogUser.id')}
				onUpdated={(user) => {
					this.dialogClose();
					if (this.props.onUserUpdated) {
						this.props.onUserUpdated(user);
					}
				}}
				onDeleted={(user) => {
					this.dialogClose();
					if (this.props.onUserUpdated) {
						this.props.onUserUpdated(user);
					}
				}}/>
		</Dialog>;
	}

	dialogClose() {
		this.setState({
			editDialogOpen: false,
			editDialogUser: null
		});
	}

	newUserClick() {
		this.setState({
			editDialogOpen: true
		});
		return false;
	}

	editUserClick(user) {
		this.setState({
			editDialogOpen: true,
			editDialogUser: user
		});
		return false;
	}

	renderPermissionsColumn(permissions, user) {
		if (user.directory === directoryConstants.DIRECTORY_CLIENTS) {
			return <div>
				{permissions && permissions.map((permission) => {
					return permission.partyId + ': ' + permission.roles.join(', ') + ' ';
				})}
			</div>;
		}
		else {
			return JSON.stringify(permissions);
		}
	}

	renderRows() {
		if ( this.props.users && this.props.users.length > 0 ) {
			return this.props.users.map(( user, index ) => {
				return <TableRow key={user.id}>
					<TableRowColumn key="column1" className="column1">
						{user.fullName}
					</TableRowColumn>
					<TableRowColumn key="column2" className="column2">
						{user.emailAddress}
					</TableRowColumn>
					<TableRowColumn key="column3" className="column3">
						{user.directory}
					</TableRowColumn>
					<TableRowColumn key="column4" className="column4">
						{objectPath.get(user, 'customData.clientId')}
					</TableRowColumn>
					<TableRowColumn key="column5" className="column5">
						{this.renderPermissionsColumn(objectPath.get(user, 'customData.permissions'), user)}
					</TableRowColumn>
					<TableRowColumn key="column6" className="column6"
									style={{ width: 80 }}>
						{/* eslint-disable no-script-url */}
						<a href="javascript:;" onClick={this.editUserClick.bind(this, user)}>Edit</a>
						{/* eslint-enable no-script-url */}
					</TableRowColumn>
				</TableRow>;
			});
		}
		else {
			return null;
		}
	}

	render() {
		// Have to create component to set width because Material-UI Button render clears icon styles
		const AddCircleOutlineIcon = (props) => {
			var { style, ...other } = props;

			style = assign(style, {
				width: 18,
				height: 18
			});

			return <ContentAddCircleOutline style={style} {...other} />;
		};

		return <Block style={{ position: "relative" }}>
			<BlockHeader title="Users" />
			<Button label="Create New"
					primary={true}
					style={{ position: 'absolute', top: 8, right: 10 }}
					icon={<AddCircleOutlineIcon />}
					onClick={this.newUserClick}/>
			<BlockContent style={{ padding: 0 }}>
				<Table key="table" className="users-list" selectable={false}>
					<TableHeader className="users-list-header"
								 adjustForCheckbox={false}
								 displayRowCheckbox={false}
								 displaySelectAll={false}>
						<TableRow>
							<TableHeaderColumn key="column1" className="column1"
								sortable={true}
								sortableIsActive={this.props.sort === 'fullName'}
								sortableSortDirection={this.props.sortDirection}
								onSortClick={this.setSort.bind(this, 'fullName')}
								disabled={this.props.serverStatus === ServerStatuses.PROCESSING}>
								Full Name
							</TableHeaderColumn>
							<TableHeaderColumn key="column2" className="column2"
								sortable={true}
								sortableIsActive={this.props.sort === 'emailAddress'}
								sortableSortDirection={this.props.sortDirection}
								onSortClick={this.setSort.bind(this, 'emailAddress')}
								disabled={this.props.serverStatus === ServerStatuses.PROCESSING}>
								Email Address
							</TableHeaderColumn>
							<TableHeaderColumn key="column3" className="column3">
								Directory
							</TableHeaderColumn>
							<TableHeaderColumn key="column4" className="column4"
								sortable={true}
								sortableIsActive={this.props.sort === 'customData.clientId'}
								sortableSortDirection={this.props.sortDirection}
								onSortClick={this.setSort.bind(this, 'customData.clientId')}
								disabled={this.props.serverStatus === ServerStatuses.PROCESSING}>
								Client
							</TableHeaderColumn>
							<TableHeaderColumn key="column5" className="column5">
								Permissions
							</TableHeaderColumn>
							<TableHeaderColumn key="column6" className="column6" style={{ width: 80 }} />
						</TableRow>
					</TableHeader>
					<TableBody key="table-body" className="users-list-body" displayRowCheckbox={false} stripedRows={true}>
						{ this.props.serverStatus === ServerStatuses.LOADING &&
							<TableRow key="rowLoading">
								<TableRowColumn colSpan={6} style={{ textAlign: "center" }}>
									Loading...
								</TableRowColumn>
							</TableRow>
						}
						{ this.renderRows() }
					</TableBody>
				</Table>
				{ this.renderDialog() }
			</BlockContent>
		</Block>;
	}
}
