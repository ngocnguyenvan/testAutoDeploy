'use strict';

import React from 'react';
import objectPath from 'object-path';
import moment from 'moment-timezone';
import { Link } from 'react-router';
import { isEmpty } from 'lodash';

import { ServerStatuses } from '../../../Constants';
import { get } from '../../../utils/api';
import { getTimezone } from '../../../utils/dateUtil';
import { generateUrl, getPropertyInfoString } from '../../../utils/listingUtil';

import Table from '../../../components/core/Table/table';
import TableBody from '../../../components/core/Table/table-body';
import TableHeader from '../../../components/core/Table/table-header';
import TableHeaderColumn from '../../../components/core/Table/table-header-column';
import TableRow from '../../../components/core/Table/table-row';
import TableRowColumn from '../../../components/core/Table/table-row-column';

if (process.env.BROWSER) {
	require( './styles.less' );
}

export default class LeadListingsFavoriteList extends React.Component {

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
		this.loadListings = this.loadListings.bind( this );
		this.setSort = this.setSort.bind( this );
		this.renderAddress = this.renderAddress.bind( this );
		this.state = {
			sort: 'lastViewedDate',
			dir: 'desc',
			listingsList: [],
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined
		};
	}

	componentWillMount() {
		// TODO - paginate
		this.loadListings( this.props.id, this.props.uuid );
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
		}, this.loadListings( this.props.id, this.props.uuid ));
	}

	loadListings( id, uuid ) {
		var url = null;
		if (id) {
			url = `/lead/${ id }/listings-favorite`;
		}
		else if (uuid) {
			url = `/open/${ uuid }/listings-favorite`;
		}

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		}, () => {
			get(url, { sort: this.state.sort, dir: this.state.dir })
				.then((result) => {
					this.setState({
						serverStatus: ServerStatuses.SUCCESS,
						listingsList: result
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

	renderAddress(addressInfo) {
		if (isEmpty(addressInfo)) {
			return false;
		}
		return `${addressInfo.fullStreetAddress}, ${addressInfo.city}, ${addressInfo.stateOrProvince}, ${addressInfo.postalCode}`;
	}

	renderRows() {
		if ( this.state.listingsList && this.state.listingsList.length > 0 ) {
			return this.state.listingsList.map(( listing, index ) => {
				return <TableRow key={listing.id}>
					<TableRowColumn className="column1">
						{moment.tz(listing.lastViewedDate, getTimezone()).format('MM/DD/YYYY hh:mma z')}
					</TableRowColumn>
					<TableRowColumn>
						{this.renderAddress(listing.address)}
					</TableRowColumn>
					<TableRowColumn>
						{getPropertyInfoString(listing)}
					</TableRowColumn>
					<TableRowColumn className="column4">
						<Link
							to={{
								pathname: generateUrl( listing, objectPath.get( this.props, 'leadPartyWebsite.domain', null ) ),
								query: this.context.location.query
							}}
							target="blank"
						>
						View
						</Link>
					</TableRowColumn>
				</TableRow>;
			});
		}
		else {
			return null;
		}
	}

	render() {
		var noListingsExist = isEmpty(this.state.listingsList) && this.state.serverStatus === ServerStatuses.SUCCESS;

		if (!noListingsExist) {
			return <div className="lead-listings-favorite-list">
				<Table selectable={false}>
					<TableHeader className="lead-listings-favorite-list-header"
								 adjustForCheckbox={false}
								 displayRowCheckbox={false}
								 displaySelectAll={false}>
						<TableRow>
							<TableHeaderColumn className="column1"
								sortable={true}
								sortableIsActive={this.state.sort === 'lastViewedDate'}
								sortableSortDirection={this.state.dir}
								onSortClick={this.setSort.bind(this, 'lastViewedDate')}
								disabled={this.state.serverStatus === ServerStatuses.PROCESSING}>
								Favorited Date
							</TableHeaderColumn>
							<TableHeaderColumn>
								Address
							</TableHeaderColumn>
							<TableHeaderColumn>
								Property Info
							</TableHeaderColumn>
							<TableHeaderColumn className="column4" />
						</TableRow>
					</TableHeader>
					<TableBody className="lead-listings-favorite-list-body" displayRowCheckbox={false} stripedRows={true}>
						{ this.renderRows() }
						{ isEmpty(this.state.listingsList) &&
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
				<div className="title">No Favorite Listings Data Currently Available...</div>
				<div>We're still collecting home-search data for this lead. We'll send you an alert as soon
					as we have info to show you!
				</div>
			</div>;
		}
	}
}