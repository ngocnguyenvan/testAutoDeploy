import React from 'react';
import AbstractField from '../AbstractField';
import formUtil from '../../../../../utils/formUtil';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Dropzone from 'react-dropzone';
import { isEqual } from 'lodash';
import classNames from 'classnames';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class UploadField extends AbstractField {

	static propTypes = {
		object: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.object
		]),
		disabled: React.PropTypes.bool,
		displayErrors: React.PropTypes.bool,
		onChange: React.PropTypes.func.isRequired,
		label: React.PropTypes.string,
		style: React.PropTypes.object
	};

	constructor() {
		super();

		this.isValid = this.isValid.bind(this);
		this.reset = this.reset.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.onUrlTextChange = this.onUrlTextChange.bind(this);

		this.state = {
			url: '',
			file: {}
		};
	}

	componentWillMount() {
		this.setState({
			url: this.props.object
		});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !isEqual(this.props.object, nextProps.object) ||
			this.state.url !== nextState.url ||
			!isEqual(this.state.file.preview, nextState.file.preview);
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(this.props.object, nextProps.object)) {
			if (nextProps.object instanceof File) {
				this.setState({
					url: nextProps.object.name,
					file: nextProps.object
				});
			}
			else {
				this.setState({
					url: nextProps.object,
					file: {}
				});
			}
		}
	}

	isValid(globalObject, field, outError) {
		return formUtil.isFieldValid(globalObject, field, outError, true);
	}

	onDrop(files) {
		if (this.props.onChange) {
			this.props.onChange(files[0]);
		}
	}

	onUrlTextChange(e) {
		if (this.props.onChange) {
			this.props.onChange(e.target.value);
		}
	}

	reset() {
		if (this.props.onChange) {
			this.props.onChange('');
		}
	}

	render() {
		var imageUrl = this.state.file.preview || this.state.url;

		return <Paper className="upload-field composite-container" style={this.props.style}>
			<h4>{this.props.label}</h4>
			<TextField
				disabled={this.props.disabled || false}
				className="form-control form-control-textfield"
				hintText="Url"
				floatingLabelText="Url"
				title={this.state.url}
				value={this.state.url}
				errorText={ this.props.errorText }
				onChange={this.onUrlTextChange}/>
			<div>
				<Dropzone onDrop={this.onDrop} multiple={false} className={ classNames('dropzone', imageUrl ? 'dropzone-img' : 'dropzone-text', this.props.errorText && 'error') }>
					{ imageUrl ?
						<img src={imageUrl} alt={imageUrl} /> :
						<div>Try dropping some files here, or click to select files to upload.</div>}
				</Dropzone>
				{ imageUrl &&
				<IconButton className="reset-btn" onClick={this.reset}><NavigationClose /></IconButton>
				}
			</div>
		</Paper>;
	}
}
