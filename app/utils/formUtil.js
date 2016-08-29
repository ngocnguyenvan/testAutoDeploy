'use strict';

import AbstractField from '../components/input/FormFieldsMaterial/components/AbstractField';
import objectPath from 'object-path';
import { forEach, isEmpty } from 'lodash';
import { EditMode } from '../Constants';

// TODO move everything inside FormFieldsMaterial
/**
 * Collection of common validators can be used with FormFields or FormFieldsMaterial components
 * @type {object}
 */
export var Validators = {

	required: function required( value, object ) {
		required.errorText = 'Field is required.';

		if (Array.isArray(value) && value.length === 0) {
			return false;
		}

		if (!isNaN(Number(value)) && value !== '') {
			return true;
		}

		return !isEmpty(value);
	},

	number: function number( value, object ) {
		number.errorText = 'Field value must be a number';

		if (value === undefined) {
			return true;
		}
		var re = /^-?\d*$/;
		return re.test(value);
	},

	numberWithCommas: function number( value, object ) {
		number.errorText = 'Field value must be a whole number';

		if (value === undefined) {
			return true;
		}
		var re = /^-?[\d,]*$/;
		return re.test(value);
	},

	positive: function positive( value, object ) {
		positive.errorText = 'Field value must be positive';

		if (!isNaN(Number(value))) {
			return Number(value) >= 0;
		}
		else {
			return true;
		}
	},

	/**
	 * A comprehensive regex for phone number validation taken from
	 * from http://stackoverflow.com/questions/123559/a-comprehensive-regex-for-phone-number-validation
	 * @param {string} value
	 * @param {object} object
	 * @returns {boolean}
     */
	phone: function phone( value, object ) {
		phone.errorText = 'Field value must be a valid phone number.';

		if (value === undefined) {
			return true;
		}
		var re = /(^|[^0-9.-/])(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4}),?(?:\s*(?:#|x\.?|opt(\.|:|\.:)?|option)\s*#?(\d+))?,?(?:\s*(?:#|x\.?|ext(\.|:|\.:)?|extension)\s*x?(\d+))?($|[^0-9.-/])/i;
		return re.test(value);
	},

	email: function email( value, object ) {
		email.errorText = 'Field value must be a valid email.';

		if (value === undefined) {
			return true;
		}
		var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(value);
	}
};

export var ValueFormatters = {

	number: (value) => value && !isNaN(value) ? Number(value) : value

};

/**
 *
 * isFieldValid
 *
 * validates the field being passed in aginst its defined "validator" or other default attributes
 *
 * -  validator
 * -  required
 *
 * @param {object} object - the "parent" object containing this field ( used for cross attribute validation )
 * @param {object} field - the object containing the definition and structure for this field
 * @param {object} outError - the object containing output error messages. Please pass empty object {} as this parameter
 * @param {boolean} validateAsStandardField - force standard field validation (just by value)
 *
 * @returns {boolean}
 *
 */
export var isFieldValid = function( object, field, outError = null, validateAsStandardField = false) {
	var isValid = true;
	if (field.ref && field.ref instanceof AbstractField && !validateAsStandardField) {
		// Custom field
		isValid = field.ref.isValid(object, field, outError);
	}
	else {
		// Standard field
		var value = objectPath.get(object, field.attribute);

		var validators = field.validators ? field.validators :
			field.validator ? [field.validator] : [];

		if (!field.validators && Array.isArray(field.validator)) {
			console.error('Use .validators property instead of .validator to pass multiple validators');
			return false;
		}

		if (field.required) { // Backwards compatibility
			validators.push(Validators.required);
		}

		var errorList = [];
		forEach(validators, (validator) => {
			var isValidatorValid = validator(value, object);
			if (!isValidatorValid) {
				isValid = false;
				if (validator.errorText) {
					errorList.push(validator.errorText);
				}
			}
		});

		if (outError) {
			outError.errorList = errorList;
		}
	}

	/* if(!isValid) {
		console.warn("Field is not valid: ", field);
	}*/
	return isValid;
};

/**
 *
 * areFieldsValid
 *
 * Validates all fields
 *
 * @param {object} object - the object containing the "attributes" being validated
 * @param {object} fields - the fields defined for validation
 * @param {array} outFieldsWithError - output fields with errors
 *
 * @returns {boolean}
 *
 */
export var areFieldsValid = function( object, fields, outFieldsWithError ) {
	var valid = true;
	fields.forEach( ( field ) => {
		var fieldValid = isFieldValid( object, field );
		if (!fieldValid) {
			if (outFieldsWithError) {
				outFieldsWithError.push(field);
			}
			valid = false;
		}
	});

	return valid;
};

/**
 *
 * getEditMode
 *
 * Returns if this object is in "CREATE" or "UPDATE" mode.
 *
 * @param {object} object - the object for which we are checking its mode
 * @returns {string}
 *
 */
export var getEditMode = function( object ) {
	var mode = EditMode.CREATE;
	if ( objectPath.get( object, 'objectId' ) ) {
		mode = EditMode.UPDATE;
	}
	return mode;
};

export default {
	isFieldValid,
	areFieldsValid,
	getEditMode,
	Validators,
	ValueFormatters
};
