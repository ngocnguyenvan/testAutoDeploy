'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import { merge } from 'lodash';
import classNames from 'classnames';
import TabOrignal from 'material-ui/Tabs/Tab';
import materialUiTheme, { textColor, borderRadius, border } from '../../../styles/material-ui-theme';

import EnhancedButton from 'material-ui/internal/EnhancedButton';

export default class Tab extends TabOrignal {
	render() {
		var {
			label,
			selected,
			index, // eslint-disable-line no-unused-vars
			onActive,  // eslint-disable-line no-unused-vars
			onTouchTap,  // eslint-disable-line no-unused-vars
			style,
			width,  // eslint-disable-line no-unused-vars
			className,
			...other
		} = this.props;

		var classNameFinal = classNames('tab', className);

		style = merge({}, style, {
			fontWeight: 600,
			marginRight: 10,
			borderTopRightRadius: borderRadius,
			borderTopLeftRadius: borderRadius,
			borderTop: 'none',
			borderLeft: 'none',
			borderRight: 'none',
			borderBottom: 'none',
			backgroundColor: materialUiTheme.flatButton.color,
			color: materialUiTheme.flatButton.textColor,
			height: 40
		});

		if (selected) {
			style = merge({}, style, {
				backgroundColor: '#fff',
				color: textColor,
				borderTop: border,
				borderLeft: border,
				borderRight: border,
				borderBottom: '1px solid #fff',
				height: 42,
				marginTop: -1,
				marginBottom: -1
			});
		}

		return <EnhancedButton
			{...other}
			className={classNameFinal}
			onTouchTap={this.handleTouchTap}
			style={style} >
				<span style={{ paddingLeft: 35, paddingRight: 35 }}>
					{label}
				</span>
			</EnhancedButton>;
	}
}
