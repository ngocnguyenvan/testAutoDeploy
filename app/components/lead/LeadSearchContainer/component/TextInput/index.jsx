'use strict';


import React from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

if (process.env.BROWSER) {
	require('./styles.less');
}

class Dropdown extends React.Component {

	static propTypes = {
		height: React.PropTypes.string,
		width: React.PropTypes.string,
		textLabel: React.PropTypes.string,
		hasValue: React.PropTypes.bool,
		displayValue: React.PropTypes.node,
		options: React.PropTypes.array,
		attribute: React.PropTypes.string.isRequired,
		stayOpen: React.PropTypes.bool,
		placeholder: React.PropTypes.string,
		value: React.PropTypes.any,
		setValue: React.PropTypes.func,
	};

	static defaultProps = {
		stayOpen: false,
		height: '25px',
		width: '25px',
		options: [],
	};

	constructor(props) {
		super(props);
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.state = {
			open: false,
		};
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	timeout = undefined;

	toggleDropdown() {
		const button = findDOMNode(this);

		// close
		if (button !== document.activeElement) {

			// [NOTE] it takes a moment for the browser to decide which element is actually active...  so lets give it a moment
			this.timeout = setTimeout(() => {
				if (!this.props.stayOpen || !button.contains(document.activeElement)) {
					this.setState({ open: false });
				}
			}, 20);

		// open
		} else {
			this.setState({
				open: true,
			});
		}
	}

	generateLabel() {
		return (this.props.displayValue ? `${this.props.displayValue} ` : '') + this.props.textLabel;
	}

	generateImage() {
		const imageSrc = this.props.hasValue ?
			'/assets/images/caret.png'
		:
			'/assets/images/drop_arrow.svg'
		;
		return <img src={imageSrc} alt="menu-drop-icon" />;
	}

	renderLabel() {
		return (
			<span className="label">
				{this.generateLabel()}
			</span>
		);
	}

	render() {
		return (
			<div className="searchField clearfix">
				<div className="searchFieldLabel">
					{this.renderLabel()}
				</div>
				<input
					className={classNames(this.props.className)}
					placeholder={this.props.placeholder || this.props.value}
					onChange={(e) => {
						const value = e.target.value || this.props.value;
						const attribute = this.props.attribute;
						this.props.setValue({ [attribute]: value });
					}}
				/>
			</div>
		);
	}
}

export default Dropdown;
