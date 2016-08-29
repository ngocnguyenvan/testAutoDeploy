/*

CRUD Card

Editable card skeleton

*/
'use strict';

import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Block, BlockHeader, BlockContent } from '../../core/Block';
import Button from '../../core/Button';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class EditableCard extends React.Component {

	static propTypes = {
		onEditStart: PropTypes.func,
		onEditSubmit: PropTypes.func,
		onEditCancel: PropTypes.func,

		viewModeContent: React.PropTypes.node,
		editModeContent: React.PropTypes.node,

		title: React.PropTypes.string,

		blockHeaderProps: React.PropTypes.object,

		buttonsVisible: PropTypes.bool,
		editMode: PropTypes.bool,
		editButtonDisabled: PropTypes.bool,
		editButtonStyle: PropTypes.object,
		editButtonClassName: PropTypes.string,
		editButtonLabel: PropTypes.string,
		saveButtonDisabled: PropTypes.bool,
		saveButtonStyle: PropTypes.object,
		saveButtonClassName: PropTypes.string,
		saveButtonLabel: PropTypes.string,
		cancelButtonDisabled: PropTypes.bool,
		cancelButtonStyle: PropTypes.object,
		cancelButtonClassName: PropTypes.string,
		cancelButtonLabel: PropTypes.string,

		className: PropTypes.string
	};

	static defaultProps = {
		editMode: false,
		buttonsVisible: true,
		editButtonLabel: 'Edit',
		saveButtonLabel: 'Save',
		cancelButtonLabel: 'Cancel'
	};

	constructor() {
		super();

		this.toggleEditMode = this.toggleEditMode.bind(this);
		this.submit = this.submit.bind(this);

		this.state = {
			editMode: EditableCard.defaultProps.editMode
		};
	}

	componentWillMount() {
		if (super.componentWillMount) {
			super.componentWillMount();
		}
		this.setState({
			editMode: this.props.editMode
		});
	}

	toggleEditMode() {
		var enteredEditMode = !this.state.editMode;
		this.setState({
			editMode: !this.state.editMode
		});
		if (enteredEditMode) {
			if (this.props.onEditStart) {
				this.props.onEditStart();
			}
		}
		else if (this.props.onEditCancel) {
			this.props.onEditCancel();
		}
	}

	submit() {
		if (this.props.onEditSubmit) {
			this.props.onEditSubmit()
				.then(() => {
					this.setState({
						editMode: false
					});
				})
				.catch(() => {});
		}
	}

	render() {
		var classes = classNames('crud-card', this.state.editMode ? 'edit-mode' : null, this.props.className);

		return <Block className={classes}>
			{ this.props.title &&
				<BlockHeader title={this.props.title} {...this.props.blockHeaderProps} />
			}
			<BlockContent>
				<div className="crud-card">
					{ !this.state.editMode && this.props.viewModeContent }
					{ this.state.editMode && this.props.editModeContent }
					{ this.props.buttonsVisible &&
					<div className="buttons-top-right">
						{ !this.state.editMode &&
						<Button primary={true}
									disabled={this.props.editButtonDisabled}
									style={this.props.editButtonStyle}
									className={this.props.editButtonClassName}
									label={this.props.editButtonLabel}
									onClick={this.toggleEditMode} /> }
						{ this.state.editMode &&
						<Button primary={true}
									disabled={this.props.saveButtonDisabled}
									style={this.props.saveButtonStyle}
									className={this.props.saveButtonClassName}
									label={this.props.saveButtonLabel}
									onClick={this.submit}/> }
						{ this.state.editMode &&
						<Button style={this.props.cancelButtonStyle}
									disabled={this.props.cancelButtonDisabled}
									className={this.props.cancelButtonClassName}
									label={this.props.cancelButtonLabel}
									onClick={this.toggleEditMode}/> }
					</div>
					}
				</div>
			</BlockContent>
		</Block>;
	}
}
