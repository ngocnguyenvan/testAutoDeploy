'use-strict';

import { default as React, Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Avatar } from 'material-ui';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class AmenityIcon extends Component {

	static propTypes = {
		value: PropTypes.string.isRequired,
		label: PropTypes.string,
		active: PropTypes.bool,
		handleChange: PropTypes.func,
		className: PropTypes.string
	};

	render() {
		return (
			<div className={classNames('amenity-icon', this.props.className)} >
				{this.props.handleChange ?
					<div
						className={classNames({ active: this.props.active }, 'icon')}
						onClick={() => {
							this.props.handleChange(this.props.active, this.props.value);
						}}
						style={{ backgroundImage: 'url(' + this.props.icon + ')'}}

					>
					</div>
					:
					<div
						style={{ backgroundImage: 'url(' + this.props.icon + ')'}}
						className={classNames('active', 'icon')}
					></div>
				}
				<span className="amenity-label" >{this.props.label}</span>
			</div>
		);
	}

}
