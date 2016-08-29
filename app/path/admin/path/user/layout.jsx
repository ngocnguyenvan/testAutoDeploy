'use strict';

import React from 'react';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class LeadLayout extends React.Component {

	static propTypes = {
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	render() {
		return <div className="page-users">
			{ this.props.children }
		</div>;
	}
}
