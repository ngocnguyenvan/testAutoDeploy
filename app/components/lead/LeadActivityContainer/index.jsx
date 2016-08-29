'use strict';

import React, { PropTypes } from 'react';
import { PersonActivityType } from '@ylopo/models-constants';
import { map, merge } from 'lodash';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import LeadActivity from '../LeadActivity';
import { ServerStatuses } from '../../../Constants';
import { get } from '../../../utils/api';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LeadActivityContainer extends React.Component {

	static propTypes = {
		leadId: PropTypes.number.isRequired,
		leadPartyWebsite: React.PropTypes.object
	};

	constructor( props ) {
		super( props );

		this.loadData = this.loadData.bind( this );
		this.filterChanged = this.filterChanged.bind( this );

		this.state = {
			options: {
				includeListingsData: true,
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
		this.loadData(this.props.leadId);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.leadId !== nextProps.leadId) {
			this.loadData(nextProps.leadId);
		}
	}

	filterChanged(filterName, event, selectedIndex, value) {
		var filterUpdate;

		if ( value !== null ) {
			filterUpdate = {
				[ filterName ]: [ value ]
			};
		}

		var options = merge( this.state.options, { filter: filterUpdate } );
		this.setState(
			{ options },
			() => { this.loadData( this.props.leadId ); }
		);
	}


	/**
	 * loadData
	 *
	 * Loads activity data based upon user's id.  Augments listing activites by requesting the full listing data.  If
	 * listing data no longer exists then still render anyway.
	 *
	 * @param {int} leadId
	 * @returns {void}
	 */
	loadData( leadId ) {
		if ( !leadId ) {
			return;
		}

		get( `/lead/${leadId}/activity`, this.state.options )
			.then( ( leadActivity ) => {
				this.setState({
					leadActivity: leadActivity
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
		var activityTypeFilterItems = map(PersonActivityType, (activityType) => { return { payload: activityType.key, text: activityType.label };});
		activityTypeFilterItems.unshift({ payload: null, text: 'All' });

		var typeFilterValue = this.state.options.filter.type ? this.state.options.filter.type[0] : null;

		return <div className="lead-activity-container">
			<div className="buttons-top-right">
				<DropDownMenu value={typeFilterValue} onChange={this.filterChanged.bind(this, 'type')}>
					{activityTypeFilterItems.map((menuItem, index) =>
						<MenuItem key={index} value={menuItem.payload} primaryText={menuItem.text} />
					)}
				</DropDownMenu>
			</div>
			<LeadActivity leadActivity={this.state.leadActivity} leadPartyWebsite={this.props.leadPartyWebsite} />
		</div>;
	}
}
