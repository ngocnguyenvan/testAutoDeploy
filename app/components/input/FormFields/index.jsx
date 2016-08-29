'use strict';

import React from 'react';
import objectPath from 'object-path';
import classNames from 'classnames';

import formUtil from '../../../utils/formUtil';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

class FormFields extends React.Component {

	static propTypes = {
		fields: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func.isRequired,
		mode: React.PropTypes.string,
		onSubmit: React.PropTypes.func,
		object: React.PropTypes.object,
		displayErrors: React.PropTypes.bool,
		imageUpload: React.PropTypes.func
	};

	constructor( props ) {
		super( props );
		this.renderField = this.renderField.bind( this );
		this.renderInput = this.renderInput.bind( this );
		this.renderCheckbox = this.renderCheckbox.bind( this );
		this.genContainerClasses = this.genContainerClasses.bind( this );
	}

	genContainerClasses( field ) {
		var additionalClasses = {};
		if ( this.props.displayErrors ) {
			additionalClasses[ 'has-error' ] = !formUtil.isFieldValid( this.props.object, field );
		}

		return classNames(
			'field-group',
			additionalClasses
		);
	}

	renderField( field ) {
		var fieldType = objectPath.get( field, 'type' );
		switch ( fieldType ) {
			case 'text':
				return this.renderInput( field );
			case 'password':
				return this.renderInput( field );
			case 'checkbox':
				return this.renderCheckbox( field );
			default:
				return <div>Undefined field: [{ fieldType }]</div>;
		}
	}

	renderCheckbox( field ) {
		var value = objectPath.get( this.props.object, field.attribute );
		return <label key={field.attribute} className="checkbox">
			<input
				autoFocus={field.autoFocus || false}
				type="checkbox"
				value={value}
				name={field.name}
				checked={value === true}
				onKeyUp={( e ) => {
					if ( e.keyCode === 13 && this.props.onSubmit ) {
						this.props.onSubmit();
					}
				}}
				onChange={( e ) => {
					this.props.onChange( e.target.checked, field );
				}}
			/>
			{field.label}
		</label>;
	}

	renderInput( field ) {
		return <input
			autoFocus={field.autoFocus || false}
			className="form-control"
			key={field.attribute}
			type={ field.type }
			placeholder={ field.placeholder }
			name={ field.name }
			value={objectPath.get( this.props.object, field.attribute )}
			onKeyUp={( e ) => {
				if ( e.keyCode === 13 && this.props.onSubmit ) {
					this.props.onSubmit();
				}
			}}
			onChange={( e ) => {
				this.props.onChange( e.target.value, field );
			}}
		/>;
	}

	displayField( field ) {
		if ( field.conditionalDisplay ) {
			return field.conditionalDisplay( this.props.object, field );
		}
		else if ( field.editModes && this.props.mode ) {
			return field.editModes.indexOf( this.props.mode ) !== -1;
		}
		else {
			return true;
		}
	}

	render() {
		return <div className="form-fields">
			{ this.props.fields.map( ( field ) => {
				if ( this.displayField( field ) ) {
					return <div key={field.attribute} className={this.genContainerClasses( field )}>
						{this.renderField( field )}
					</div>;
				}
				else {
					return null;
				}
			})}
		</div>;
	}
}

module.exports = FormFields;
