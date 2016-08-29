'use strict';

import { default as React, PropTypes, Component } from 'react';
import objectPath from 'object-path';
import classNames from 'classnames';
import { SearchDefaults } from '../../../../../Constants';
import SearchSelect from '../SearchSelect';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class DaysOnMarketInput extends Component {

	static propTypes = {
		setValue: PropTypes.func.isRequired,
		defaultValue: PropTypes.string,
		className: PropTypes.string,
		label: PropTypes.string,
	};

	static defaultProps = {
		label: '',
	}

	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className={classNames(this.props.className, 'time-on-market-input-component')} >
				<div className="time-on-market-search-block section" >
					{this.props.label && <h3>{this.props.label}</h3>}
					<SearchSelect
						className="time-on-market-select"
						key="maxDays"
						attribute="s_age_days_max"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue')}
						options={SearchDefaults.timeOnMarket}
					/>
				</div>
			</div>
		);
	}
}
