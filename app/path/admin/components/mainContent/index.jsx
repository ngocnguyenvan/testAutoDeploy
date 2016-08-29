'use strict';

import React from 'react';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

class MainContent extends React.Component {

	static propTypes = {
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	render() {
		return <div className="main-content clearfix" >
			{this.props.children}
		</div>;
	}
}

export default MainContent;
