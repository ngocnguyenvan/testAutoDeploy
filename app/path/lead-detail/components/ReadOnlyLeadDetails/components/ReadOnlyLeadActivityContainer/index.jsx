'use strict';

import React, { PropTypes } from 'react';
import { PersonActivityType } from '@ylopo/models-constants';
import { map, merge } from 'lodash';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import objectPath from 'object-path';

import Promise from 'bluebird';
import LeadActivity from '../../../../../../components/lead/LeadActivity';
import { ServerStatuses } from '../../../../../../Constants';
import { get } from '../../../../../../utils/api';

export default class ReadOnlyLeadActivityContainer extends React.Component {

	static propTypes = {
		leadUuid: PropTypes.string.isRequired,
		leadPartyWebsite: React.PropTypes.object
	};

	constructor( props ) {
		super( props );

		this.loadData = this.loadData.bind( this );
		this.filterChanged = this.filterChanged.bind( this );

		this.state = {
			options: {
				page: 0,
				limit: 30,
				filter: {}
			},
			leadActivity: [],
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined
		};
	}

	componentWillMount() {
		this.loadData( this.props.leadUuid );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.leadUuid !== nextProps.leadUuid ) {
			this.loadData( nextProps.leadUuid );
		}
	}

	filterChanged( filterName, event, selectedIndex, menuItem ) {
		var filterUpdate;

		if ( menuItem.payload !== null ) {
			filterUpdate = {
				[ filterName ]: [ menuItem.payload ]
			};
		}

		var options = merge( this.state.options, { filter: filterUpdate } );
		this.setState(
			{ options },
			() => { this.loadData( this.props.leadUuid ); }
		);
	}

	/**
	 * loadData
	 *
	 * Loads activity data based upon user's id.  Augments listing activites by requesting the full listing data.  If
	 * listing data no longer exists then still render anyway.
	 *
	 * @param {string} leadUuid
	 * @returns {void}
	 */
	loadData( leadUuid ) {
		if ( !leadUuid ) {
			return;
		}

		get( `/open/${ leadUuid }/activity`, this.state.options )
			.then( ( leadActivity ) => {
				return Promise.map( leadActivity, activityItem => {
					var listingId = objectPath.get( activityItem, 'detail.listingId' );
					if ( listingId ) {
						return get( `/open/listing/${ listingId }` )
							.then(listing => {
								return merge( activityItem, { listingData: listing } );
							})
							.catch(( error ) => {
								return activityItem;
							});
					}
					else {
						return activityItem;
					}
				})
				.then(( list ) => {
					this.setState({
						leadActivity: list
					});
				});
			})
			.catch( ( error ) => {
				this.setState({
					serverMessage: error.message || error,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	render() {
		var activityTypeFilterItems = map(
			PersonActivityType,
			( activityType ) => { return { payload: activityType.key, text: activityType.label }; }
		);
		activityTypeFilterItems.unshift({ payload: null, text: 'All' });

		var typeFilterValue = this.state.options.filter.type ? this.state.options.filter.type[0] : null;

		return <div className="lead-activity-container">
			<div className="buttons-top-right">
				<DropDownMenu value={typeFilterValue}
					onChange={this.filterChanged.bind(this, 'type')}>
					{activityTypeFilterItems.map((menuItem, index) =>
						<MenuItem key={index} value={menuItem.payload} primaryText={menuItem.text} />
					)}
				</DropDownMenu>
			</div>
			<LeadActivity leadActivity={this.state.leadActivity} leadPartyWebsite={this.props.leadPartyWebsite} />
		</div>;
	}
}
