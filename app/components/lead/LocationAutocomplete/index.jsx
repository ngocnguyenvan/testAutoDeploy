/*

LocationAutocomplete

A component to provide autocomplete functionality and fire a callback when the value has changed.
-  Works with Google Places Autocomplete
-  Values are a map of address values:
     {
		streetNumber: '4431'.
		street: 'S. Main St',
		city: 'Denver',
		state: 'CO',
		county: 'Adams',
		postalCode: '44321'.
		country: 'US'
     }


*/
'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import { findDOMNode } from 'react-dom';
import objectPath from 'object-path';
import classNames from 'classnames';
import { reduce, isEmpty } from 'lodash';
import TextBox from '../../core/TextBox';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

/* eslint-disable camelcase */
var googleComponentMap = {
	locality: {
		key: 'city',
		label: 'long_name'
	},
	administrative_area_level_1: {
		key: 'state',
		label: 'short_name'
	},
	postal_code: {
		key: 'zip',
		label: 'short_name'
	}
};
/* eslint-enable camelcase */

export default class LocationAutocomplete extends React.Component {

	static propTypes = {
		inputDisplay: React.PropTypes.array,
		values: React.PropTypes.object,
		placeholder: React.PropTypes.string,
		onBlur: React.PropTypes.func,
		onFocus: React.PropTypes.func,
		options: React.PropTypes.object,
		setValue: React.PropTypes.func,
		createInputValue: React.PropTypes.func,
		errorText: React.PropTypes.string,
		displayErrors: React.PropTypes.bool.isRequired,
		className: React.PropTypes.string,
		style: React.PropTypes.object,
		disabled: React.PropTypes.bool
	};

	static defaultProps = {
		placeholder: 'Autocomplete Input',
		options: {
			types: [ '(regions)' ],
			componentRestrictions: { country: 'us' }
		},
		inputDisplay: [
			'streetNumber',
			'street',
			'city',
			'state',
			'postalCode'
		],
		displayErrors: false,
		disabled: false
	};

	googleEventListener = undefined;

	constructor( props ) {
		super( props );
		this.placeChanged = this.placeChanged.bind( this );
		this.initializeGoogleAutocomplete = this.initializeGoogleAutocomplete.bind( this );
		this.unInitializeGoogleAutocomplete = this.unInitializeGoogleAutocomplete.bind( this );
		this.createInputValue = this.createInputValue.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );
		this.onChange = this.onChange.bind( this );

		this.state = {
			inputValue: this.createInputValue( objectPath.get( props, 'values' ) || {} )
		};
	}

	componentWillReceiveProps( newProps ) {
		this.setState({
			inputValue: this.createInputValue( objectPath.get( newProps, 'values' ) || {} )
		});
	}

	componentDidMount() {
		this.initializeGoogleAutocomplete();
	}

	componentWillUnmount() {
		this.unInitializeGoogleAutocomplete();
	}

	/**
	 * initializeGoogleAutocomplete
	 *
	 * initializes the necessary aspects of the autocomplete from google.
	 *
	 * [ TODO ] - ensure google.maps is loaded or load asynchronously to the document...
	 * [ NOTE ] we have no guarantee that google has loaded.  Consider wrapping in a function which queue methods for
	 * firing when/if the library has loaded.
	 *
	 * @returns {void}
	**/
	initializeGoogleAutocomplete() {
		var self = this;
		if ( window.google ) {
			this.googleEventListener = window.google.maps.event.addListener(
				new window.google.maps.places.Autocomplete( findDOMNode(this).querySelector('input'), this.props.options ),
				'place_changed',
				function() {
					self.placeChanged( this );
				}
			);
		}
	}

	/**
	 * unInitializeGoogleAutocomplete
	 *
	 * Removes the listeners from the google autocomplete.
	 *
	 * @returns {void}
	**/
	unInitializeGoogleAutocomplete() {
		if ( window.google && this.googleEventListener ) {
			window.google.maps.event.removeListener( this.googleEventListener );
		}
	}

	/**
	 * placeChanged
	 *
	 * handle the google autocomplete change event.
	 * this is
	 *
	 * @param {window.google.maps.places.Autocomplete} autocomplete
	 * @returns {void}
	**/
	placeChanged( autocomplete ) {
		var place = autocomplete.getPlace();
		var values = {};

		if ( place && place.address_components ) {
			place.address_components.forEach( function( component ) {
				for ( var i in googleComponentMap ) {
					var mapping = googleComponentMap[ i ];
					if ( component.types.indexOf( i ) !== -1 ) {
						values[ mapping.key ] = component[ mapping.label ];
					}
				}
			});
		}

		// Zip or City should be defined, not allowing broad State search
		if (Object.keys(values).length === 1 && values[googleComponentMap.administrative_area_level_1.key]) {
			values = [];
		}

		/* this.setState({
			inputValue: this.createInputValue( values )
		});*/

		// Preventing tag creation for non-zip, state or city values
		if (!isEmpty(values)) {
			this.props.setValue(values);
		}
		else {
			this.setState({
				inputValue: ''
			});
		}
	}

	/**
	 * createInputValue
	 *
	 * Parent can either define this method via a prop or is able to configure it from the inputDisplay list.
	 *
	 * @param {Array} values
	 * @return {string} a string made from the props.
	 */
	createInputValue( values ) {
		if ( this.props.createInputValue ) {
			return this.props.createInputValue( values );
		}

		return reduce(
			this.props.inputDisplay,
			( result, element ) => {
				var value = values[ element ];
				if ( value ) {
					if ( result ) {
						result += ', ';
					}
					result += value;
				}
				return result;
			},
			''
		);
	}

	onChange(e) {
		this.setState({
			inputValue: objectPath.get( e, 'target.value' )
		});
	}

	onBlur(e) {
		// We don't need to pass any actual value, we need just to trigger onBlur event
		var mockInputEvent = {};
		objectPath.set( mockInputEvent, 'target.value', '' );
		return this.props.onBlur ? this.props.onBlur(mockInputEvent) : undefined;
	}

	onFocus(e) {
		return this.props.onFocus ? this.props.onFocus(e) : undefined;
	}

	render() {
		return <TextBox
			className={ classNames( 'google-autocomplete', this.props.className ) }
			icon={
				<img style={{ paddingTop: 2 }} src={ process.env.BROWSER ? require('../../../assets/images/search-icon-input.png') : '' } />
			}
			type="text"
			value={this.state.inputValue}
			onBlur={this.onBlur}
			onFocus={this.onFocus}
			placeholder={this.props.placeholder}
			errorText={this.props.errorText}
			displayErrors={this.props.displayErrors}
			onChange={this.onChange}
			style={this.props.style}
			disabled={this.props.disabled}
		/>;
	}
}
