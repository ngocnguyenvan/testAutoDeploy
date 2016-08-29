'use strict';

import React from 'react';
import classNames from 'classnames';
import { filter } from 'lodash';
import Checkbox from '../../../../core/Checkbox';

if (process.env.BROWSER) {
	require('./styles.less');
}

class PropertyTypesComponent extends React.Component {

	static propTypes = {
		setValue: React.PropTypes.func.isRequired,
		defaultValue: React.PropTypes.array
	};

	static defaultProps = {
		defaultValue: ['house', 'condo']
	};

	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		const value = e.target.value;
		if (e.target.checked) {
			this.props.setValue({
				s_type: [].concat(this.props.defaultValue, value),
			});
		} else {
			this.props.setValue({
				s_type: filter(this.props.defaultValue, (types) => {
					return types !== e.target.value;
				}),
			});
		}
	}

	render() {
		const propertyTypes = this.props.defaultValue;
		return (
			<div className={classNames('propertyTypesComponent', 'clearfix', this.props.className)} >
				<h3>Property Types</h3>
				<div className="options-wrapper" >
					{
						[
							{ value: 'house', label: 'House' },
							{ value: 'condo', label: 'Condo & Townhouse' },
							{ value: 'apt', label: 'Apt' },
							{ value: 'land', label: 'Land' },
						].map((opt, index) => {
							const typeIteration = filter(propertyTypes, (type) => {
								return type === opt.value;
							});
							let checked = typeIteration.length > 0;
							return (
								<Checkbox label={opt.label}
										  className="feature-checkbox"

										  value={opt.value}
										  key={opt.value + index}
										  checked={checked}
										  onCheck={this.handleChange}
								/>
							);
						})
					}
				</div>
			</div>
		);
	}
}

export default PropertyTypesComponent;
