'use strict';

import React from 'react';
import objectPath from 'object-path';
import { isEqual, isEmpty, cloneDeep, reduce, transform, debounce, forEach, toArray } from 'lodash';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import ContentAddCircleIcon from 'material-ui/svg-icons/content/add-circle';
import TagsInput from 'react-tagsinput';
import AbstractField from './components/AbstractField';
import LinkField from './components/LinkField';
import ListField from './components/ListField';
import UploadField from './components/UploadField';
import CheckboxListField from './components/CheckBoxListField';
import LocationAutocomplete from '../../lead/LocationAutocomplete';
import TextBox from '../../core/TextBox';
import SelectFieldClassic from '../../core/SelectFieldClassic';

import materialUiTheme, { compositeContainer } from '../../../styles/material-ui-theme';

import classNames from 'classnames';
import formUtil from '../../../utils/formUtil';
import { getObjectChanges } from '../../../utils/objectUtil';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class FormFieldsMaterial extends AbstractField {

	static forceUpdateDebounceIntervalMs = 50;

	static propTypes = {
		attribute: React.PropTypes.string,
		fields: React.PropTypes.array.isRequired,
		mode: React.PropTypes.string,
		onSubmit: React.PropTypes.func,
		onChange: React.PropTypes.func,
		object: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.object
		]),
		objectAsReference: React.PropTypes.bool,
		displayErrors: React.PropTypes.bool,
		floatingLabelTextDisabled: React.PropTypes.bool,
		className: React.PropTypes.string,
		style: React.PropTypes.object
	};

	static defaultProps = {
		floatingLabelTextDisabled: false,
		objectAsReference: false
	};

	constructor( props ) {
		super( props );
		this.submit = this.submit.bind( this );
		this.isValid = this.isValid.bind( this );
		this.resetFieldsChanges = this.resetFieldsChanges.bind( this );
		this.renderField = this.renderField.bind( this );
		this.renderInput = this.renderInput.bind( this );
		this.renderTextBox = this.renderTextBox.bind( this );
		this.renderCheckbox = this.renderCheckbox.bind( this );
		this.renderSelect = this.renderSelect.bind( this );
		this.renderSelectClassic = this.renderSelectClassic.bind( this );
		this.renderLink = this.renderLink.bind( this );
		this.renderList = this.renderList.bind( this );
		this.renderComposite = this.renderComposite.bind( this );
		this.renderTagsText = this.renderTagsText.bind( this );
		this.renderSearchTagsText = this.renderSearchTagsText.bind( this );
		this.onFieldKeyUpHandler = this.onFieldKeyUpHandler.bind( this );
		this.onCustomFieldChangeHandler = this.onCustomFieldChangeHandler.bind( this );
		this.onStandardFieldChangeHandler = this.onStandardFieldChangeHandler.bind( this );
		this.onCheckboxChangeHandler = this.onCheckboxChangeHandler.bind( this );
		this.forceUpdateBound = this.forceUpdate.bind(this);


		this.state = {
			originalObject: {},
			object: {},
			fieldsWithMetadata: []
		};
	}

	componentWillMount() {
		this.setState({
			originalObject: cloneDeep(this.props.object),
			object: this.props.objectAsReference ? this.props.object : cloneDeep(this.props.object),
			fieldsWithMetadata: cloneDeep(this.props.fields)
		});
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(this.state.originalObject, nextProps.object)) {
			this.setState({
				originalObject: cloneDeep(nextProps.object),
				object: nextProps.objectAsReference ? nextProps.object : cloneDeep(nextProps.object)
			});
		}
		if (!isEqual(this.props.fields, nextProps.fields)) {
			this.setState({
				fieldsWithMetadata: cloneDeep(nextProps.fields)
			});
		}
	}

	isValid() {
		return formUtil.areFieldsValid(this.state.object, this.state.fieldsWithMetadata);
	}

	/**
	 * Returns React components are not valid
	 * @returns {Array}
     */
	getComponentsWithErrors() {
		var outFieldsWithError = [];
		formUtil.areFieldsValid(this.state.object, this.state.fieldsWithMetadata, outFieldsWithError);
		return outFieldsWithError.map((field) => field.ref);
	}

	/**
	 * Return props.object with changed data from form fields
	 * @returns {FormFieldsMaterial.state.object|{}}
     */
	getFieldsStateObject() {
		return this.state.object;
	}

	/**
	 * Return object contains changed data from form fields compared to original props.object
	 * @returns {object}
	 */
	getFieldsStateObjectChanges() {
		return getObjectChanges(this.state.object, this.state.originalObject);
	}

	/**
	 * @returns {Array.<File>}
	 */
	getUploadedFiles() {
		var getFilesFunc = (object) => transform(object, (result, n, key) => {
			if (n instanceof File) {
				result[key] = n;
			}
			else if (typeof n === 'object') {
				var files = getFilesFunc(n);
				if (!isEmpty(files)) {
					forEach(files, (childValue, childKey) => {
						result[`${key}.${childKey}`] = childValue;
					});
				}
			}
		});

		return getFilesFunc(this.state.object);
	}

	resetFieldsChanges() {
		this.setState({
			object: this.state.originalObject
		});
	}

	renderField( field ) {
		var additionalProps = {

			ref: function(field, component) { // eslint-disable-line no-shadow
				// Real time validation
				field.ref = component;
				if (component) {
					var prevErrorText = field.errorText;
					if (this.props.displayErrors || field.displayErrors) {
						var errors = {};
						var isValid = formUtil.isFieldValid(this.state.object, field, errors);

						if (!isValid && !isEmpty(errors.errorList)) {
							field.errorText = reduce(errors.errorList, (result, errorMsg) => result + "\n" + errorMsg) || "";
							field.errorText.trim();
						}
						else {
							field.errorText = undefined;
						}
					}
					else {
						field.errorText = undefined;
					}

					if (prevErrorText !== field.errorText) {
						debounce(this.forceUpdateBound, FormFieldsMaterial.forceUpdateDebounceIntervalMs)();
					}
				}
			}.bind(this, field)
		};

		var fieldType = objectPath.get( field, 'type' );
		switch ( fieldType ) {
			case 'text':
				return this.renderInput( field, additionalProps );
			case 'textbox':
				return this.renderTextBox( field, additionalProps );
			case 'checkbox':
				return this.renderCheckbox( field, additionalProps );
			case 'checkbox-list':
				return this.renderCheckboxList( field, additionalProps );
			case 'select':
				return this.renderSelect( field, additionalProps );
			case 'select-classic':
				return this.renderSelectClassic( field, additionalProps );
			case 'password':
				return this.renderInput( field, additionalProps );
			case 'link':
				return this.renderLink( field, additionalProps );
			case 'list':
				return this.renderList( field, additionalProps );
			case 'image':
				return this.renderImage( field, additionalProps );
			case 'composite':
				return this.renderComposite( field, additionalProps );
			case 'custom':
				return field.render.call( this, field, additionalProps );
			case 'tagsText':
				return this.renderTagsText( field, additionalProps );
			case 'searchTagsText':
				return this.renderSearchTagsText( field, additionalProps );
			default:
				return <div>Undefined field: [{ fieldType }]</div>;
		}
	}

	/*
		Supported field options:
		{
			disabled,
			autoFocus,
			multiLine,
			rows,
			placeholder,
			floatingLabelTextDisabled,

	 		valueFormatter
		}
	 */
	renderInput( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		return <TextField
			ref={additionalProps.ref}
			disabled={field.disabled || false}
			autoFocus={field.autoFocus || false}
			className="form-control form-control-textfield"
			key={field.attribute}
			type={ field.type }
			multiLine={ field.multiLine || false}
			rows={ field.rows || 1}
			hintText={ field.placeholder }
			floatingLabelText={ !this.props.floatingLabelTextDisabled ? field.placeholder : undefined}
			name={ field.name }
			value={objectPath.get( this.state.object, field.attribute )}
			errorText={ field.errorText }
			displayErrors={ displayErrors }
			style={field.style}
			onKeyUp={this.onFieldKeyUpHandler}
			onChange={this.onStandardFieldChangeHandler.bind(this, field)}
		/>;
	}

	renderTextBox( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		return <TextBox
			ref={additionalProps.ref}
			disabled={field.disabled || false}
			autoFocus={field.autoFocus || false}
			className={ 'form-control form-control-textbox ' + (field.className || '')}
			key={field.attribute}
			type="text"
			placeholder={ field.placeholder }
			icon = { field.icon }
			name={ field.name }
			value={objectPath.get( this.state.object, field.attribute )}
			style={field.style}
			errorText={ field.errorText }
			displayErrors={ displayErrors }
			onKeyUp={this.onFieldKeyUpHandler}
			onChange={this.onStandardFieldChangeHandler.bind(this, field)}
		/>;
	}

	renderCheckbox( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;
		var value = objectPath.get( this.state.object, field.attribute );

		return <Checkbox
			ref={additionalProps.ref}
			label={field.label || false}
			labelPosition="left"
			disabled={field.disabled || false}
			autoFocus={field.autoFocus || false}
			className="form-control form-control-checkbox"
			key={field.attribute}
			hintText={ field.placeholder }
			floatingLabelText={ !this.props.floatingLabelTextDisabled ? field.placeholder : undefined}
			value={ value }
			checked={ value }
			errorText={ field.errorText }
			displayErrors={ displayErrors }
			onCheck={this.onCheckboxChangeHandler.bind(this, field)}
		/>;
	}

	renderSelect( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;
		var optionList = typeof field.optionList === 'function' ?
			field.optionList(this.state.object, field, additionalProps) : field.optionList;

		return <SelectField
			ref={additionalProps.ref}
			autoFocus={field.autoFocus || false}
			className="form-control form-control-select"
			key={ field.attribute }
			hintText={ field.placeholder }
			floatingLabelText={ !this.props.floatingLabelTextDisabled ? field.placeholder : undefined}
			name={ field.name }
			errorText={ field.errorText }
			displayErrors={ displayErrors }
			value={objectPath.get( this.state.object, field.attribute )}
			onChange={this.onStandardFieldChangeHandler.bind(this, field)}
		>
			{optionList.map( ( option, index ) =>
				<MenuItem key={index} value={option[ field.optionKey ]} primaryText={option[ field.optionLabel ]} />
			)}
		</SelectField>;
	}

	renderSelectClassic( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;
		var optionList = typeof field.optionList === 'function' ?
			field.optionList(this.state.object, field, additionalProps) : field.optionList;

		return <SelectFieldClassic
			ref={additionalProps.ref}
			autoFocus={field.autoFocus || false}
			className="form-control"
			key={ field.attribute }
			hintText={ field.placeholder }
			name={ field.name }
			errorText={ field.errorText }
			displayErrors={ displayErrors }
			icon = { field.icon }
			value={objectPath.get( this.state.object, field.attribute )}
			style={field.style}
			onChange={field.onChange ? this.onStandardFieldChangeHandlerByParty.bind(this, field) : this.onStandardFieldChangeHandler.bind(this, field)}
		>
			{optionList.map( ( option, index ) =>
				<MenuItem key={index} value={option[ field.optionKey ]} primaryText={option[ field.optionLabel ]} />
			)}
		</SelectFieldClassic>;
	}

	renderCheckboxList( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		var optionList = typeof field.optionList === 'function' ?
			field.optionList(this.state.object, field, additionalProps) : field.optionList;

		return <CheckboxListField
			ref={additionalProps.ref}
			className="form-control form-control-select"
			key={ field.attribute }
			name={ field.name }
			displayErrors={ displayErrors }
			errorText={ field.errorText }
			object={objectPath.get( this.state.object, field.attribute )}
			style={field.style}
			optionList={optionList}
			optionKey={field.optionKey}
			optionLabel={field.optionLabel}
			optionStyle={field.optionStyle}
			optionProps={field.optionProps}
			onChange={this.onCustomFieldChangeHandler.bind(this, field)}
		/>;
	}

	renderComposite( field, additionalProps) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		return <Paper key={field.attribute} className="composite-container" zDepth={0} style={compositeContainer.style}
		>
			{ field.label && <div style={compositeContainer.labelStyle}>{field.label}</div> }
			<FormFieldsMaterial
				ref={additionalProps.ref}
				object={objectPath.get( this.state.object, field.attribute )}
				fields={field.fields}
				onSubmit={this.props.onSubmit}
				onChange={this.onCustomFieldChangeHandler.bind(this, field)}
				mode={this.props.mode}
				displayErrors={displayErrors}
				floatingLabelTextDisabled={this.props.floatingLabelTextDisabled}
				/>
		</Paper>;
	}

	renderLink( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		return <LinkField
			ref={additionalProps.ref}
			disabled={field.disabled || false}
			key={field.attribute}
			label={field.label}
			object={objectPath.get( this.state.object, field.attribute )}
			onChange={this.onCustomFieldChangeHandler.bind(this, field)}
			errorText={ field.errorText }
			displayErrors={ displayErrors }
		/>;
	}

	renderList( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		return <ListField
			listItemRender={field.listItemRender}
			listType={field.listType}
			ref={additionalProps.ref}
			disabled={field.disabled || false}
			key={field.attribute}
			label={field.label}
			object={objectPath.get( this.state.object, field.attribute )}
			onChange={this.onCustomFieldChangeHandler.bind(this, field)}
			errorText={ field.errorText }
			displayErrors={ displayErrors }
		/>;
	}

	renderImage( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		return <UploadField
			ref={additionalProps.ref}
			disabled={field.disabled || false}
			key={field.attribute}
			label={field.label}
			object={objectPath.get( this.state.object, field.attribute )}
			onChange={this.onCustomFieldChangeHandler.bind(this, field)}
			errorText={ field.errorText }
			displayErrors={ displayErrors }
		/>;
	}

	renderTagsText( field, additionalProps ) {
		return <TagsInput
			value={ toArray( objectPath.get( this.state.object, field.attribute ) ) }
			onChange={this.onCustomFieldChangeHandler.bind(this, field)}
		/>;
	}

	renderSearchTagsText( field, additionalProps ) {
		var displayErrors = this.props.displayErrors || field.displayErrors;

		return <TagsInput
			className="form-control-tags-input"
			ref={additionalProps.ref}
			// this enables the `onBlur` method on the "input" object for adding to the tag list
			addOnBlur={ true }
			value={ toArray( objectPath.get( this.state.object, field.attribute ) ) }
			renderTag={ function renderSearchTagsTag( props2 ) {
				let { tag, key, onRemove, ...other } = props2;
				var label = '[Invalid Label]';
				if ( typeof tag === 'string' ) {
					label = tag;
				}
				else if ( tag.zip ) {
					label = tag.zip;
				}
				else if ( tag.city || tag.state ) {
					label = ( tag.city || '' ) + ( tag.city && tag.state ? ', ' : '' ) + ( tag.state || '' );
				}
				return <span key={ key } { ...other }>
					{ label }
					<ContentAddCircleIcon className="remove-btn" style={{
						transform: 'rotate(45deg)',
						width: 20,
						height: 20
					}}
						color={materialUiTheme.flatButton.textColor}
						hoverColor={materialUiTheme.flatButton.hoverColor}
						onClick={( e ) => onRemove( key )} />
				</span>;
			} }
			inputProps={{
				placeholder: "Enter Neighborhood, City, or zip"
			}}
			renderInput={ function renderSearchTagsInput( props2 ) {
				// pull out attributes we don't want to have on the input
				let {
					onChange, // eslint-disable-line no-unused-vars
					onBlur,
					onKeyDown, // eslint-disable-line no-unused-vars
					value,  // eslint-disable-line no-unused-vars
					...other // eslint-disable-line no-unused-vars
				} = props2;
				return <LocationAutocomplete
					placeholder="Enter Neighborhood, City, or zip"
					errorText={ field.errorText }
					displayErrors={displayErrors}
					disabled={ field.disabled }
					setValue={( values ) => {
						// this react component was designed to have the onChange event directly on an input...
						// hack for "objects"  ...  maybe https://github.com/prakhar1989/react-tags next?
						var mockInputEvent = {};
						objectPath.set( mockInputEvent, 'target.value', values );
						onBlur( mockInputEvent );
					}}
					{ ...props2 }
				/>;
			} }
			renderLayout={function renderLayout(tagComponents, inputComponent) {
				return <span>
					{inputComponent}
					<div>
						{tagComponents}
					</div>
				</span>;
			} }
			onChange={this.onCustomFieldChangeHandler.bind(this, field)}
		/>;
	}

	shouldDisplayField(field ) {
		if ( field.conditionalDisplay ) {
			return field.conditionalDisplay( this.state.object, field );
		}
		else if ( field.editModes && this.props.mode ) {
			return field.editModes.indexOf( this.props.mode ) !== -1;
		}
		else {
			return true;
		}
	}

	onFieldKeyUpHandler(e) {
		if ( e.keyCode === 13 ) { // Enter key
			this.submit();
		}
	}

	/**
	 * Handler used for elements inherited from FormFieldsMaterial/AbstractField
	 *
	 * @param {object} field
	 * @param {*} newValue
	 * @returns {void}
	 */

	onCustomFieldChangeHandler(field, newValue) {
		field.displayErrors = true; // Displaying errors after first control change

		var objectUpdated = objectPath.get( this.state, 'object' );

		if (typeof field.valueFormatter === 'function') {
			newValue = field.valueFormatter(newValue);
		}

		if (field.attribute !== undefined) {
			if (objectUpdated !== undefined) {
				objectPath.set(objectUpdated, field.attribute, newValue);
			}
			else {
				objectUpdated = {
					[field.attribute]: newValue
				};
			}
		}
		else {
			objectUpdated = newValue;
		}

		this.setState({
			object: objectUpdated
		});
		if (this.props.onChange) {
			this.props.onChange(objectUpdated, field);
		}
	}
	/**
	 * Handler used for MaterialUI or standard HTML elements
	 *
	 * @param {object} field
	 * @param {object} e
	 * @param {int} index
     * @param {*} value
	 * @returns {void}
     */
	onStandardFieldChangeHandler(field, e, index, value) {
		// value is used in SelectField
		// e.target.value in TextField
		return this.onCustomFieldChangeHandler(field, value ? value : e.target.value);
	}


	onCheckboxChangeHandler(field, e) {
		// e.target.checked in Checkbox
		return this.onCustomFieldChangeHandler(field, e.target.checked);
	}

	submit() {
		if ( this.props.onSubmit ) {
			return this.props.onSubmit();
		}
	}

	render() {
		return <div className={ classNames("form-fields-material", this.props.className) } style={this.props.style}>
			{ this.state.fieldsWithMetadata.map( ( field, index ) => {
				if ( this.shouldDisplayField( field ) ) {
					return <div key={index} className="field-group" style={field.wrapperStyle}>
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
