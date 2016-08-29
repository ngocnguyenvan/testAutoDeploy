'use strict';

import React from 'react';
import { Block, BlockHeader, BlockContent } from '../../core/Block';
import classNames from 'classnames';
import history from '../../../history';
if (process.env.BROWSER) {
	require( './styles.less' );
}

export default class LeadUserAction extends React.Component {
	static propTypes = {
		leadUuid: React.PropTypes.string
	};

	constructor( props ) {
		super( props );
		this.goToNotificationPage = this.goToNotificationPage.bind(this);
	}
	goToNotificationPage() {
		history.push(`/lead-detail/${this.props.leadUuid}/push-notification`);
	}
	render() {
		// Have to create component to set width because Material-UI Button render clears icon styles

		return <Block className="lead-details-cell lead-search-list-block">
				<BlockHeader className="header" title="User Actions" />
				<BlockContent style={{ padding: 20 }}>
					<div className='notification-icon'>

						<div
							className={classNames('icon', 'active') }
							onClick={this.goToNotificationPage}
							key={0}
						>
							<i className="fa fa-bell" aria-hidden="true"></i>
						</div>
						<span className="notification-label">Create Push Notification</span>
					</div>
				</BlockContent>
			</Block>;
	}
}
