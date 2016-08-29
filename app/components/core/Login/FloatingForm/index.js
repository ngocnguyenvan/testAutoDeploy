'use strict';

import React from 'react';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class FloatingForm extends React.Component {

	static propTypes = {
		heading: React.PropTypes.node,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	render() {
		return <div className="floating-form">
			<div className="heading text-center">
				{this.props.heading}
			</div>
			{this.props.children}
		</div>;
	}
}
