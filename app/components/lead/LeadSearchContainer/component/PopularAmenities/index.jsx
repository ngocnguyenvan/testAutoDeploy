'use strict';

import { default as React, PropTypes, Component } from 'react';
import AmenityIcon from '../AmenityIcon';
import classNames from 'classnames';
import { filter, cloneDeep } from 'lodash';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class PopularAmenities extends Component {

	static propTypes = {
		setValue: PropTypes.func.isRequired,
		value: PropTypes.object,
		classes: PropTypes.string,
		label: PropTypes.string,
		options: PropTypes.array.isRequired
	};
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.state = ({
			search: this.props.value
		});
	}
	componentDidUpdate(prevProps, prevState) {
		if (this.props.value !== prevProps.value) {
			this.setState({
				search: this.props.value
			});
		}
	}
	handleChange(active, value) {
		if (!active) {
			let search = cloneDeep(this.state.search);
			search[value] = true;
			this.setState({
				search: search
			});
			this.props.setValue({
				[value]: true
			});
		}
		else {
			let search = cloneDeep(this.state.search);
			delete search[value];
			this.setState({
				search: search
			});
			delete this.props.value[value];
		}
	}

	render() {
		return (
			<div className={classNames(this.props.classes, 'popular-amenities')} >
				<div className="section" >
					<h3>{this.props.label}</h3>
					<div className="amenities-wrapper" >
						{ this.props.options.map((amenity) => {
							return (
								<AmenityIcon
									key={amenity.apiKey}
									icon={amenity.amenitiesSearchIconUrl}
									value={amenity.apiKey}
									active={this.state.search[amenity.apiKey]}
									label={amenity.label}
									handleChange={this.handleChange}
								/>
							);
						})}
					</div>
				</div>
			</div>
		);
	}
}
