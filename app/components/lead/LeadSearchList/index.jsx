/*

Lead Search List Container


Helps with loading a lead search list

*/
'use strict';

import React from 'react';

import objectPath from 'object-path';
import moment from 'moment';
import { assign, filter, isEmpty } from 'lodash';
import { ServerStatuses } from '../../../Constants';
import { get } from '../../../utils/api';
import { SavedSearchType } from '@ylopo/models-constants';

import { Block, BlockHeader, BlockContent } from '../../core/Block';
import Table from '../../core/Table/table';
import TableBody from '../../core/Table/table-body';
import TableHeader from '../../core/Table/table-header';
import TableHeaderColumn from '../../core/Table/table-header-column';
import TableRow from '../../core/Table/table-row';
import TableRowColumn from '../../core/Table/table-row-column';
import Button from '../../core/Button';
import Dialog from '../../core/Dialog';
import LeadSearchDetails from '../LeadSearchDetails';

import ContentAddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';

if (process.env.BROWSER) {
	require( './styles.less' );
}

export default class LeadSearchList extends React.Component {

	include = 'savedSearches.searchAlerts';

	static propTypes = {
		leadId: React.PropTypes.number,
		leadUuid: React.PropTypes.string,
		style: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.loadSearches = this.loadSearches.bind( this );
		this.newSearchClick = this.newSearchClick.bind( this );
		this.editSearchClick = this.editSearchClick.bind( this );
		this.dialogClose = this.dialogClose.bind( this );
		this.renderRows = this.renderRows.bind( this );
		this.renderDialog = this.renderDialog.bind( this );
		this.onSearchUpdated = this.onSearchUpdated.bind( this );
		this.onSearchDeleted = this.onSearchDeleted.bind( this );
		this._isSavedSearchHaveActiveAlerts = this._isSavedSearchHaveActiveAlerts.bind( this );
		this._getFormattedSavedSearchName = this._getFormattedSavedSearchName.bind( this );
		this.state = {
			savedSearchlist: [],
			serverStatus: ServerStatuses.LOADING,
			serverMessage: undefined,
			editDialogOpen: false,
			partyId: null
		};
	}

