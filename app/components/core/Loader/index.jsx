/*

Loader

A version of a loading spinner which uses 'react-loader' for rendering a very flexible loading image.
Extends: http://fgnass.github.io/spin.js/

Props
-  fullScreen: Applies extra css to make the loader a layer which covers thie entire screen.

Works with the "ServerStatus" to determine if we should display or not.

*/
'use strict';

import React from 'react';
import classNames from 'classnames';
import shouldPureComponentUpdate from 'react-pure-render/function';
import { ServerStatuses } from '../../../Constants';
import Loader from 'react-loader';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class CustomLoader extends React.Component {
	constructor(props) {
		super(props);
	}

	static propTypes = {
		status: React.PropTypes.string.isRequired,
		fullScreen: React.PropTypes.bool,
		className: React.PropTypes.string
	};

	shouldComponentUpdate = shouldPureComponentUpdate;

	static defaultProps = {
		status: React.PropTypes.object.isRequired,
		options: {
			lines: 11,
			length: 12,
			width: 6,
			radius: 20,
			corners: 1,
			rotate: 0,
			direction: 1,
			color: '#000',
			speed: 1,
			trail: 60,
			shadow: false,
			hwaccel: false,
			zIndex: 2e9,
			top: '50%',
			left: '50%',
			scale: 1.00
		}
	};

	// var { className, ...otherProps } = this.props;

	render() {
		return this.props.status === ServerStatuses.LOADING &&
			<div className={ classNames({ 'custom-loader': true, 'full-screen': this.props.fullScreen }, this.props.className) }>
				<Loader { ...this.props } />
			</div>;
	}
}
