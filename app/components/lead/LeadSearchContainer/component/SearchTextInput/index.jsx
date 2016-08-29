'use strict';

import React from 'react';
import classNames from 'classnames';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class SearchTextInput extends React.Component {

	static propTypes = {
		displayValue: React.PropTypes.node,
		options: React.PropTypes.array,
		attribute: React.PropTypes.string.isRequired,
		setValue: React.PropTypes.func.isRequired,
		value: React.PropTypes.any,
		label: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		errorText: React.PropTypes.string,
		displayErrors: React.PropTypes.bool,
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
				<h3>{this.props.label}</h3>
				<input
					className={classNames(
						'input-button',
						( this.props.displayValue ? 'has-selection' : ''),
						( this.props.displayErrors ? 'input-errors' : '')
					)}
					placeholder={this.props.placeholder}
					value={this.props.value}
					onChange={(e) => {
						const textInput = e.target;
						this.props.setValue({
							[this.props.attribute]: textInput.value,
						});
					}}
				>
				</input>
				{ this.props.displayErrors &&
				<label style={{ color: '#f44336', fontSize: 12 }}>{this.props.errorText}</label>
				}
			</div>
		);
	}
}