	componentWillMount() {
		this.loadSearches(this.props.leadId, this.props.leadUuid, { include: this.include });
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.leadId === nextProps.leadId && this.props.leadUuid === nextProps.leadUuid &&
			this.state === nextState) {
			return false;
		}
		return true;
	}

	loadSearches( leadId, leadUuid, options ) {
		var url = null;
		if (leadId) {
			url = `/lead/${ leadId }/search`;
		}
		else if (leadUuid) {
			url = `/open/${ leadUuid }/search`;
		}

		if (this.state.serverStatus !== ServerStatuses.LOADING) {
			this.setState({
				serverStatus: ServerStatuses.PROCESSING
			});
		}

		get(url, options)
			.then((results) => {
				this.setState({
					savedSearchlist: results.data.savedSearches,
					serverStatus: ServerStatuses.SUCCESS,
					partyId: results.data.partyId
				});
			})
			.catch((error) => {
				this.setState({
					serverMessage: error.errorMessage,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	newSearchClick() {
		this.setState({
			editDialogOpen: true
		});
		return false;
	}

	editSearchClick(search) {
		this.setState({
			editDialogOpen: true,
			editDialogSearch: search
		});
		return false;
	}

	dialogClose() {
		this.setState({
			editDialogOpen: false,
			editDialogSearch: null
		});
	}

	onSearchUpdated(search) {
		this.loadSearches(this.props.leadId, this.props.leadUuid, { include: this.include });
	}

	onSearchDeleted(searchId) {
		this.loadSearches(this.props.leadId, this.props.leadUuid, { include: this.include });
	}

	_isSavedSearchHaveActiveAlerts(savedSearch) {
		var result = !isEmpty(savedSearch.searchAlerts) &&
			!isEmpty(filter(savedSearch.searchAlerts, (alert) => alert.optOutDate === null));
		return result;
	}

	_getFormattedSavedSearchName(savedSearch) {
		var nameParts = [];

		if (!isEmpty(savedSearch.label)) {
			nameParts.push(savedSearch.label);
		}
		if (!isEmpty(savedSearch.friendlySearchDescription)) {
			nameParts.push(savedSearch.friendlySearchDescription);
		}

		return nameParts.join(': ');
	}

	renderDialog() {
		return <Dialog
			key="content_dialog"
			title={this.state.editDialogSearch ?
				'Edit Search: “' + this._getFormattedSavedSearchName(this.state.editDialogSearch) + '”' :
				'Add Search'}
			modal={false}
			open={this.state.editDialogOpen}
			onRequestClose={this.dialogClose}
			titleStyle={{ paddingRight: 30 }}
			contentStyle={{ maxWidth: 700 }}
		>
			<LeadSearchDetails
				leadId={this.props.leadId}
				leadUuid={this.props.leadUuid}
				search={this.state.editDialogSearch}
				searchId={objectPath.get(this.state, 'editDialogSearch.id')}
				partyId={this.state.partyId}
				deleteButtonVisible={true}
				onUpdated={(search) => {
					this.dialogClose();
					this.onSearchUpdated(search);
				}}
				onDeleted={(search) => {
					this.dialogClose();
					this.onSearchDeleted(search);
				}}/>
		</Dialog>;
	}

	renderRowsFeatured() {
		var savedSearches = filter(this.state.savedSearchlist, (savedSearch) => this._isSavedSearchHaveActiveAlerts(savedSearch));

		if (!isEmpty(savedSearches)) {
			return savedSearches.map((search, index) => {
				var lastAlertSentDate = !isEmpty(search.searchAlerts) && search.searchAlerts[0].lastSentDate ?
					moment(search.searchAlerts[0].lastSentDate).format('L') : '';

				return <TableRow key={search.id}
								 className="row-featured"
								 style={{ backgroundColor: '#9eb445', height: 60 }}>
					<TableRowColumn key="column1"
									className="column1"
									style={{ color: '#fff', fontWeight: 600 }}>
						<div style={{ width: 55, display: 'inline-block' }}>
							<img src={require('../../../assets/images/star-icon.png')} />
						</div>
						{search.type === SavedSearchType.dynamic &&
							<div style={{ width: 55, display: 'inline-block' }}>
								<img src={require('../../../assets/images/dynamic-saved-search-icon.png')} />
							</div>
						}
						{this._getFormattedSavedSearchName(search)}
					</TableRowColumn>
					<TableRowColumn key="column2"
									className="column2"
									style={{ color: '#fff', fontWeight: 600 }}>
						{lastAlertSentDate}
					</TableRowColumn>
					<TableRowColumn key="column3"
									className="column3">
						<Button label="Edit"
								invert={true}
								style={{ float: 'right' }}
								onClick={this.editSearchClick.bind(this, search)} />
					</TableRowColumn>
				</TableRow>;
			});
		}
		else {
			return null;
		}
	}

	renderRows() {
		var savedSearches = filter(this.state.savedSearchlist, (savedSearch) => !this._isSavedSearchHaveActiveAlerts(savedSearch));

		if (!isEmpty(savedSearches)) {
			return savedSearches.map((search, index) => {
				var lastAlertSentDate = !isEmpty(search.searchAlerts) && search.searchAlerts[0].lastSentDate ?
					moment(search.searchAlerts[0].lastSentDate).format('L') : '';

				return <TableRow key={search.id} className="row-standard">
					<TableRowColumn key="column1" className="column1">
						{search.type === SavedSearchType.dynamic &&
							<div style={{ width: 55, display: 'inline-block' }}>
								<img src={require('../../../assets/images/dynamic-saved-search-icon.png')} />
							</div>
						}
						{this._getFormattedSavedSearchName(search)}
					</TableRowColumn>
					<TableRowColumn key="column2" className="column2">
						{lastAlertSentDate}
					</TableRowColumn>
					<TableRowColumn key="column3" className="column3">
						{/* eslint-disable no-script-url */}
						<a href="javascript:;" onClick={this.editSearchClick.bind(this, search)}>Edit</a>
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

		return <Block className="lead-details-cell lead-search-list-block">
				<BlockHeader className="header" title="Saved Search & Listing Alerts" />
				<Button label="Create New"
						primary={true}
						style={{ position: 'absolute', top: 8, right: 10 }}
						icon={<AddCircleOutlineIcon />}
						onClick={this.newSearchClick}/>
				<BlockContent style={{ padding: 0 }}>
					<Table key="content1" className="lead-search-list" selectable={false}>
						<TableHeader className="lead-search-list-header"
									 adjustForCheckbox={false}
									 displayRowCheckbox={false}
									 displaySelectAll={false}>
							<TableRow>
								<TableHeaderColumn key="column1" className="column1">
									Saved Searches
								</TableHeaderColumn>
								<TableHeaderColumn key="column2" className="column2">
									Last Alert Sent Date
								</TableHeaderColumn>
								<TableHeaderColumn key="column3" className="column3" />
							</TableRow>
						</TableHeader>
						<TableBody className="lead-search-list-body" displayRowCheckbox={false}>
							{ this.renderRowsFeatured() }
							{ this.renderRows() }
							{ isEmpty(this.state.savedSearchlist) &&
								<TableRow>
									<TableRowColumn key="column1">
										{ this.state.serverStatus === ServerStatuses.LOADING ||
										this.state.serverStatus === ServerStatuses.PROCESSING ?
											'Loading...' : 'No Saved Searches' }
									</TableRowColumn>
								</TableRow>
							}
						</TableBody>
					</Table>
					{ this.renderDialog() }
				</BlockContent>
			</Block>;
	}
}
