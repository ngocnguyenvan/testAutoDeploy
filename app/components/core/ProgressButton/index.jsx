/**
 * ProgressButton
 *
 * A button for handling asyncronous actions.  It wraps the react-progress-button component to ensure the following:
 *
 *  -  Can only click the button once until resolved/rejected
 *  -  Delays the "success/fail" to ensure we have a reasonable UI feeling
 *
 *
 * PropTypes
 * ---------
 *  -  onClick				Function called when the button is clicked.
 *  -  statusChangeCallback	Function called when the button resets it self to "ready".
 *  -  disabled				Disables the button
 *  -  minAnimationDuration	Minimum amount of time for the animations when going from "clicked" => success/error
 *
 *
 * [ Note ] - We are wrapping the component in a div for onTouchTap:
 *            https://github.com/zilverline/react-tap-event-plugin
 */

import React from 'react';
import ProgressButton from 'react-progress-button';

import { ServerStatuses } from '../../../Constants';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

class ProgressButtonContainer extends React.Component {

	static propTypes = {
		onClick: React.PropTypes.func.isRequired,
		statusChangeCallback: React.PropTypes.func.isRequired,
		disabled: React.PropTypes.bool,
		minAnimationDuration: React.PropTypes.number,
		status: React.PropTypes.string,
		className: React.PropTypes.string,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	static defaultProps = {
		disabled: false,
		minAnimationDuration: 1200
	};

	constructor( props ) {
		super( props );
		this.handleClick = this.handleClick.bind( this );
		this.processClick = this.processClick.bind( this );
		this.resetComponent = this.resetComponent.bind( this );
		this.timeout = undefined;
		this.state = {
			processing: false
		};
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.status !== this.props.status ) {
			var func;
			switch ( newProps.status ) {
				case ServerStatuses.READY:
					func = this.refs.button.notLoading;
					break;
				case ServerStatuses.PROCESSING:
					func = this.refs.button.loading;
					break;
				case ServerStatuses.SUCCESS:
					func = this.refs.button.success;
					break;
				case ServerStatuses.FAIL:
					func = this.refs.button.error;
					break;
			}

			var delay = this.props.minAnimationDuration - ( ( new Date() ).getTime() - ( this.state.startTime || 0 ) );
			clearTimeout( this.timeout );
			this.timeout = setTimeout( () => {
				func( this.resetComponent );
				this.setState({
					processing: false,
					startTime: undefined
				});
			}, delay > 0 ? delay : 0 );
		}
	}

	componentWillUnmount() {
		clearTimeout( this.timeout );
	}

	resetComponent() {
		this.props.statusChangeCallback( ServerStatuses.READY );
	}

	handleClick() {
		if ( !this.props.disabled && this.state.processing === false ) {
			this.setState(
				{
					processing: true,
					startTime: ( new Date() ).getTime()
				},
				this.processClick
			);
		}
	}

	processClick() {
		this.refs.button.loading();
		this.props.onClick();
	}

	render() {
		return <div onTouchTap={this.handleClick} className={ this.props.className }>
			<ProgressButton
				ref="button"
				disabled={this.props.disabled ? 'disabled' : null}
			>
				{this.props.children}
			</ProgressButton>
		</div>;
	}

}

module.exports = ProgressButtonContainer;
