import React from 'react';

export default class AbstractField extends React.Component {

	static propTypes = {
		object: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number,
			React.PropTypes.object
		]),
		disabled: React.PropTypes.bool,
		displayErrors: React.PropTypes.bool,
		/**
		 * First parameter - updated object,
		 * (optional) Second parameter - child field that was changed
		 */
		onChange: React.PropTypes.func.isRequired
	};

	static defaultProps = {
		displayErrors: false,
		disabled: false
	};

	/**
	 * Calculates if field is valid in context of globalObject. If not, errors are returned to outError object
	 * @param {object} globalObject
	 * @param {object} field
	 * @param {Error} outError
	 * @returns {boolean}
     */
	isValid(globalObject, field, outError) {
		// Check field.validators here
		return true;
	}
}
