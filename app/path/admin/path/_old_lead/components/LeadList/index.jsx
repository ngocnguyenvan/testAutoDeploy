'use strict';

import React from 'react';
import objectPath from 'object-path';
import { isEqual } from 'lodash';
import { ServerStatuses } from '../../../../../../Constants';
import { get } from '../../../../../../utils/api';
import history from '../../../../../../history';

import List from '../../../../../../components/crud/List';
import Loader from '../../../../../../components/core/Loader';
import LoadItemsPaginator from '../../../../../../components/core/LoadItemsPaginator';
import MessageBin from '../../../../../../components/core/MessageBin';

import { Block, BlockHeader, BlockContent } from '../../../../../../components/core/Block';
import Button from '../../../../../../components/core/Button';
import moment from 'moment';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LeadList extends React.Component {

	static propTypes = {
		filter: React.PropTypes.object,
		sort: React.PropTypes.object,
		params: React.PropTypes.object,
		itemZDepth: React.PropTypes.number
	};

	constructor( props ) {
		super( props );
		this.loadData = this.loadData.bind( this );
		this.detailsClick = this.detailsClick.bind(this);
		this.state = {
			listData: [],
			options: {
				page: 0
			},
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined,
			moreItems: false
		};
	}

	componentWillMount() {
		this.loadData(this.state.options, this.props.sort, this.props.filter);
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(this.props.sort, nextProps.sort) ||
			!isEqual(this.props.filter, nextProps.filter)) {
			this.loadData(this.state.options, nextProps.sort, nextProps.filter);
		}
	}

	detailsClick(itemId) {
		history.push(`/admin/lead/${itemId}`);
	}

	/**
	 *
	 * loadData
	 *
	 * Loads all data
	 *
	 * @param {object} options
	 * @param {object} sort
	 * @param {object} filter
	 * @returns {void}
     */
	loadData( options, sort, filter ) {
		this.setState({
			serverStatus: ServerStatuses.LOADING
		});

		options.sort = sort;
		options.filter = filter;

		// [ NOTE ] - forced party id for testing.
		objectPath.set( options, 'filter.partyId.0', 10122 );

		get('/lead', options)
			.then((leads) => {
				this.setState({
					listData: leads,
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

	render() {
		return <div className="lead-list-container">
			<MessageBin
				status={this.state.serverStatus}
				message={objectPath.get( this, 'state.serverMessage' )}
			/>
			<List className="lead-list">
				{ this.state.listData.map( ( item, index ) => {
					return <Block key={item.id} className="lead-list-item">
						<BlockHeader>
							{item.firstName + ' ' + item.lastName}
						</BlockHeader>
						<BlockContent className="content">
							<div>
								<a href={'mailto:' + item.emailAddress}>{item.emailAddress}</a>
							</div>
							<div>
								<a href={'tel:' + item.phoneNumber}>&#9742; {item.phoneNumber}</a>
							</div>
							<div>
								{objectPath.get(item, 'profile.city')} {objectPath.get(item, 'profile.state')}
							</div>
							<div>
								Last time they visited: { item.lastRoutedDate ? moment(item.lastRoutedDate).format('L') : null }
							</div>
							<div>
								Number of homes viewed: ?
							</div>
							<div>
								Questionnaires answered: {objectPath.get(item, 'stats.creation.payloadWithoutResponses.questionnaire.responses.length', 0)}
							</div>
							<div className="detailsBtnWrapper">
								<Button className="detailsBtn" label="Details" onClick={this.detailsClick.bind(this, item.id)} />
							</div>
						</BlockContent>
					</Block>;
				}) }
			</List>
			<LoadItemsPaginator
				action={ ( options ) => { this.loadData( options ); } }
				actionOptions={this.state.options}
				serverStatus={ this.state.serverStatus }
				endOfItems={ !this.state.moreItems }
			/>
			<Loader fullScreen={true} status={ this.state.serverStatus } />
		</div>;
	}
}
