'use strict';

import React from 'react';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class Dashboard extends React.Component {

	render() {
		return <div className="page-dashboard">
		</div>;
	}
}
