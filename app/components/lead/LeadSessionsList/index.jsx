'use strict';

import React from 'react';
import moment from 'moment-timezone';
import { isEmpty } from 'lodash';

import { ServerStatuses } from '../../../Constants';
import { get } from '../../../utils/api';
import { getTimezone } from '../../../utils/dateUtil';

import Table from '../../../components/core/Table/table';
import TableBody from '../../../components/core/Table/table-body';
import TableHeader from '../../../components/core/Table/table-header';
import TableHeaderColumn from '../../../components/core/Table/table-header-column';
import TableRow from '../../../components/core/Table/table-row';
import TableRowColumn from '../../../components/core/Table/table-row-column';
import LeadActivity from '../../../components/lead/LeadActivity';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LeadSessionsList extends React.Component {

	static propTypes = {
		id: React.PropTypes.number,
		uuid: React.PropTypes.string,
		leadPartyWebsite: React.PropTypes.object
	};

	static contextTypes = {
		location: React.PropTypes.object
	};

	constructor( props ) {
		super( props );
		this.loadSessions = this.loadSessions.bind( this );
		this.loadSessionActivities = this.loadSessionActivities.bind( this );
		this.toggleActivitiesView = this.toggleActivitiesView.bind( this );
		this.state = {
			sort: 'session_start_time',
			dir: 'desc',
			sessionsList: [],
			activeSessionId: null,
			activeSessionActivitiesList: [],
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined
		};
	}

	componentWillMount() {
		// TODO - paginate
		this.loadSessions( this.props.id, this.props.uuid );
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.id === nextProps.id && this.props.uuid === nextProps.uuid &&
			this.state === nextState) {
			return false;
		}
		return true;
	}

	setSort(sort) {
		var dir = this.state.dir;
		var dirinvert = this.state.dir === 'desc' ? 'asc' : 'desc';
		if (sort === this.state.sort) {
			dir = dirinvert;
		}

		this.setState({
			sort: sort,
			dir: dir
		}, this.loadSessions( this.props.id, this.props.uuid ));
	}

	loadSessions( id, uuid ) {
		var url = null;
		if (id) {
			url = `/lead/${ id }/sessions`;
		}
		else if (uuid) {
			url = `/open/${ uuid }/sessions`;
		}

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		}, () => {
			get(url, { sort: this.state.sort, dir: this.state.dir })
				.then((result) => {
					this.setState({
						serverStatus: ServerStatuses.SUCCESS,
						sessionsList: result
					});
				})
				.catch((error) => {
					this.setState({
						serverMessage: error,
						serverStatus: ServerStatuses.FAIL
					});
				});
		});
	}

	loadSessionActivities( sessionId, id, uuid ) {
		var url = null;
		if (id) {
			url = `/lead/${ id }/session/${ sessionId }/activity`;
		}
		else if (uuid) {
			url = `/open/${ uuid }/session/${ sessionId }/activity`;
		}

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		}, () => {
			get(url, { includeListingsData: true })
				.then((result) => {
					this.setState({
						serverStatus: ServerStatuses.SUCCESS,
						activeSessionActivitiesList: result
					});
				})
				.catch((error) => {
					this.setState({
						serverMessage: error,
						serverStatus: ServerStatuses.FAIL
					});
				});
		});
	}

	toggleActivitiesView(sessionId) {
		if (this.state.activeSessionId !== sessionId) {
			this.setState({
				serverStatus: ServerStatuses.PROCESSING,
				activeSessionId: sessionId
			}, this.loadSessionActivities( sessionId, this.props.id, this.props.uuid ));
		}
		else {
			this.setState({
				activeSessionId: null
			});
		}
		return false;
	}

	renderRows() {
		if ( this.state.sessionsList && this.state.sessionsList.length > 0 ) {
			var itemsToRender = [];

			this.state.sessionsList.forEach(( session, index ) => {
				itemsToRender.push(
					<TableRow key={session.id}>
						<TableRowColumn className="column1">
							<div style={{ maxWidth: 102 }}>
								{moment.tz(session.sessionStartTime, getTimezone()).format('MM/DD/YYYY hh:mma z')}
							</div>
						</TableRowColumn>
						<TableRowColumn className="column2">
							{moment.duration(session.duration).humanize()}
						</TableRowColumn>
						<TableRowColumn>
							{session.listingsViewed}
						</TableRowColumn>
						<TableRowColumn>
							{session.searchesPerformed}
						</TableRowColumn>
						<TableRowColumn className="column5">
							{/* eslint-disable no-script-url */}
							<a href="javascript:;" onClick={this.toggleActivitiesView.bind(this, session.id)}>
								{ this.state.activeSessionId === session.id ? <NavigationClose /> : 'View' }
							</a>
							{/* eslint-enable no-script-url */}
						</TableRowColumn>
					</TableRow>
				);

				if (this.state.activeSessionId === session.id) {
					itemsToRender.push(
						<TableRow key="activeSessionActivityList" striped={false}>
							<TableRowColumn colSpan={5}>
								{ this.state.serverStatus === ServerStatuses.PROCESSING &&
									'Loading...'}
								{ this.state.serverStatus === ServerStatuses.SUCCESS &&
									<LeadActivity 	leadActivity={this.state.activeSessionActivitiesList}
													leadPartyWebsite={this.props.leadPartyWebsite}
													dividerAfterLastItem = {false}/>}
							</TableRowColumn>
						</TableRow>
					);
				}
			});

			return itemsToRender;
		}
		else {
			return null;
		}
	}

	render() {
		var noListingsExist = isEmpty(this.state.sessionsList) && this.state.serverStatus === ServerStatuses.SUCCESS;

		if (!noListingsExist) {
			return <div className="lead-sessions-list">
				<Table selectable={false}>
					<TableHeader className="lead-sessions-list-header"
								 adjustForCheckbox={false}
								 displayRowCheckbox={false}
								 displaySelectAll={false}>
						<TableRow>
							<TableHeaderColumn
								className="column1"
								sortable={true}
								sortableIsActive={this.state.sort === 'session_start_time'}
								sortableSortDirection={this.state.dir}
								onSortClick={this.setSort.bind(this, 'session_start_time')}
								disabled={this.state.serverStatus === ServerStatuses.PROCESSING}>
								Date
							</TableHeaderColumn>
							<TableHeaderColumn
								className="column2"
								sortable={true}
								sortableIsActive={this.state.sort === 'duration'}
								sortableSortDirection={this.state.dir}
								onSortClick={this.setSort.bind(this, 'duration')}
								disabled={this.state.serverStatus === ServerStatuses.PROCESSING}>
								Duration
							</TableHeaderColumn>
							<TableHeaderColumn
								sortable={true}
								sortableIsActive={this.state.sort === 'listingsViewed'}
								sortableSortDirection={this.state.dir}
								onSortClick={this.setSort.bind(this, 'listingsViewed')}
								disabled={this.state.serverStatus === ServerStatuses.PROCESSING}>
								# of Listings Viewed
							</TableHeaderColumn>
							<TableHeaderColumn
								sortable={true}
								sortableIsActive={this.state.sort === 'searchesPerformed'}
								sortableSortDirection={this.state.dir}
								onSortClick={this.setSort.bind(this, 'searchesPerformed')}
								disabled={this.state.serverStatus === ServerStatuses.PROCESSING}>
								# of Searches Performed
							</TableHeaderColumn>
							<TableHeaderColumn className="column5" />
						</TableRow>
					</TableHeader>
					<TableBody className="lead-sessions-list-body" displayRowCheckbox={false} stripedRows={true}>
						{ this.renderRows() }
						{ isEmpty(this.state.sessionsList) &&
						(this.state.serverStatus === ServerStatuses.LOADING ||
						this.state.serverStatus === ServerStatuses.PROCESSING) &&
							<TableRow>
								<TableRowColumn key="column1">
									Loading...
								</TableRowColumn>
							</TableRow>
						}
					</TableBody>
				</Table>
			</div>;
		}
		else {
			return <div className="semi-transparent-overlay">
				<div className="logo">
					<img src={ process.env.BROWSER ? require('../../../assets/images/x-sign.png') : '' }/>
				</div>
				<div className="title">No Sessions History Data Currently Available...</div>
				<div>We're still collecting home-search data for this lead. We'll send you an alert as soon
					as we have info to show you!
				</div>
			</div>;
		}
	}
}
