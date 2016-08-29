'use strict';

import React from 'react';

// import Nav from './components/nav';
import Toolbar from '../components/toolbar';
import MainContent from './components/mainContent';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class AdminLayout extends React.Component {

	static propTypes = {
		pathname: React.PropTypes.string,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	static contextTypes = {
		location: React.PropTypes.object
	};

	render() {
		return <div className="admin-page clearfix">
			{/* <Nav pathname={ this.context.location.pathname } /> */}
			<Toolbar />
			<MainContent { ...this.props }>
				{ this.props.children }
			</MainContent>
		</div>;
	}
}
