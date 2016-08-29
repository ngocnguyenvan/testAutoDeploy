'use strict';

import React from 'react';
import classNames from 'classnames';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class SearchSelect extends React.Component {

	static propTypes = {
		displayValue: React.PropTypes.node,
		options: React.PropTypes.array,
		attribute: React.PropTypes.string.isRequired,
		setValue: React.PropTypes.func.isRequired,
		value: React.PropTypes.any,
		label: React.PropTypes.string,
		displayErrors: React.PropTypes.bool,
		errorText: React.PropTypes.string

	};

	static defaultProps = {
		options: [],
	};

	render() {
		return (
			<div
				className={classNames(
					this.props.className,
					'searchField',
					(this.props.displayValue ? 'has-selection' : '')
				)}
			>
				{this.props.label && <h3>{this.props.label}</h3>}
				<div className="wrap-select">
					<select
						className={classNames(
							'dropdown-button',
							(this.props.displayValue ? 'has-selection' : '')
						)}
						value={this.props.value}
						onChange={(e) => {
							const selectInput = e.target;
							this.props.setValue({
								[this.props.attribute]: selectInput.options[selectInput.selectedIndex].value
							});
						}}
					>
						{this.props.options.map((option, index) => {
							return <option key={`${option.value}-${index}`} value={option.value}>{option.label}</option>;
						})}
					</select>
					<span className="icon-caret"></span>
				</div>

				{ this.props.displayErrors &&
					<label style={{ color: '#f44336', fontSize: 12 }}>{this.props.errorText}</label>
				}
			</div>
		);
	}
}
