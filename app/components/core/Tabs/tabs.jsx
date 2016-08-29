'use strict';

import React from 'react';
import classnames from 'classnames';
import { merge } from 'lodash';
import TabsOrignal from 'material-ui/Tabs/Tabs';
import { border } from '../../../styles/material-ui-theme';

if (process.env.BROWSER) {
	require('./Tabs/styles.less');
}

export default class Tabs extends React.Component {

	static propTypes = {
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		]),
		className: React.PropTypes.string
	};

	render() {
		var { children, className, ...props } = this.props;
		props = merge({}, {
			inkBarStyle: { display: 'none' },
			tabItemContainerStyle: {
				backgroundColor: '#f0f0f0',
				borderBottom: border,
				paddingTop: 15,
				paddingLeft: 15,
				paddingRight: 15
			}
		}, props);

		var classNames = classnames('tabs', className);

		return <TabsOrignal children={children} className={classNames} {...props} />;
	}
}
