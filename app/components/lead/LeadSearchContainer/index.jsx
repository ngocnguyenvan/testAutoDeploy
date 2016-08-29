'use strict';

import React, { PropTypes } from 'react';
import classNames from 'classnames';
import objectPath from 'object-path';
import PriceInput from './component/PriceInput';
import BedsBathsInput from './component/BedsBathsInput';
import YearBuiltInput from './component/YearBuiltInput';
import DaysOnMarketInput from './component/DaysOnMarketInput';
import PopularAmenities from './component/PopularAmenities';
import PropertyTypesComponent from './component/PropertyTypesComponent';
import SearchFeaturedBlock from './component/SearchFeaturedBlock';
import SquareFeetInput from './component/SquareFeetInput';
import { get } from '../../../utils/api';
import Button from '../../../components/core/Button';
import { Validators } from '../../../utils/formUtil';
import FormFieldsMaterial from '../../../components/input/FormFieldsMaterial';
import { isEmpty, merge, reduce, isUndefined, cloneDeep } from 'lodash';
import { generateSearchSummary } from '../../../utils/listingUtil';
import history from '../../../../app/history';

if (process.env.BROWSER) {
	require('./styles.less');
}
var fieldSearch = [
	{
		type: 'composite',
		fields: [
			{
				type: 'custom',
				render: function(field, additionalProps) {
					return <div>Map Search</div>;
				},
				conditionalDisplay: function(search, field) {
					return !isEmpty(objectPath.get(search, "s_bbox"));
				}
			},
			{
				type: 'searchTagsText',
				name: 'search',
				attribute: 's_locations',
				placeholder: 'Search',
				title: 'Search',
				validators: [
					function validatorRequiredLocations(value, search) {
						if (isEmpty(objectPath.get(search, "s_locations"))) {
							validatorRequiredLocations.errorText = 'Field is required.';
						}
						else {
							validatorRequiredLocations.errorText = undefined;
						}
						return !isEmpty(objectPath.get(search, "s_locations"));
					}
				],
				conditionalDisplay: function(search, field) {
					return isEmpty(objectPath.get(search, "s_bbox"));
				},
				wrapperStyle: {
					marginTop: '-9px'
				}
			}
		]

	}
];
export default class LeadSearchContainer extends React.Component {

