'use strict';

import { default as React, PropTypes, Component } from 'react';
import objectPath from 'object-path';
import classNames from 'classnames';
import { SearchDefaults } from '../../../../../Constants';
import SearchSelect from '../SearchSelect';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class PriceInput extends Component {

	static propTypes = {
		setValue: PropTypes.func.isRequired,
		defaultValue: PropTypes.object,
		classes: PropTypes.string,
		displayErrors: React.PropTypes.bool,
		errorText: React.PropTypes.string
	};

	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className={classNames(this.props.classes, 'price-input-component')} >
				<div className="price-search-block section" >
					<h3>Price Range</h3>
					<SearchSelect
						className="price-select"
						key="minPrice"
						attribute="s_price_min"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.minPrice')}
						options={SearchDefaults.minPrice}
					/>
					<SearchSelect
						className="price-select"
						key="maxPrice"
						attribute="s_price_max"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.maxPrice')}
						options={SearchDefaults.maxPrice}
						errorText={this.props.errorText}
						displayErrors ={this.props.displayErrors}
					/>
				</div>
			</div>
		);
	}
}
