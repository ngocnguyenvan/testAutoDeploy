'use strict';

import React from 'react';
import Toolbar from './components/toolbar';

export default class Default extends React.Component {
	render() {
		return <div>
			<Toolbar />
			<div style={{ padding: 20 }}>
			Welcome to Stars.  To view a lead's details, use the deep link provided to you via email or CRM integration.
			<br/><br/>
			testtes <a href="mailto:support@ylopo.com">support@ylopo.com</a>
			</div>
		</div>;
	}
}
