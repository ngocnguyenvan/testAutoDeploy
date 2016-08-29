'use strict';

import { default as React, PropTypes, Component } from 'react';
import objectPath from 'object-path';
import classNames from 'classnames';
import SearchTextInput from '../SearchTextInput';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class SquareFeetInput extends Component {

	static propTypes = {
		setValue: PropTypes.func.isRequired,
		defaultValue: PropTypes.object,
		classes: PropTypes.string,
		displayErrors: PropTypes.object,
		errorText: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className={classNames(this.props.classes, 'square-feet-input-component')} >
				<div className="square-feet-search-block section" >
					<h3>Square Feet</h3>
					<SearchTextInput
						className="sqft-text-input"
						key="sqftMin"
						attribute="s_sqft_min"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.sqftMin')}
						placeholder="Min Square Feet"
						displayErrors={this.props.displayErrors.min}
						errorText={this.props.errorText.min}
					/>
					<SearchTextInput
						className="sqft-text-input"
						key="sqftMax"
						attribute="s_sqft_max"
						setValue={this.props.setValue}
						value={objectPath.get(this, 'props.defaultValue.sqftMax')}
						placeholder="Max Square Feet"
						displayErrors={this.props.displayErrors.max}
						errorText={this.props.errorText.max}
					/>
				</div>
			</div>
		);
	}
}
