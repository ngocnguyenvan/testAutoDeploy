'use strict';

import { merge } from 'lodash';
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { borderRadius, border } from '../../../styles/material-ui-theme';
import classnames from 'classnames';

if (process.env.BROWSER) {
	require('./styles.less');
}

class Button extends React.Component {

	static propTypes = {
		/**
		 * Invert background and font color
		 */
		invert: React.PropTypes.bool,
		/**
		 * Large size button. Used in popups
		 */
		large: React.PropTypes.bool,
		/**
		 * Indicate with colors that button is primary
		 */
		primary: React.PropTypes.bool,
		/**
		 * Is button disabled
		 */
		disabled: React.PropTypes.bool,
		/**
		 * Indicate with colors that button is "selected"
		 */
		selected: React.PropTypes.bool,

		search: React.PropTypes.bool,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		]),
		icon: React.PropTypes.node,
		className: React.PropTypes.string
	};

	static contextTypes = {
		muiTheme: React.PropTypes.object.isRequired
	};

	render() {
		var { children, icon, primary, large, selected, invert, className, search, ...props } = this.props;
		props = merge({}, props, {
			hoverColor: this.context.muiTheme.flatButton.hoverColor,
			style: {
				borderRadius: borderRadius
			}
		});

		if (primary) {
			props = merge({}, props, {
				backgroundColor: '#f6f6f6',
				style: {
					color: !this.props.disabled ? '#95a45b' : 'rgba(149, 164, 91, 0.4)',
					border: border,
					marginTop: -1,
					marginBottom: -1
				}
			});
		}

		if (large) {
			props = merge(props, {
				labelStyle: {
					fontSize: 18.5,
					fontWeight: 600
				},
				style: {
					padding: 10
				}
			});
		}

		if (selected) {
			props = merge({}, props, {
				backgroundColor: '#63b2db',
				labelStyle: {
					color: this.context.muiTheme.flatButton.textColor
				}
			});
		}

		if (invert) {
			props = merge(props, {
				backgroundColor: props.style && props.style.color || this.context.muiTheme.flatButton.textColor,
				labelStyle: {
					color: !this.props.disabled ? '#859a31' : this.context.muiTheme.flatButton.disabledTextColor
				}
			});
		}
		if (search) {
			props = merge(props, {
				style: {
					fontSize: 16,
					fontWeight: 500,
					padding: 10,
					paddingTop: 6,
					paddingBottom: 6
				}
			});
		}

		var classNames = classnames(className, 'ylopo-button');

		return <FlatButton children={children} icon={icon} className={classNames} {...props} />;
	}
}

export default Button;
