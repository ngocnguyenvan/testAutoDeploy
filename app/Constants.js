'use strict';

import keyMirror from 'fbjs/lib/keyMirror';

export var SortDirection = {
	ASC: 'asc',
	DESC: 'desc'
};

export var EditMode = keyMirror({
	LOAD: null,
	UPDATE: null,
	CREATE: null,
	DELETE: null
});

export var ServerStatuses = keyMirror({
	LOADING: null,
	READY: null,
	PROCESSING: null,
	SUCCESS: null,
	FAIL: null,
	HARD_FAIL: null
});

export var ActionTypes = keyMirror({
	LOADED_APPLICATION: null,
	SESSION_LOAD_SUCCESS: null,
	SESSION_LOAD_FAILED: null,

	SHOW_MODAL: null,
	HIDE_MODAL: null,

	USER_REGISTER: null,
	USER_REGISTER_SUCCESS: null,
	USER_REGISTER_FAILED: null,

	USER_UPDATE: null,
	USER_UPDATE_SUCCESS: null,
	USER_UPDATE_FAILED: null,

	LOGIN: null,
	LOGIN_SUCCESS: null,
	LOGIN_FAILED: null,
	LOGOUT: null,
	LOGOUT_SUCCESS: null,
	LOGOUT_FAILED: null
});

export var StoreDebounceRate = 9;

export var HOST = '/api/1.0';

