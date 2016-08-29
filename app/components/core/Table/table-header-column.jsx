'use strict';
/*
 Purpose of this class to provide extended styles overriding capabilities compared to original Material UI component
 All style changes are located in theme
 */
import React from 'react'; // eslint-disable-line no-unused-vars
import Tooltip from 'material-ui/internal/Tooltip';
import TableHeaderColumnOriginal from 'material-ui/Table/TableHeaderColumn';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import NavigationArrowDropUp from 'material-ui/svg-icons/navigation/arrow-drop-up';
import classnames from 'classnames';
import Constants from '../../../Constants';

if ( process.env.BROWSER ) {
	require('./table-header-column/styles.less');
}

function getStyles(props, state) {
	const {
		tableHeaderColumn
	} = state.muiTheme;

	return {
		root: {
			fontWeight: tableHeaderColumn.fontWeight || 'normal',
			fontSize: tableHeaderColumn.fontSize || 12,
			paddingLeft: tableHeaderColumn.spacing,
			paddingRight: tableHeaderColumn.spacing,
			height: tableHeaderColumn.height,
			textAlign: tableHeaderColumn.textAlign || 'left',
			whiteSpace: tableHeaderColumn.whiteSpace || 'nowrap',
			textOverflow: tableHeaderColumn.textOverflow || 'ellipsis',
			color: tableHeaderColumn.textColor,
			position: 'relative', verticalAlign: tableHeaderColumn.verticalAlign
		},
		tooltip: {
			boxSizing: 'border-box',
			marginTop: tableHeaderColumn.height / 2
		}
	};
}

export default class TableHeaderColumn extends TableHeaderColumnOriginal {

	static propTypes = {
		sortable: React.PropTypes.bool,
		sortableIsActive: React.PropTypes.bool,
		sortableSortDirection: React.PropTypes.string // use Constnants.SortDirection
	};

	static contextTypes = {
		muiTheme: React.PropTypes.object.isRequired
	};

	/**
	 * Almost full copy of original method. Goal was to override getStyles() private function and override classNames
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
			sortable,
			sortableIsActive,
			sortableSortDirection,
			onSortClick,
			style,
			tooltip,
			tooltipStyle,
			...other
		} = this.props;

		const { prepareStyles } = this.context.muiTheme;
		const styles = getStyles(this.props, this.context);

		const handlers = {
			onMouseEnter: this.onMouseEnter,
			onMouseLeave: this.onMouseLeave,
			onClick: this.onClick
		};

		let tooltipNode;

		if (tooltip !== undefined) {
			tooltipNode = <Tooltip
				label={tooltip}
				show={this.state.hovered}
				style={Object.assign(styles.tooltip, tooltipStyle)}
			/>;
		}

		// Added by Alex B (alex@ylopo.com)
		var classNames = classnames({
			'ylopo-header-column': true,
			'sortable-header': sortable,
			'active-header': sortableIsActive
		}, className);

		return <th
			className={classNames} // Added by Alex B (alex@ylopo.com)
			style={prepareStyles(Object.assign(styles.root, style))}
			{...handlers}
			{...other}
		>
			{tooltipNode}
			{sortable ?
				<span onClick={onSortClick}>
					{children}
					{ sortableSortDirection === Constants.SortDirection.DESC ? <NavigationArrowDropDown className="sortable-header-icon"/> : <NavigationArrowDropUp className="sortable-header-icon"/> }
				</span> :
				children
			}
		</th>;
	}

}
