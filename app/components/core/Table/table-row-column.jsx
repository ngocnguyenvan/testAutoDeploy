'use strict';
/*
 Purpose of this class to provide extended styles overriding capabilities compared to original Material UI component
 All style changes are located in theme
 */
import React from 'react';
import classnames from 'classnames';
import TableRowColumnOriginal from 'material-ui/Table/TableRowColumn';

if ( process.env.BROWSER ) {
	require('./table-row-column/styles.less');
}

function getStyles(props, state) {
	const {
		tableRowColumn
	} = state.muiTheme;

	const styles = {
		root: {
			paddingTop: 6,
			paddingBottom: 6,
			paddingLeft: tableRowColumn.spacing,
			paddingRight: tableRowColumn.spacing,
			height: tableRowColumn.height,
			textAlign: tableRowColumn.textAlign || 'left',
			fontSize: tableRowColumn.fontSize || 13,
			overflow: tableRowColumn.overflow || 'hidden',
			whiteSpace: tableRowColumn.whiteSpace || 'nowrap',
			textOverflow: tableRowColumn.textOverflow || 'ellipsis', verticalAlign: tableRowColumn.verticalAlign
		}
	};

	if (React.Children.count(props.children) === 1 && !isNaN(props.children)) {
		styles.textAlign = 'right';
	}

	return styles;
}

export default class TableRowColumn extends TableRowColumnOriginal {

	static contextTypes = {
		muiTheme: React.PropTypes.object.isRequired
	};

	/**
	 * Almost copy of original method. Goal was to override getStyles() private function and override classNames
	 * @returns {XML}
	 */
	render() {
		const {
			children,
			className,
			columnNumber, // eslint-disable-line no-unused-vars
			hoverable, // eslint-disable-line no-unused-vars
			onClick, // eslint-disable-line no-unused-vars
			onHover, // eslint-disable-line no-unused-vars
			onHoverExit, // eslint-disable-line no-unused-vars
			style,
			...other
		} = this.props;

		const { prepareStyles } = this.context.muiTheme;
		const styles = getStyles(this.props, this.context);
		const classNames = classnames(className, 'ylopo-row-column');

		const handlers = {
			onClick: this.onClick,
			onMouseEnter: this.onMouseEnter,
			onMouseLeave: this.onMouseLeave
		};

		return <td
			className={classNames}
			style={prepareStyles(Object.assign(styles.root, style))}
			{...handlers}
			{...other}
		>
			{children}
		</td>;
	}

}
