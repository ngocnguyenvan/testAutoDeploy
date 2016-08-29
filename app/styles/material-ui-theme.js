/*
	Theme file for Material-UI components
 */
'use strict';

// TODO get from CSS?

export const textColor = '#4d4e4e';
export const borderRadius = 4;
export const borderColor = '#e6e6e6';
export const hintColor = '#6c6c6c';
export const border = '1px solid ' + borderColor;
export const borderInput = '1px solid #cccccc';
export const borderInputError = '1px solid Red';
export const compositeContainer = {
	style: {
		backgroundColor: '#f6f7f9',
		borderRadius: borderRadius
	},
	labelStyle: {
		fontWeight: 600,
		fontSize: 21,
		marginBottom: 25
	}
};

export default {
	fontFamily: 'Open Sans, sans-serif',
	fontWeight: 600,
	palette: {
		textColor: textColor,
		borderColor: borderColor
	},
	spacing: {
		desktopGutterLess: 10
	},

	flatButton: {
		color: '#9eb445',
		disabledTextColor: 'rgba(255,255,255,0.4)',
		textColor: '#fff',
		textTransform: 'none',
		hoverColor: '#545454' // not working in mui-theme, just for reference
	},

	checkbox: {
		checkedColor: '#9eb445',
		boxColor: borderColor
	},

	table: {
		paddingLeft: 24,
		paddingRight: 24
	},

	tableHeaderColumn: {
		textColor: textColor,
		fontSize: 14,
		fontWeight: 600,
		whiteSpace: 'initial',
		verticalAlign: 'middle',
		textOverflow: 'clip'
	},

	tableRowColumn: {
		textColor: textColor,
		fontSize: 14,
		fontWeight: 600,
		whiteSpace: 'initial',
		verticalAlign: 'middle',
		textOverflow: 'clip'
	},

	tableRow: {
		stripeColor: '#f8f8f8'
	},

	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.166)'
	}
};
