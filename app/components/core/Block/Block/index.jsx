/*
	Usage example:
	<Block>
		<BlockHeader></BlockHeader>
		<BlockContent></BlockContent>
	</Block>
 */
'use strict';
import React from 'react';
import { merge } from 'lodash';
import { borderRadius, border } from '../../../../styles/material-ui-theme';
import Card from 'material-ui/Card/Card';

export default class Block extends React.Component {

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
				border: border,
				backgroundColor: '#fff',
				borderRadius: borderRadius
			},
			zDepth: 0
		}, props);

		return <Card children={children} {...props} />;
	}
}
