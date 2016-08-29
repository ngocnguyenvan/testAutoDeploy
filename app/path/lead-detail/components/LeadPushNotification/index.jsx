'use strict';

import React from 'react';
import LeadSearchCriteria from '../../../../components/lead/LeadSearchCriteria';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}
export default class LeadPushNotification extends React.Component {
	static propTypes = {
		lead: React.PropTypes.object,
		sendMailSuccess: React.PropTypes.func
	};

	render() {
		return <div>
			<LeadSearchCriteria lead={this.props.lead} sendMailSuccess={this.props.sendMailSuccess} />
		</div>;
	}
}
