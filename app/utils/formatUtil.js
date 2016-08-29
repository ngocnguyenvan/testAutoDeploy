
import { numberFormat } from 'underscore.string';
import numeral from 'numeral';

// from underscore.string.numberFormat.js
export var formatMoney = ( number, decimals = 2 ) => {
	if ( typeof number === 'string' ) {
		number = number.replace( /[^0-9\.]+/g, '' );
	}
	return numberFormat( Number( number ), decimals, '.', ',' );
};

/**
 * Abbreviate and format num as currency.
 * E.g. 400000 => $400k
 *      12000000 => $1.2m
 *
 * @param {number} num
 * @return {string}
 * @private
 * @see http://numeraljs.com/
 */
export var formatMoneyShort = (num) => {
	return numeral(num).format('$0[.]0a');
};

export var formatPhone = ( number ) => {
	if ( number.length === 10 ) {
		var num2 = ('' + number).replace(/\D/g, ''); // strip all non digets
		var toReturn = num2.match(/^(\d{3})(\d{3})(\d{4})$/); // break it into 3 pieces, array[]
		return !toReturn ? null : '(' + toReturn[1] + ') ' + toReturn[2] + '-' + toReturn[3]; // join the array
	}
	// we have a 1-800 number or something
	return number;
};

export var formatNumber = ( number, decimals = 0 ) => {
	if ( typeof number === 'string' ) {
		number = number.replace( /[^0-9\.]+/g, '' );
	}
	return numberFormat( Number( number ), decimals, '.', ',' );
};
export function formatPriceLabel(number) {
	const ranges = [
		{ threshold: 1e6, suffix: 'M' },
		{ threshold: 1e3, suffix: 'K' },
	];
	for (let i = 0; i < ranges.length; i++) {
		if (number >= ranges[i].threshold) {
			const decimalPointIndex = parseFloat(number / ranges[i].threshold).toFixed(1).indexOf('.');
			const decimalIndex = decimalPointIndex + 1;
			const tensPoint = parseFloat(number / ranges[i].threshold).toFixed(1)[decimalIndex];
			let label = parseFloat(number / ranges[i].threshold).toFixed() + ranges[i].suffix;
			if (tensPoint === '0') {
				label = parseFloat(number / ranges[i].threshold).toFixed() + ranges[i].suffix;
			} else {
				label = parseFloat(number / ranges[i].threshold).toFixed(1) + ranges[i].suffix;
			}
			return label;
		}
	}
	return number;
}
export default {
	formatMoney,
	formatMoneyShort,
	formatNumber,
	formatPhone
};
