'use strict';

import React from 'react';
import Toolbar from '../components/toolbar';

export default class LeadDetailLayout extends React.Component {

	static propTypes = {
		pathname: React.PropTypes.string,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	render() {
		return <div className="page-leads">
			<Toolbar />
			<div className="content-container">
				{ this.props.children }
			</div>
		</div>;
	}
}
