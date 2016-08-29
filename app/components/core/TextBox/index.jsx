'use strict';

import { merge } from 'lodash';
import React from 'react';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class TextBox extends React.Component {

	static propTypes = {
		icon: React.PropTypes.node,
		errorText: React.PropTypes.string,
		displayErrors: React.PropTypes.bool
	};

	render() {
		var { icon, errorText, displayErrors, ...props } = this.props;

		if (icon) {
			props = merge({}, props, {
				style: {
					paddingLeft: 57
				}
			});
		}

		if (displayErrors && errorText) {
			props = merge({}, props, {
				style: {
					borderColor: 'Red'
				}
			});
		}

		return <div className="textbox-wrapper">
					<div className="input-wrapper">
						<div className="icon-wrapper">
							{icon}
						</div>
						<input type="text" {...props} />
					</div>
					{displayErrors && errorText &&
					<div style={{ color: "#f44336", fontSize: 12 }}>
						{
							errorText.split('\n').map((error, index) => {
								return <div key={`error${index}`} >{error}</div>;
							})
						}
					</div>}
		</div>;
	}
}
