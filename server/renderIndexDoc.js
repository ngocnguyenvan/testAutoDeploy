'use strict';

import React from 'react';	// eslint-disable-line no-unused-vars
import ReactDOMServer from 'react-dom/server';
import objectPath from 'object-path';
import config from 'config';
import HtmlDocument from './HtmlDocument';

function generateHtmlDocument(req, content) {
	let applicationName = 'Thousand Stars -' + req.locals.package.version;
	return '<!doctype html>' +
		ReactDOMServer.renderToString(
			<HtmlDocument
				environment={process.env.NODE_ENV}
				applicationName={applicationName}
				title="Ylopo Stars"
				componentHTML=""
				content={ content }
				main={config.get('js.main')}
				googleAnalyticsScript={`(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create', '${ config.get('analytics.googleId') }', 'auto');ga('send', 'pageview');`}
				googleAPIKey={config.get('google.apiKey')}
			/>
		);
}

export default function renderIndexDoc(req, res) {
	var content = {
		version: objectPath.get(req, 'locals.package.version')
	};

	res
		.set('Content-Type', 'text/html')
		.send(generateHtmlDocument(req, content));
}
