'use strict';

import React from 'react';


import FloatingForm from '../../components/core/Login/FloatingForm';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class AuthLayout extends React.Component {

	static propTypes = {
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	render() {
		// [ NOTE ] - including the image here due to webpack sourcemapping inferrence.
		return <div className="auth-page clearfix" style={{ backgroundImage: 'url( /assets/images/mockup-3-50.jpg )' }}>
			<FloatingForm
				heading={<div className="logo"><img src="/assets/ylopo-logo.svg" /></div>}
			>
				{this.props.children}
			</FloatingForm>
		</div>;
	}
}
