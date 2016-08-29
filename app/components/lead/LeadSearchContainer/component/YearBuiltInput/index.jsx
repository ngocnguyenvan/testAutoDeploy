'use strict';

import { default as React, PropTypes, Component } from 'react';
import objectPath from 'object-path';
import classNames from 'classnames';
import { SearchDefaults } from '../../../../../Constants';
import SearchSelect from '../SearchSelect';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class YearBuiltInput extends Component {

	static propTypes = {
		setValue: PropTypes.func.isRequired,
		defaultValue: PropTypes.object,
		classes: PropTypes.string,
		errorText: PropTypes.string,
		displayErrors: PropTypes.bool
	};

	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className={classNames(this.props.classes, 'year-built-input-component')} >
				<div className="year-built-search-block section" >
					<h3>Year Built</h3>
					<SearchSelect
						className="year-min"
						key="yearMin"
						attribute="s_year_min"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.yearMin')}
						options={SearchDefaults.yearBuilt}
					/>
					<SearchSelect
						className="year-max"
						key="yearMax"
						attribute="s_year_max"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.yearMax')}
						options={SearchDefaults.yearBuilt}
						errorText={this.props.errorText}
						displayErrors ={this.props.displayErrors}
					/>
				</div>
			</div>
		);
	}
}
