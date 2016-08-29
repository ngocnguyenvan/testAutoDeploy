/*

Abstract Filters Wrapper

Abstract component that provides boilerplate for filters
Filters produce following state format:
 {
 		sort: [
			{ creationDate: "asc" } // or "desc"
		],
		filter: {
			type: ["realEstateLead"],
			status: ["hot", "warm"]
		},
		search: "string to search"
 }

renderFilters() and renderFilteredComponent() methods should be implemented in derived component.

Filters state should be passed in renderFilteredComponent() method. Example:
	renderFilteredComponent() {
		return <FilteredComponent filter={this.state.filter}
 			sort={this.state.sort}
			search={this.state.search}
			{...this.props} />;
	}

*/
'use strict';

import React from 'react';
import { assign, without } from 'lodash';
import { SortDirection } from '../../../Constants';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class AbstractFiltersWrapper extends React.Component {

	constructor( props ) {
		super( props );

		/* if (new.target === AbstractFiltersWrapper) { // doesn't work with Babel for now
			throw new TypeError("Cannot construct AbstractFiltersWrapper instances directly, must be inherited");
		}*/

		if (this.renderFilters === undefined) {
			throw new TypeError('Must override method renderFilters');
		}

		if (this.renderFilteredComponent === undefined) {
			throw new TypeError('Must override method renderFilteredComponent');
		}

		this.sortChanged = this.sortChanged.bind( this );
		this.filterChanged = this.filterChanged.bind( this );
		this.searchChanged = this.searchChanged.bind( this );
		this.onFieldKeyUpHandler = this.onFieldKeyUpHandler.bind( this );

		this.state = {
			sort: [],
			filter: {},
			search: ''
		};
	}

	sortChanged(event, selectedIndex, value) {
		this.setState({
			sort: [
				{
					[value]: SortDirection.DESC
				}
			]
		});
	}

	filterChanged(filterName, event, toggled) {
		var filterValue = event.target.value;
		var updatedFilter = assign({}, this.state.filter);
		if (updatedFilter[filterName]) {
			if (toggled) {
				updatedFilter[filterName].push(filterValue);
			}
			else {
				updatedFilter[filterName] = without(updatedFilter[filterName], filterValue);
				if (updatedFilter[filterName].length === 0) {
					delete updatedFilter[filterName];
				}
			}
		}
		else if (toggled) {
			updatedFilter[filterName] = [filterValue];
		}

		this.setState({
			filter: updatedFilter
		});
	}

	searchChanged(event) {
		var searchValue = event.target.value;
		if (this.state.search !== searchValue) {
			this.setState({
				search: searchValue
			});
		}
	}

	onFieldKeyUpHandler(callback, e) {
		if ( e.keyCode === 13 ) { // Enter key
			callback(e);
		}
	}

	render() {
		return <div>
			{ this.renderFilters() }
			<div className="content-container">
				{ this.renderFilteredComponent() }
			</div>
		</div>;
	}
}
