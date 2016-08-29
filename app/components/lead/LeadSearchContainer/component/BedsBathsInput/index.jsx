'use strict';

import { default as React, PropTypes, Component } from 'react';
import objectPath from 'object-path';
import classNames from 'classnames';
import { SearchDefaults } from '../../../../../Constants';
import SearchSelect from '../SearchSelect';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class BedsBathsInput extends Component {

	static propTypes = {
		setValue: PropTypes.func.isRequired,
		defaultValue: PropTypes.object,
		classes: PropTypes.string,
	};

	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className={classNames(this.props.classes, 'beds-baths-input-component')} >
				<div className="beds-baths-search-block section" >
					<h3>Beds & Baths</h3>
					<SearchSelect
						className="beds-select"
						key="beds"
						attribute="s_beds"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.minBeds')}
						options={SearchDefaults.beds}
					/>
					<SearchSelect
						className="baths-select"
						key="baths"
						attribute="s_baths"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.minBaths')}
						options={SearchDefaults.baths}
					/>
				</div>
			</div>
		);
	}
}
