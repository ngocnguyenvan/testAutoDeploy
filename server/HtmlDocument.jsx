/*

Base server file for setting up an Express/React app.

*/
'use strict';

import React from 'react';

class HtmlDocument extends React.Component {

	static propTypes = {
		title: React.PropTypes.string,
		componentHTML: React.PropTypes.string,
		content: React.PropTypes.object,
		applicationName: React.PropTypes.string,
		main: React.PropTypes.string,
		googleAnalyticsScript: React.PropTypes.string,
		googleAPIKey: React.PropTypes.string,
		facebookSdk: React.PropTypes.string,
		environment: React.PropTypes.string
	};

	renderAnalyticsScripts() {
		return [
			<script key="googleAnalyticsScript" dangerouslySetInnerHTML={{ __html: this.props.googleAnalyticsScript }} />
		];
	}

	renderSocialScripts() {
		return [
			<script key="facebookSdk" dangerouslySetInnerHTML={{ __html: this.props.facebookSdk }} />
		];
	}

	render() {
		return <html>
			<head>
				<meta charSet="utf=8" />
				<meta name="application-name" content={this.props.applicationName} />
				<title>{this.props.title}</title>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
				<link rel="icon" type="image/png" href="/favicon.png" />
				<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en"></script>
				<script src={`https://maps.googleapis.com/maps/api/js?key=${this.props.googleAPIKey}&libraries=places`}></script>
				<script dangerouslySetInnerHTML={{
					__html: `var __YLOPO_SITE_CONTENT__ = ${ JSON.stringify( this.props.content ) };`
				}} />
			</head>
			<body className="thousand-stars">
				<div id="app" dangerouslySetInnerHTML={{ __html: this.props.componentHTML }} />
				{ this.renderSocialScripts() }
				<script src={this.props.main}></script>
				{ this.props.environment === 'production' ? this.renderAnalyticsScripts() : null }
			</body>
		</html>;
	}
}

export default HtmlDocument;
