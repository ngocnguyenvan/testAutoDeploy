'use strict';

import { merge } from 'lodash';
import React from 'react';
import SelectField from 'material-ui/SelectField';
import { borderInput, borderInputError, hintColor } from '../../../styles/material-ui-theme';
import classNames from 'classnames';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class SelectFieldClassic extends React.Component {

	static propTypes = {
		icon: React.PropTypes.node,
		wrapperStyle: React.PropTypes.object,
		disabled: React.PropTypes.bool,
		displayErrors: React.PropTypes.bool,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	render() {
		var { children, icon, wrapperStyle, displayErrors, ...props } = this.props;
		props = merge({}, props, {
			style: {
				fontSize: 'inherit',
				fontWeight: 'inherit',
				border: borderInput,
				borderRadius: 2,
				backgroundColor: 'White'
			},
			underlineStyle: {
				display: 'none'
			},
			hintStyle: {
				fontSize: 'inherit',
				fontWeight: 300,
				color: hintColor,
				paddingLeft: 20
			},
			labelStyle: {
				fontSize: 'inherit',
				fontWeight: 'inherit',
				paddingLeft: 20
			},
			iconStyle: {
				display: 'none'
				// fill: materialUiTheme.flatButton.color
			},
			errorStyle: {
				marginTop: 6
			}
		});

		if (icon) {
			props = merge({}, props, {
				labelStyle: {
					paddingLeft: 57
				},
				hintStyle: {
					paddingLeft: 57
				}
			});
		}

		var classesWrapper = classNames({
			'select-field-wrapper': true,
			disabled: props.disabled
		});

		if (displayErrors && props.errorText) {
			props = merge({}, props, {
				style: {
					border: borderInputError
				}
			});
		}

		return <div className={classesWrapper} style={wrapperStyle}>
			<div className="icon-wrapper">
				{icon}
			</div>
			<div className="dropdown-arrow-wrapper">
				<img src={ process.env.BROWSER ? require('../../../assets/images/core/select-dropdown-icon.png') : '' } />
			</div>
			<SelectField children={children} {...props} />
		</div>;
	}
}
