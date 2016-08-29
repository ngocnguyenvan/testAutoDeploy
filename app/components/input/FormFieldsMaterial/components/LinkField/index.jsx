import React from 'react';
import AbstractField from '../AbstractField';
import FormFieldsMaterial from '../../../FormFieldsMaterial';
import { isEqual } from 'lodash';

export default class LinkField extends AbstractField {

	static propTypes = {
		object: React.PropTypes.object,
		disabled: React.PropTypes.bool,
		displayErrors: React.PropTypes.bool,
		onChange: React.PropTypes.func.isRequired,
		label: React.PropTypes.string,
		style: React.PropTypes.object
	};

	constructor() {
		super();
		this.generateFields = this.generateFields.bind(this);
		this.isValid = this.isValid.bind(this);
		this.onChange = this.onChange.bind(this);

		this.state = {
			fields: []
		};
	}

	componentWillMount() {
		this.setState({
			fields: this.generateFields(this.props)
		});
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(this.props.label, nextProps.label) ||
			!isEqual(this.props.displayErrors, nextProps.displayErrors)) {
			this.setState({
				fields: this.generateFields(nextProps)
			});
		}
	}

	isValid(globalObject, field, outError) {
		return super.isValid(globalObject, field, outError) &&
			this.refs.formFieldsComponent.isValid();
	}

	onChange(objectUpdated) {
		if (this.props.onChange) {
			this.props.onChange(objectUpdated);
		}
	}

	generateFields(props) {
		return [
			{
				label: props.label,
				type: 'composite',
				fields: [
					{
						displayErrors: props.displayErrors,
						attribute: 'link',
						placeholder: 'Link',
						type: 'text'
					},
					{
						displayErrors: props.displayErrors,
						attribute: 'label',
						placeholder: 'Label',
						type: 'text'
					},
					{
						displayErrors: props.displayErrors,
						attribute: 'target',
						placeholder: 'Target',
						type: 'text'
					}
				]
			}
		];
	}

	render() {
		return <FormFieldsMaterial
			ref="formFieldsComponent"
			fields={this.state.fields}
			object={this.props.object}
			onChange={this.onChange}
			style={this.props.style}
			displayErrors={this.props.displayErrors}
		/>;
	}
}
