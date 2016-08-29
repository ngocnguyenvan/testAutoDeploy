/**
 * Button
 *
 * A generic button for handling non-asyncronous actions.
 *
 */


import React from 'react';
import classNames from 'classnames';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

class Button extends React.Component {

	static propTypes = {
		onClick: React.PropTypes.func.isRequired,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	static defaultProps = {
		onClick: undefined
	};

	render() {
		var classes = classNames(
			'btn',
			this.props.className.split( ' ' )
		);

		return <button
			className={classes}
			disabled={this.props.disabled ? 'disabled' : null}
			onTouchTap={( e ) => { this.props.onClick( e ); }}
		>
			{this.props.children}
		</button>;
	}

}

module.exports = Button;
