'use strict';
/**
 * MessageBin
 *
 */

import React from 'react';
import classNames from 'classnames';
import { isEmpty, isString } from 'lodash';

import { ServerStatuses } from '../../../Constants';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

class MessageBin extends React.Component {

	static propTypes = {
		message: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.object
		]),
		messageSuffix: React.PropTypes.node,
		style: React.PropTypes.object,
		status: React.PropTypes.string,
		ServerStatuses: React.PropTypes.string
	};

	constructor() {
		super();

		this.getMessage = this.getMessage.bind(this);
	}

	getMessage() {
		var message = '';
		if (this.props.message) {
			if (this.props.message instanceof Error) {
				message = this.props.message.message;
			}
			else if (this.props.message.errorMessage !== undefined) {
				message = this.props.message.errorMessage;
			}
			else if (isString(this.props.message)) {
				message = this.props.message;
			}
		}

		if (!isEmpty(message)) {
			if (this.props.messageSuffix) {
				return <span>
					{ String(message) }. { this.props.messageSuffix }
				</span>;
			}
			else {
				return String(message);
			}
		}
		else {
			return <span>
				Sorry, an unexpected error occurred. If you continue to encounter problems with this page, please contact us at <a href="mailto:support@ylopo.com">support@ylopo.com</a>
			</span>;
		}
	}

	render() {
		var className = classNames(
			'message-bin',
			this.props.status ? 'status-' + this.props.status : undefined
		);
		return this.props.message || this.props.ServerStatuses === ServerStatuses.FAIL ?
			<div className={className} style={this.props.style}>
				{ this.getMessage() }
			</div> :
			null
		;
	}
}

module.exports = MessageBin;
