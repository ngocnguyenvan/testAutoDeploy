'use strict';

// react is required for JSX
import React from 'react'; // eslint-disable-line no-unused-vars
import { Tracking } from '../Constants';

/**
 * pushGoogleAnalytics
 *
 * @param {string} category
 * @param {string} action
 * @param {string} label
 * @param {string} value
 * @param {bool} nonInteraction
 * @returns {void}
 */
export var pushGoogleAnalytics = function( category, action, label, value, nonInteraction ) {
	if ( typeof window !== 'undefined' && window.ga ) {
		var eventParams = {
			hitType: 'event',
			eventCategory: category ? category : 'Undefined Category',
			eventAction: action ? action : 'Undefined Action',
			eventLabel: label ? label : undefined,
			eventValue: value ? value : undefined
		};
		if ( nonInteraction ) {
			eventParams.nonInteraction = 1;
		}
		window.ga( 'send', eventParams );
	}
};

export var getGoogleFinishImg = function() {
	if ( Tracking.googleFinishSrc ) {
		return <img
			height="1"
			width="1"
			style="border-style:none;"
			alt=""
			src={ Tracking.googleFinishSrc }
		/>;
	}
	else {
		return null;
	}
};

export var pushFacebookFinish = function() {
	if ( typeof window !== 'undefined' && Tracking.facebookFinishId ) {
		window._fbq = window._fbq || [];
		window._fbq.push(['track', Tracking.facebookFinishId, { value: '0.00', currency: 'USD' }]);
	}
};
