'use strict';

import React from 'react';
import classnames from 'classnames';

import Loader from './components/core/Loader';
import ApplicationStore from './stores/ApplicationStore';
import { ServerStatuses } from './Constants';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import materialUiTheme from './styles/material-ui-theme';

if ( process.env.BROWSER ) {
	require( './assets/styles/styles.less' );
}

const muiTheme = getMuiTheme(materialUiTheme);

class Application extends React.Component {

	static propTypes = {
		location: React.PropTypes.object,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	};

	static childContextTypes = {
		location: React.PropTypes.object
	};

	getChildContext() {
		return {
			location: this.props.location
		};
	}

	constructor(props) {
		super(props);
		this.handleApplicationStoreChange = this.handleApplicationStoreChange.bind(this);

		this.state = {
			application: ApplicationStore.getState()
		};
	}

	componentDidMount() {
		ApplicationStore.addChangeListener( this.handleApplicationStoreChange );
	}

	componentWillUnmount() {
		ApplicationStore.removeChangeListener( this.handleApplicationStoreChange );
	}

	handleApplicationStoreChange() {
		this.setState({
			application: ApplicationStore.getState()
		});
	}

	render() {
		var serverRendering = !process.env.BROWSER; // TODO use React component context to store serverRendering param

		var loaderStatus = this.state.application.applicationLoaded ?
			ServerStatuses.SUCCESS : ServerStatuses.LOADING;

		var classes = classnames({
			'application-layout': true,
			clearfix: true
		});

		var style = !this.state.application.applicationLoaded || serverRendering ? {
			opacity: 0
		} : {};

		return <div className="application-layout-wrapper">
			<Loader fullScreen={true} status={loaderStatus} className="application-loader" />
			<div className={classes} style={style}>
				<MuiThemeProvider muiTheme={muiTheme}>
					{this.props.children}
				</MuiThemeProvider>
			</div>
		</div>;
	}
}

export default Application;
