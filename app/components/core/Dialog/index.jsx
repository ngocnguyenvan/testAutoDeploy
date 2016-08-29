'use strict';

import { merge } from 'lodash';
import React from 'react';
import DialogOriginal from '../_DialogMaterialUiUpdated';
import { borderRadius } from '../../../styles/material-ui-theme';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class Dialog extends React.Component {

	static propTypes = {
		closeButtonVisible: React.PropTypes.bool,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	static defaultProps = {
		closeButtonVisible: true
	};

	render() {
		var { children, ...props } = this.props;
		children =  React.Children.toArray(children);

		props = merge({}, props, {
			className: 'dialog',
			contentClassName: 'dialog-content',
			style: {
				borderRadius: borderRadius
			},
			titleStyle: {
				color: '#232323',
				fontWeight: 700,
				textAlign: 'center',
				paddingTop: 14
			},
			bodyStyle: {
				paddingTop: 20,
				paddingRight: 20,
				paddingBottom: 0,
				paddingLeft: 20,
				color: '#2e2e2e'
			},
			actionsContainerStyle: {
				paddingRight: 20,
				paddingTop: 0,
				paddingBottom: 26
			},
			autoScrollBodyContent: true,
			modal: true
		});

		if (props.closeButtonVisible) {
			children.push(<IconButton key="closeButton" className="close-dialog-btn" onClick={() => {
				if (typeof props.onRequestClose === 'function') {
					props.onRequestClose();
				}}
			}>
				<NavigationClose />
			</IconButton>);
		}

		return <DialogOriginal ref="dialog" children={children} {...props} />;
	}
}
