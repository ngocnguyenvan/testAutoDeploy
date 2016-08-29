'use strict';

import React from 'react';
import FontAwesome from 'react-fontawesome';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class ListingItem extends React.Component {

	static propTypes = {
		listing: React.PropTypes.object,
		selected: React.PropTypes.bool,
		onChange: React.PropTypes.func
	};

	constructor(props) {
		super(props);
		this.select = this.select.bind(this);
		this.state = {
			selected: false
		};
	}

	componentWillMount() {
		if (this.props.selected) {
			this.setState(
				{ selected: true }
			);
		}
	}
	select() {
		this.props.onChange(this.props.listing.id);
		this.setState(
			{ selected: !this.state.selected }
		);
	}

	render() {
		return (
			<div className="ylo-left">
				<div className="ylo-img-div">
					<img src={this.props.listing.mainPhotoLarge}/>
				</div>
				<div className="ylo-hover">

				</div>
				<div className="ylo-selected" style={{ display: this.state.selected ? 'block' : 'none' }}>
					<h2>SELECTED</h2>
				</div>
				<div className="ylo-hover-content">
					<a className="ylo-link" onClick={this.select}>
						<FontAwesome name="key" className="ylo-hover-content-img"/>
						<p className="paragraph">Select</p>
					</a>
					<a href={'http://portal.ylopo.com/listing-detail/' + this.props.listing.id} target="_blank"
					    className="ylo-link">
						<FontAwesome name="eye" className="ylo-hover-content-img"/>
						<p>View Details</p>
					</a>

				</div>
				<p className="ylo-many">{this.props.listing.formattedPrice}</p>
				<div className="ylo-title">
					<span> {this.props.listing.address.fullStreetAddress}</span><br/>
					{this.props.listing.address.city + ',' +
					this.props.listing.address.postalCode + ' ' +
					this.props.listing.address.stateOrProvince}
				</div>
				<ul className="ylo-list">
					<li>
						<img src="/assets/images/bed-icon-gray-med.png"/> {this.props.listing.bedrooms} Beds
					</li>
					<li>
						<img src="/assets/images/bath-icon-gray-med.png"/> {this.props.listing.bathrooms} Baths
					</li>
					<li>
						<img src="/assets/images/sqft-icon-gray.png"/> Sqft: {this.props.listing.livingAreaSqFt}
					</li>
				</ul>
			</div>
		);
	}
}
