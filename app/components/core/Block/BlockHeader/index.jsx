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
import { borderRadius } from '../../../../styles/material-ui-theme';
import CardHeader from 'material-ui/Card/CardHeader';

export default class BlockHeader extends React.Component {

	static propTypes = {
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		]),
		primary: React.PropTypes.bool,
		fontSize: React.PropTypes.number,
	};

	render() {
		var { children, primary, ...props } = this.props;
		props = merge({
			textStyle: {
				paddingRight: 0
			},
			titleStyle: {
				marginTop: 5,
				fontSize: 14,
				fontWeight: 600,
				color: '#95a45b'
			},
			style: {
				borderTopLeftRadius: borderRadius,
				borderTopRightRadius: borderRadius,
				borderBottom: '1px solid #e6e6e6',
				textAlign: 'center',
				color: '#95a45b',
				height: 57
			}
		}, props);

		if (primary) {
			props = merge({
				titleStyle: {
					textTransform: 'uppercase',
					color: '#bed561'
				},
				style: {
					backgroundColor: '#545454',
					color: '#bed561'
				}
			}, props);
		}
		if (this.props.fontSize) {
			props = merge({}, props, {
				titleStyle: {
					fontSize: this.props.fontSize,
				}
			});
		}

		return <CardHeader children={children} {...props} />;
	}
}
