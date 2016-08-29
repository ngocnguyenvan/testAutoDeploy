/*

CRUD Card with FormFields and Material UI

A simple list of fields that can be edited

Usage example:

	 <EditableCardWithFormFields ref="editableCard" fields={cardFields}
		 object={this.state.client}
		 displayErrors={this.state.displayErrors}
		 onSubmit={this.updateClient} />

	updateClient() {
		var updatedClientObj = this.refs.editableCard.getFieldsStateObject();
		if ( formUtil.areFieldsValid( updatedClientObj, cardFields ) ) {
			this.setState({
 				client: object
 			});
 			return true;
 		} else {
 			this.setState({
 				displayErrors: true
 			});
 			return false;
 		}
 	}

*/
'use strict';

import React, { PropTypes } from 'react';

import EditableCard from '../EditableCard';
import FormFieldsMaterial from '../../input/FormFieldsMaterial';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class EditableCardWithFormFields extends FormFieldsMaterial {

	static propTypes = {
		fields: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		object: React.PropTypes.object,
		displayErrors: React.PropTypes.bool,

		editMode: PropTypes.bool,
		onEditStart: PropTypes.func,
		onEditCancel: PropTypes.func
	};

	static defaultProps = {
		floatingLabelTextDisabled: true
	};

	render() {
		return <EditableCard {...this.props}
			onEditSubmit={this.submit}
			onEditCancel={() => {
				if (this.props.onEditCancel) {
					this.props.onEditCancel();
				}
				this.resetFieldsChanges();
			}}
			viewModeContent={
				 this.props.fields.map( ( field ) => {
					if ( this.shouldDisplayField( field ) ) {
						return <div key={field.attribute} className="row clearfix">
							<div className="title">{field.title}</div>
							<div className="value">
								{ this.props.object &&
									this.props.object[field.attribute]
								}
							</div>
							</div>;
					}
					else {
						return null;
					}
				})
			}
			editModeContent={
				 this.props.fields.map( ( field ) => {
					if ( this.shouldDisplayField( field ) ) {
						return <div key={field.attribute} className="row clearfix">
							<div className="title">{field.title}</div>
							<div className="value">
								<div className="field-group">
									{this.renderField( field )}
								</div>
							</div>
							</div>;
					}
					else {
						return null;
					}
				})
			}
		/>;
	}
}
