/*
	Usage example:
	<Block>
		<BlockHeader></BlockHeader>
		<BlockContent></BlockContent>
	</Block>
 */
'use strict';
import React from 'react';
import CardText from 'material-ui/Card/CardText';
import { borderRadius } from '../../../../styles/material-ui-theme';
import { merge } from 'lodash';

export default class BlockContent extends React.Component {

	static propTypes = {
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	render() {
		var { children, ...props } = this.props;
		props = merge({
			style: {
				padding: '26px 18px',
				borderBottomLeftRadius: borderRadius,
				borderBottomRightRadius: borderRadius
			}
		}, props);

		return <CardText children={children} {...props} />;
	}
}
