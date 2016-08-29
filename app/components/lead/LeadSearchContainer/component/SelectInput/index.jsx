'use strict';

import { default as React, PropTypes, Component } from 'react';
import objectPath from 'object-path';
import classNames from 'classnames';
import { SearchDefaults } from '../../../Constants';
import SearchSelect from '../SearchSelect';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class SelectInput extends Component {

	static propTypes = {
		keys: PropTypes.array.isRequired,
		setValue: PropTypes.func.isRequired,
		defaultValue: PropTypes.object,
		classes: PropTypes.string,
		selectClasses: PropTypes.string,
		label: PropTypes.string,
	};

	render() {
		return (
			<div className={classNames(this.props.classes, 'select-input-component')} >
				<div className="search-block section" >
					<h3>{this.props.label}</h3>
					<SearchSelect
						className={classNames(this.props.selectClasses[0], 'select-input')}
						key={this.props.keys[0]}
						attribute={this.props.keys[0]}
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.minPrice')}
						options={SearchDefaults.minPrice}
					/>
					<SearchSelect
						className={classNames(this.props.selectClasses.length > 1
							? this.props.selectClasses[1]
							: this.props.selectClasses[0], 'select-input')
						}
						key={this.props.keys[1]}
						attribute={this.props.keys[1]}
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.maxPrice')}
						options={SearchDefaults.maxPrice}
					/>
				</div>
			</div>
		);
	}
}
