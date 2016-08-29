'use strict';

import { merge } from 'lodash';
import React from 'react';
import CheckboxOriginal from 'material-ui/Checkbox';

class Checkbox extends React.Component {
	render() {
		var props = merge({}, this.props, {
			iconStyle: {
				width: 25,
				height: 25
			},
			labelStyle: {
				width: 'auto',
				float: 'none',
				whiteSpace: 'normal'
			}
		});

		return <CheckboxOriginal
			checkedIcon={<img src={ process.env.BROWSER ? require('../../../assets/images/core/checkbox-checked.png') : '' } />}
			uncheckedIcon={<img src={ process.env.BROWSER ? require('../../../assets/images/core/checkbox-unchecked.png') : '' } />}
			{...props} />;
	}
}

export default Checkbox;