	static propTypes = {
		lead: PropTypes.object,
		onSearch: PropTypes.func,
		partyId: React.PropTypes.number,
		search: React.PropTypes.object,
		saveListId: React.PropTypes.number,
		selectedListingIds: React.PropTypes.array
	};
	constructor(props) {
		super(props);
		this.toggleFeatured = this.toggleFeatured.bind(this);
		this.runSearch = this.runSearch.bind(this);
		this.loadAmenitiesList = this.loadAmenitiesList.bind(this);
		this.setSearchValue = this.setSearchValue.bind(this);
		this.getState = this.getState.bind(this);
		this.backToLeadDetail = this.backToLeadDetail.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.state = Object.assign({}, this.state, {
			featuredToggled: false,
			amenitiExterior: [],
			amenitiInterior: [],
			amenitiFeatured: [],
			displayErrors: {
				location: false,
				price: false,
				year: false,
				square: {
					min: false,
					max: false
				}
			},
			isDirty: false,
			search: {
				s_type: ['house', 'condo'],
				s_cat: "Purchase",
				s_da: "t"
			},
			searchSummary: '',
			errorText: {
				price: "Price Max must be greater than Price Min.",
				year: "Year Built Max must be greater than Year Built Min.",
				square: {
					min: '',
					max: ''
				}
			}
		});
	}
	componentWillMount() {
		this.setState({
			search: this.props.search,
			searchSummary: generateSearchSummary(this.props.search, {})
		});
		if (!isEmpty(this.props.lead) && this.props.lead.partyId > 0) {
			this.loadAmenitiesList(this.props.lead.partyId);
		}
	}
	componentDidUpdate(prevProps, prevState) {
		if ( this.state.search !== prevState.search ) {
			this.setState({
				searchSummary: generateSearchSummary(this.getState().search, {})
			});
		}
	}
	setSearchValue(attributes, executeSearch = false) {
		const currentComponentSearch = this.state.search; // local search state
		const currentAppSearch = this.getState().search; // store search state
		const nextSearch = this.createSearchState(currentComponentSearch, attributes);
		var displayErrors = objectPath.get( this.state, 'displayErrors' );
		var errorText = objectPath.get( this.state, 'errorText' );

		if (!isUndefined(nextSearch.s_price_min) && !isUndefined(nextSearch.s_price_max) && parseFloat(nextSearch.s_price_min) > parseFloat(nextSearch.s_price_max)) {
			objectPath.set(displayErrors, 'price', true);
		}
		else {
			objectPath.set(displayErrors, 'price', false);
		}
		if ( !isUndefined(nextSearch.s_year_min) && !isUndefined(nextSearch.s_year_max) && parseFloat(nextSearch.s_year_min) > parseFloat(nextSearch.s_year_max)) {
			objectPath.set(displayErrors, 'year', true);
		}
		else {
			objectPath.set(displayErrors, 'year', false);
		}
		if (!isUndefined(nextSearch.s_sqft_min) && isNaN(nextSearch.s_sqft_min)) {
			objectPath.set(displayErrors, 'square.min', true);
			objectPath.set(errorText, 'square.min', "Square Feet Min must be a Number.");
		}
		else {
			objectPath.set(displayErrors, 'square.min', false);
			objectPath.set(errorText, 'square.min', "");
		}
		if (!isUndefined(nextSearch.s_sqft_max) && isNaN(nextSearch.s_sqft_max)) {
			objectPath.set(displayErrors, 'square.max', true);
			objectPath.set(errorText, 'square.max', "Square Feet Max must be a Number.");
		}
		else if (!isUndefined(nextSearch.s_sqft_max) && !isNaN(nextSearch.s_sqft_min) && parseFloat(nextSearch.s_sqft_min) > parseFloat(nextSearch.s_sqft_max)) {
			objectPath.set(displayErrors, 'square.max', true);
			objectPath.set(errorText, 'square.max', "Square Feet Max must be greater than Square Feet Min.");
		}
		else {
			objectPath.set(displayErrors, 'square.max', false);
			objectPath.set(errorText, 'square.max', "");
		}
		this.setState(
			{
				displayErrors: displayErrors,
				errorText: errorText,
				search: nextSearch
			}
		);
	}
	createSearchState(currentComponentSearch, attributes = {}) {
		const search = Object.assign({}, currentComponentSearch, attributes);
		Object
			.keys(attributes)
			.forEach((key) => {
				const currentAttribute = attributes[key];
				if (!currentAttribute || currentAttribute === 'undefined') {
					delete search[key];
				} else if (Array.isArray(currentAttribute) && isEmpty(currentAttribute)) {
					delete search[key];
				}
			});
		return search;
	}
	getState() {
		return reduce(
			this.state,
			(returnState, current, key) => {
				if (key === 'search') {
					return Object.assign({}, returnState, { [key]: merge({}, current) });
				}
				return Object.assign({}, returnState, { [key]: current });
			},
			{}
		);
	}
	loadAmenitiesList(partyId) {
		return get(`/party-website/byPartyId/${partyId}`)
			.then((amenities) => {
				const homeFeaturesArray = amenities.advancedSearchConfig;
				const featured = [];
				const interior = [];
				const exterior = [];
				homeFeaturesArray.forEach((feature) => {
					if (feature.featured) {
						featured.push(feature);
					}
					if (feature.displayGrouping === 'INTERIOR') {
						interior.push(feature);
					} else if (feature.displayGrouping === 'EXTERIOR') {
						exterior.push(feature);
					}
				});
				this.setState({
					amenitiExterior: exterior,
					amenitiInterior: interior,
					amenitiFeatured: featured
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}
	toggleFeatured() {
		this.setState({
			featuredToggled: !this.state.featuredToggled
		});
	}
	backToLeadDetail() {
		history.push(`/lead-detail/${this.props.lead.uuid}`);
	}
	runSearch() {
		this.executeSearch();
	}
	onSearch() {
		if (isEmpty(this.state.search.s_locations)) {
			let errorsUpdate = objectPath.get(this.state, "displayErrors");
			objectPath.set(errorsUpdate, "location", true);
			this.setState({
				displayErrors: errorsUpdate
			});
		}
		else if ( !this.state.displayErrors.square.min && !this.state.displayErrors.square.max &&
			!this.state.displayErrors.year && !this.state.displayErrors.price) {
			let searchUpdate = objectPath.get(this.state, 'search');
			searchUpdate.s_locations = JSON.stringify(searchUpdate.s_locations);
			this.props.onSearch(searchUpdate, this.props.saveListId, this.props.saveName, this.props.selectedListingIds);
		}
	}
	render() {
		const {className} = this.props;
		const classes = classNames(
			'advanced-search-container',
			'clearfix',
			className
		);
		const featured = this.state.amenitiFeatured;
		const interior = this.state.amenitiInterior;
		const exterior = this.state.amenitiExterior;
		let homeFeaturesArray = false;
		if( this.state.amenitiFeatured.length > 0 &&
			( this.state.amenitiInterior.length > 0 || this.state.amenitiExterior.length > 0 )) {
			homeFeaturesArray = true;
		}

		return (
			<div className={classes}>
				<div className="header-search-bin">
					<div className="header-search-input">
						<div className="header-results-description">
							{this.state.searchSummary}
						</div>
					</div>

					<div className="header-save-search-button">
						<Button

							className={classNames('main-search-button')}
							label="See Listings"
							onClick={this.onSearch}
						/>
					</div>
					<div className="header-save-search-button">
						<Button
							className="main-search-button"
							label="Back To Lead Detail"
							onClick={this.backToLeadDetail}
						/>
					</div>
				</div>

				<div className={classNames({ active: this.state.searchToggled }, 'advanced-search-slideout')} >
					<div className="advanced-search" >
						<div className="advanced-search-form-wrapper" >
								<div className="form-field full-field">
									<div className="title-search">Area Search</div>
									<FormFieldsMaterial
										editMode={true}
										fields={fieldSearch}
										object={this.state.search}
										displayErrors={this.state.displayErrors.location}
										onChange={this.setSearchValue}
									/>
								</div>
								<PriceInput
									classes="form-field half-field"
									setValue={this.setSearchValue}
									defaultValue={{
										minPrice: objectPath.get(this, 'state.search.s_price_min'),
										maxPrice: objectPath.get(this, 'state.search.s_price_max')
									}}
									displayErrors={this.state.displayErrors.price}
									errorText={this.state.errorText.price}
								/>
								<BedsBathsInput
									classes="form-field half-field"
									setValue={this.setSearchValue}
									defaultValue={{
										minBeds: objectPath.get(this, 'state.search.s_beds'),
										minBaths: objectPath.get(this, 'state.search.s_baths')
									}}
								/>
								<SquareFeetInput
									classes="form-field half-field"
									setValue={this.setSearchValue}
									defaultValue={{
										sqftMin: objectPath.get(this, 'state.search.s_sqft_min'),
										sqftMax: objectPath.get(this, 'state.search.s_sqft_max')
									}}
									displayErrors={this.state.displayErrors.square}
									errorText={this.state.errorText.square}

								/>
								<YearBuiltInput
									classes="form-field half-field"
									setValue={this.setSearchValue}
									defaultValue={{
										yearMin: objectPath.get(this, 'state.search.s_year_min'),
										yearMax: objectPath.get(this, 'state.search.s_year_max')
									}}
									displayErrors={this.state.displayErrors.year}
									errorText={this.state.errorText.year}
								/>
								<PropertyTypesComponent
									className="form-field full-field"
									setValue={this.setSearchValue}
									defaultValue={objectPath.get(this, 'state.search.s_type')}
								/>
								<DaysOnMarketInput
									className="form-field half-field"
									label="Days on Market"
									setValue={this.setSearchValue}
									defaultValue={objectPath.get(this, 'state.search.s_age_days_max')}
								/>
								{ homeFeaturesArray &&
									<div className="featured-wrapper">
									<div className={classNames({ toggled: this.state.featuredToggled }, 'featured-toggle')}>
										{ featured.length > 0 &&
											<PopularAmenities
												classes="form-field full-field featured"
												value={objectPath.get(this, 'state.search')}
												label={'Most Popular Amenities'}
												options={featured}
												setValue={this.setSearchValue}
											/>
										}
										{ (interior.length > 0 || exterior.length > 0) &&
											<div className="form-field full-field all-amenities">
												<h3>All Amenities</h3>
												{ interior.length > 0 &&
													<SearchFeaturedBlock
														classes="featured"
														value={objectPath.get(this, 'state.search')}
														label="Interior Features"
														options={interior}
														setValue={this.setSearchValue}
													/>
												}
												{ exterior.length > 0 &&
													<SearchFeaturedBlock
														display-if={exterior}
														classes="featured"
														value={objectPath.get(this, 'state.search')}
														label="Exterior Features"
														options={exterior}
														setValue={this.setSearchValue}
													/>
												}
											</div>
										}
									</div>
										{ featured.length > 0 && (interior.length > 0 || exterior.length > 0) &&
											<div className={classNames({ toggled: this.state.featuredToggled }, 'toggle-featured-button')}
												onClick={this.toggleFeatured}
											>
												{this.state.featuredToggled ? 'Back to Popular Amenities' : 'View All Amenities'}
											</div>
										}
								</div>
								}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
