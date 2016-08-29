'use strict';

import React from 'react';
import { PersonActivityType } from '@ylopo/models-constants';
import objectPath from 'object-path';
import List from 'material-ui/List/List';
import Divider from 'material-ui/Divider';
import ListItem from 'material-ui/List/ListItem';
import moment from 'moment-timezone';
import { Link } from 'react-router';

import { isEmpty } from 'lodash';
import { getTimezone } from '../../../utils/dateUtil';
import { generateUrl, getPropertyInfoString } from '../../../utils/listingUtil';
import { getSearchDescription } from '../../../utils/searchUtil';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LeadActivity extends React.Component {

	static propTypes = {
		leadActivity: React.PropTypes.array.isRequired,
		leadPartyWebsite: React.PropTypes.object,
		dividerAfterLastItem: React.PropTypes.bool.isRequired
	};

	static defaultProps = {
		dividerAfterLastItem: true
	};

	static contextTypes = {
		location: React.PropTypes.object
	};

	constructor() {
		super();
		this.renderAddress = this.renderAddress.bind(this);
		this.renderActivityItemHeader = this.renderActivityItemHeader.bind(this);
		this.renderActivityItem = this.renderActivityItem.bind(this);
	}

	renderAddress(addressInfo) {
		if (isEmpty(addressInfo)) {
			return false;
		}
		return `${addressInfo.fullStreetAddress}, ${addressInfo.city}, ${addressInfo.stateOrProvince}, ${addressInfo.postalCode}`;
	}

	renderActivityItemHeader(item) {
		return <div>
			<span style={{ paddingRight: 10 }}>{moment.tz(item.creationDate, getTimezone()).format('MM/DD/YYYY hh:mma z')}</span>
			<b>{PersonActivityType[item.type].label}</b>
		</div>;
	}

	renderActivityItem(item) {
		switch (item.type) {
			case PersonActivityType.VIEW_LISTING_DETAIL.key:
			case PersonActivityType.FAVORITE_LISTING.key:
			case PersonActivityType.REQUEST_INFORMATION.key:
			case PersonActivityType.SHOWING_REQUEST.key:
				var urlDomain = objectPath.get(this.props, 'leadPartyWebsite.domain', null);
				var listing = objectPath.get(item, 'detail.listing');
				return <ListItem key={item.id}
							className="lead-activity-item"
							initiallyOpen={true}
							primaryText={this.renderActivityItemHeader(item)}
							secondaryText={
								listing ?
								<div>
									<div style={{ width: '50%', display: 'inline-block' }}>
										{this.renderAddress(listing.address)}
									</div>
									<div style={{ width: '50%', display: 'inline-block' }}>
										{getPropertyInfoString(listing)}
									</div>
								</div> :
								<div></div>
							}
							rightIconButton={
								<div className="view-link">
								{ listing && !listing.notExist ?
									<Link
										to={{
											pathname: generateUrl(listing, urlDomain),
											query: this.context.location.query
										}}
										target="blank"
									>
										View<br/>Listing
									</Link> :
									<div>Off<br/>Market</div>
								}
								</div> } />;

			case PersonActivityType.INITIAL_LANDING.key:
			case PersonActivityType.SEARCH.key:
			case PersonActivityType.SAVED_SEARCH.key:
				var search = objectPath.get(item, 'detail.query.s');
				if (item.type === PersonActivityType.INITIAL_LANDING.key) {
					search = objectPath.get(item, 'detail.query.s');
				}
				else {
					search = objectPath.get(item, 'detail.search');
				}

				return <ListItem key={item.id}
								 initiallyOpen={true}
								 primaryText={this.renderActivityItemHeader(item)}
								 secondaryText={
									search &&
									<div>
										{getSearchDescription(search)}
									</div>
								 }
				/>;

			default:
				return <ListItem key={item.id}
								 initiallyOpen={true}
								 primaryText={this.renderActivityItemHeader(item)}
								 />;
		}
	}

	render() {
		var listChildren = [];
		if (this.props.leadActivity) {
			this.props.leadActivity.forEach((item, index) => {
				listChildren.push(this.renderActivityItem(item));

				if (this.props.dividerAfterLastItem || index < this.props.leadActivity.length - 1) {
					listChildren.push(<Divider key={item.id + '_divider'}/>);
				}
			});
		}

		return <List>{listChildren}</List>;
	}
}
