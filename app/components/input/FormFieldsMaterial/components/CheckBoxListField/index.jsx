import React from 'react';
import AbstractField from '../AbstractField';
import MessageBin from '../../../../../components/core/MessageBin';
import { ServerStatuses } from '../../../../../Constants';

import Checkbox from '../../../../../components/core/Checkbox';

import { indexOf, clone, without } from 'lodash';

export default class CheckboxListField extends AbstractField {

	static propTypes = {
		object: React.PropTypes.array,
		optionList: React.PropTypes.array.isRequired,
		optionKey: React.PropTypes.string.isRequired,
		optionLabel: React.PropTypes.string.isRequired,
		disabled: React.PropTypes.bool,
		displayErrors: React.PropTypes.bool,
		onChange: React.PropTypes.func.isRequired,
		label: React.PropTypes.string,
		style: React.PropTypes.object,
		optionStyle: React.PropTypes.object,
		optionProps: React.PropTypes.object
	};

	static defaultProps = {
		object: []
	};

	constructor() {
		super();
		this.onChange = this.onChange.bind(this);
		this.checkChanged = this.checkChanged.bind(this);
	}

	checkChanged(item, e) {
		var value = item[this.props.optionKey];
		var updatedObject;
		if (e.target.checked) {
			updatedObject = clone(this.props.object);
			updatedObject.push(value);
		}
		else {
			updatedObject = without(this.props.object, value);
		}
		this.onChange(updatedObject);
	}

	onChange(updatedObject) {
		if (this.props.onChange) {
			this.props.onChange(updatedObject);
		}
	}

	render() {
		return <div style={this.props.style}>
			{ this.props.displayErrors &&
				<MessageBin
					status={this.props.errorText ? ServerStatuses.FAIL : ServerStatuses.READY}
					message={this.props.errorText}
				/>
			}
			{ this.props.optionList.map((item, index) =>
				<Checkbox label={item[this.props.optionLabel] || false} labelPosition="right" disabled={this.props.disabled || false} key={item[this.props.optionKey]} value={item[this.props.optionKey]} style={this.props.optionStyle} checked={indexOf(this.props.object, item[this.props.optionKey]) !== -1} onCheck={this.checkChanged.bind(this, item)}
							{...this.props.optionProps} />
			)}
			<div className="clear"></div>
		</div>;
	}
}
