'use strict';

import React from 'react';
import objectPath from 'object-path';
import { isEqual, merge } from 'lodash';
import { ServerStatuses } from '../../../Constants';
import { get } from '../../../utils/api';
import classNames from 'classnames';

import List from '../List';
import Loader from '../../core/Loader';
import LoadItemsPaginator from '../../core/LoadItemsPaginator';
import MessageBin from '../../core/MessageBin';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LoadList extends React.Component {

	apiRoute = '';
	className = '';

	static propTypes = {
		search: React.PropTypes.string,
		sort: React.PropTypes.array,
		filter: React.PropTypes.object,
		params: React.PropTypes.object,
		className: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.loadData = this.loadData.bind( this );
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
		this.loadData( this.state.options, this.props.sort, this.props.filter, this.props.search );
	}

	componentWillReceiveProps( nextProps ) {
		if ( !isEqual( this.props.sort, nextProps.sort ) ||
			!isEqual( this.props.filter, nextProps.filter ) ||
			!isEqual( this.props.search, nextProps.search )
		) {
			this.loadData( this.state.options, nextProps.sort, nextProps.filter, nextProps.search );
		}
	}

	/**
	 * loadData
	 *
	 * Loads all data
	 *
	 * @param {object} options
	 * @param {Array} sort
	 * @param {object} filter
     * @param {string} search
	 * @returns {void}
     */
	loadData( options, sort, filter, search ) {
		this.setState({
			serverStatus: ServerStatuses.LOADING
		});

		get(
			this.apiRoute,
			merge(
				options,
				{
					search,
					sort,
					filter
				}
			)
		)
			.then( ( result ) => {
				this.setState({
					listData: result,
					serverStatus: ServerStatuses.SUCCESS
				});
			})
			.catch( ( error ) => {
				this.setState({
					listData: [],
					serverMessage: error.errorMessage,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	renderListItem( item, index ) {
		return <div>Render list item undefined.</div>;
	}

	render() {
		return <div className={classNames('list-container', this.props.className, this.className)}>
			<MessageBin
				status={this.state.serverStatus}
				message={objectPath.get( this, 'state.serverMessage' )}
			/>
			<List className="client-list">
				{ this.state.listData && this.state.listData.map( ( item, index ) => {
					return this.renderListItem( item, index );
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