export const SearchDefaults = {
	// Price options were hardcoded for time, in the future these will be generated.
	minPrice: [
		{
			value: 'undefined',
			label: 'No Min'
		},
		{
			value: 50000,
			label: '$50K'
		},
		{
			value: 75000,
			label: '$75K'
		},
		{
			value: 100000,
			label: '$100K'
		},
		{
			value: 125000,
			label: '$125K'
		},
		{
			value: 150000,
			label: '$150K'
		},
		{
			value: 175000,
			label: '$175K'
		},
		{
			value: 200000,
			label: '$200K'
		},
		{
			value: 250000,
			label: '$250K'
		},
		{
			value: 275000,
			label: '$275K'
		},
		{
			value: 300000,
			label: '$300K'
		},
		{
			value: 325000,
			label: '$325K'
		},
		{
			value: 350000,
			label: '$350K'
		},
		{
			value: 375000,
			label: '$375K'
		},
		{
			value: 400000,
			label: '$400K'
		},
		{
			value: 425000,
			label: '$425K'
		},
		{
			value: 450000,
			label: '$450K'
		},
		{
			value: 475000,
			label: '$475K'
		},
		{
			value: 500000,
			label: '$500K'
		},
		{
			value: 550000,
			label: '$550K'
		},
		{
			value: 600000,
			label: '$600K'
		},
		{
			value: 650000,
			label: '$650K'
		},
		{
			value: 700000,
			label: '$700K'
		},
		{
			value: 750000,
			label: '$750K'
		},
		{
			value: 800000,
			label: '$800K'
		},
		{
			value: 850000,
			label: '$850K'
		},
		{
			value: 900000,
			label: '$900K'
		},
		{
			value: 950000,
			label: '$950K'
		},
		{
			value: 1000000,
			label: '$1M'
		},
		{
			value: 1250000,
			label: '$1.25M'
		},
		{
			value: 1500000,
			label: '$1.5M'
		},
		{
			value: 1750000,
			label: '$1.75M'
		},
		{
			value: 2000000,
			label: '$2M'
		},
		{
			value: 2250000,
			label: '$2.25M'
		},
		{
			value: 2500000,
			label: '$2.5M'
		},
		{
			value: 2750000,
			label: '$2.75'
		},
		{
			value: 3000000,
			label: '$3M'
		},
		{
			value: 3250000,
			label: '$3.25M'
		},
		{
			value: 3500000,
			label: '$3.5M'
		},
		{
			value: 3750000,
			label: '$3.75M'
		},
		{
			value: 4000000,
			label: '$4M'
		},
		{
			value: 4250000,
			label: '$4.25M'
		},
		{
			value: 4500000,
			label: '$4.5M'
		},
		{
			value: 4750000,
			label: '$4.75M'
		},
		{
			value: 5000000,
			label: '$5M'
		},
		{
			value: 6000000,
			label: '$6M'
		},
		{
			value: 7000000,
			label: '$7M'
		},
		{
			value: 8000000,
			label: '$8M'
		},
		{
			value: 9000000,
			label: '$9M'
		},
		{
			value: 10000000,
			label: '$10M'
		}
	],
	maxPrice: [
		{
			value: 'undefined',
			label: 'No Max'
		},
		{
			value: 50000,
			label: '$50K'
		},
		{
			value: 75000,
			label: '$75K'
		},
		{
			value: 100000,
			label: '$100K'
		},
		{
			value: 125000,
			label: '$125K'
		},
		{
			value: 150000,
			label: '$150K'
		},
		{
			value: 175000,
			label: '$175K'
		},
		{
			value: 200000,
			label: '$200K'
		},
		{
			value: 250000,
			label: '$250K'
		},
		{
			value: 275000,
			label: '$275K'
		},
		{
			value: 300000,
			label: '$300K'
		},
		{
			value: 325000,
			label: '$325K'
		},
		{
			value: 350000,
			label: '$350K'
		},
		{
			value: 375000,
			label: '$375K'
		},
		{
			value: 400000,
			label: '$400K'
		},
		{
			value: 425000,
			label: '$425K'
		},
		{
			value: 450000,
			label: '$450K'
		},
		{
			value: 475000,
			label: '$475K'
		},
		{
			value: 500000,
			label: '$500K'
		},
		{
			value: 550000,
			label: '$550K'
		},
		{
			value: 600000,
			label: '$600K'
		},
		{
			value: 650000,
			label: '$650K'
		},
		{
			value: 700000,
			label: '$700K'
		},
		{
			value: 750000,
			label: '$750K'
		},
		{
			value: 800000,
			label: '$800K'
		},
		{
			value: 850000,
			label: '$850K'
		},
		{
			value: 900000,
			label: '$900K'
		},
		{
			value: 950000,
			label: '$950K'
		},
		{
			value: 1000000,
			label: '$1M'
		},
		{
			value: 1250000,
			label: '$1.25M'
		},
		{
			value: 1500000,
			label: '$1.5M'
		},
		{
			value: 1750000,
			label: '$1.75M'
		},
		{
			value: 2000000,
			label: '$2M'
		},
		{
			value: 2250000,
			label: '$2.25M'
		},
		{
			value: 2500000,
			label: '$2.5M'
		},
		{
			value: 2750000,
			label: '$2.75'
		},
		{
			value: 3000000,
			label: '$3M'
		},
		{
			value: 3250000,
			label: '$3.25M'
		},
		{
			value: 3500000,
			label: '$3.5M'
		},
		{
			value: 3750000,
			label: '$3.75M'
		},
		{
			value: 4000000,
			label: '$4M'
		},
		{
			value: 4250000,
			label: '$4.25M'
		},
		{
			value: 4500000,
			label: '$4.5M'
		},
		{
			value: 4750000,
			label: '$4.75M'
		},
		{
			value: 5000000,
			label: '$5M'
		},
		{
			value: 6000000,
			label: '$6M'
		},
		{
			value: 7000000,
			label: '$7M'
		},
		{
			value: 8000000,
			label: '$8M'
		},
		{
			value: 9000000,
			label: '$9M'
		},
		{
			value: 10000000,
			label: '$10M'
		}
	],
	beds: [
		{
			value: 'undefined',
			label: '0+'
		},
		{
			value: '1',
			label: '1+'
		},
		{
			value: '2',
			label: '2+'
		},
		{
			value: '3',
			label: '3+'
		},
		{
			value: '4',
			label: '4+'
		},
		{
			value: '5',
			label: '5+'
		},
		{
			value: '6',
			label: '6+'
		}
	],
	baths: [
		{
			value: 'undefined',
			label: '0+'
		},
		{
			value: '1',
			label: '1+'
		},
		{
			value: '2',
			label: '2+'
		},
		{
			value: '3',
			label: '3+'
		},
		{
			value: '4',
			label: '4+'
		},
		{
			value: '5',
			label: '5+'
		},
		{
			value: '6',
			label: '6+'
		}
	],
	yearBuilt: (function generateYearBuilt() {
		const startYear = 1900;
		const currentYear = new Date().getFullYear();
		return [
			{
				value: 'undefined',
				label: 'Any'
			}
		].concat(
			Array((new Date()).getFullYear() - startYear + 1).fill(0).map((value, index) => {
				return {
					value: currentYear - index,
					label: currentYear - index
				};
			})
		);
	}()),
	timeOnMarket: [
		{
			value: '0',
			label: 'Any'
		},
		{
			value: 1,
			label: '1 day'
		},
		{
			value: 7,
			label: '1 week'
		},
		{
			value: 14,
			label: '2 weeks'
		},
		{
			value: 30,
			label: '1 month'
		},
		{
			value: 60,
			label: '2 months'
		},
		{
			value: 90,
			label: '3 months'
		},
		{
			value: 180,
			label: '6 months'
		},
		{
			value: 365,
			label: '12 months'
		}
	]
};
export default {
	SortDirection,
	StoreDebounceRate,
	ActionTypes,
	ServerStatuses,
	EditMode,
	HOST
};
