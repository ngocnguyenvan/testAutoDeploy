'use strict';

import React from 'react';
import { find } from 'lodash';
import { Block, BlockContent } from '../../../../components/core/Block';
import LeadInformation from '../ReadOnlyLeadDetails/components/LeadInformation';
import LeadDetails from '../ReadOnlyLeadDetails/components/LeadDetails';

import { get } from '../../../../utils/api';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LeadDetailContainer extends React.Component {

	static propTypes = {
		lead: React.PropTypes.object,
		onLeadUpdate: React.PropTypes.func,
		sendMailSuccess: React.PropTypes.func
	};

	static contextTypes = {
		location: React.PropTypes.object
	};

	constructor() {
		super();
		this.loadFubInfo = this.loadFubInfo.bind(this);

		this.state = {
			fubInfo: null,

		};
	}
	componentWillMount() {
		this.loadFubInfo(this.props.lead.uuid);
	}
	loadFubInfo(uuid) {
		get('/open/' + uuid + '/fub')
			.then((result) => {
				this.setState({
					fubInfo: {
						id: result.id,
						tags: result.tags,
						stage: result.stage,
						assignedTo: result.assignedTo,
						assignedLenderName: result.assignedLenderName,
						yFubURL: result.yFubURL,
						loaded: true
					}
				});
			})
			.catch((error) => {
				// what to do?
			});
	}
	render() {
		var lead = this.props.lead;
		return <div className="lead-details">
			<div className="row">
				<div className="left-column">
					<LeadInformation lead={ lead } onLeadUpdate={ this.props.onLeadUpdate } />
					<LeadDetails lead={ lead } fubInfo={ this.state.fubInfo } />
				</div>
				<div className="right-column">
					{React.cloneElement(this.props.children, {...this.props})}
				</div>
			</div>
		</div>;
	}
}
