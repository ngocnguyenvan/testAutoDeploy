import React from 'react';
import AbstractField from '../AbstractField';
import FormFieldsMaterial from '../../../FormFieldsMaterial';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Button from '../../../../core/Button';

import { cloneDeep, forEach } from 'lodash';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class ListField extends AbstractField {

	static propTypes = {
		listItemRender: React.PropTypes.func,
		listType: React.PropTypes.string,
		object: React.PropTypes.array,
		disabled: React.PropTypes.bool,
		displayErrors: React.PropTypes.bool,
		onChange: React.PropTypes.func.isRequired,
		label: React.PropTypes.string,
		style: React.PropTypes.object
	};

	static defaultProps = {
		object: []
	};

	constructor() {
		super();
		this.addItem = this.addItem.bind( this );
		this.deleteItem = this.deleteItem.bind( this );
		this.renderListItem = this.renderListItem.bind( this );
		this.onChange = this.onChange.bind(this);
		this.onChangeFormFields = this.onChangeFormFields.bind(this);
	}

	isValid(globalObject, field, outError) {
		var isValid = true;
		forEach(this.refs, (ref) => {
			isValid = isValid && ref.isValid(globalObject, field, outError);
		});
		return isValid;
	}

	addItem() {
		var updatedObject = cloneDeep(this.props.object);
		updatedObject.unshift({});
		this.onChange(updatedObject);
	}

	deleteItem(item, index) {
		var updatedObject = cloneDeep(this.props.object);
		updatedObject.splice(index, 1);
		this.onChange(updatedObject);
	}

	onChangeFormFields(updatedObject) {
		this.onChange(updatedObject);
	}

	onChange(updatedObject) {
		if (this.props.onChange) {
			this.props.onChange(updatedObject);
		}
	}

	renderListItem(item, index) {
		return <div key={index} className="list-field-item">
				<FormFieldsMaterial
					ref={'formFieldsComponent' + index}
					object={this.props.object}
					fields={[
						{
							attribute: index,
							disabled: this.props.disabled,
							type: this.props.listType,
							render: this.props.listItemRender,
							displayErrors: this.props.displayErrors
						}
					]}
					onChange={this.onChangeFormFields}
					displayErrors={this.props.displayErrors}/>
				<div className="delete-btn-wrapper">
					<IconButton disabled={this.props.disabled} onClick={this.deleteItem.bind(this, item, index)}>
						<NavigationClose />
					</IconButton>
				</div>
			</div>;
	}

	render() {
		return <Paper className="list-field composite-container" style={this.props.style} zDepth={0}>
			<h4>{this.props.label}</h4>
				<div className="add-btn-wrapper">
					<Button onClick={this.addItem}
								label="Add new item"
								primary={true}/>
				</div>
				{ this.props.object.map((item, index) =>
					this.renderListItem(item, index)
				)}
		</Paper>;
	}
}
