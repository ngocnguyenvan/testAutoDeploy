'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import update from 'react-addons-update';
import objectPath from 'object-path';
import moment from 'moment';
import { isEmpty, indexOf } from 'lodash';
import { Validators, ValueFormatters } from '../../../utils/formUtil';
import { ServerStatuses, SearchDefaults } from '../../../Constants';
import { SearchAlertType } from '@ylopo/models-constants';
import { get, post, del } from '../../../utils/api';
import Loader from '../../../components/core/Loader';
import MessageBin from '../../../components/core/MessageBin';
import FormFieldsMaterial from '../../../components/input/FormFieldsMaterial';
import Button from '../../../components/core/Button';
import Checkbox from '../../../components/core/Checkbox';
import Paper from 'material-ui/Paper';
import SelectFieldClassic from '../../../components/core/SelectFieldClassic';
import MenuItem from 'material-ui/MenuItem';
import classNames from 'classnames';

import { compositeContainer } from '../../../styles/material-ui-theme';

if (process.env.BROWSER) {
	require('./styles.less');
}

var searchFields = [
	{
		type: 'composite',
		label: 'Label:',
		fields: [
			{
				autoFocus: true,
				type: 'textbox',
				name: 'label',
				attribute: 'label',
				placeholder: 'Label',
				title: 'Label',
				style: {
					width: '100%'
				}
			}
		]
	},
	{
		type: 'composite',
		label: 'Area Search:',
		fields: [
			{
				type: 'custom',
				render: function(field, additionalProps) {
					return <div>Map Search</div>;
				},
				conditionalDisplay: function(search, field) {
					return !isEmpty(objectPath.get(search, "params.s_bbox"));
				}
			},
			{
				type: 'searchTagsText',
				name: 'search',
				attribute: 'params.s_locations',
				placeholder: 'Search',
				title: 'Search',
				validators: [
					function validatorRequiredLocations( value, search ) {
						validatorRequiredLocations.errorText = Validators.required.errorText;

						if (!isEmpty(objectPath.get(search, "params.s_bbox"))) {
							return true;
						}
						return Validators.required(value, search);
					}
				],
				conditionalDisplay: function(search, field) {
					return isEmpty(objectPath.get(search, "params.s_bbox"));
				},
				wrapperStyle: {
					marginTop: '-9px'
				}
			}
		]
	},
	{
		type: 'composite',
		label: 'Property Types:',
		fields: [
			{
				type: 'checkbox-list',
				attribute: 'params.s_type[]',
				wrapperStyle: {
					marginBottom: 32
				},
				optionKey: 'id',
				optionLabel: 'label',
				optionStyle: {
					width: 'auto',
					float: 'left',
					paddingRight: 34,
					fontSize: 18
				},
				optionList: [
					{
						id: 'house',
						label: 'Single Family'
					},
					{
						id: 'condo',
						label: 'Condos'
					},
					{
						id: 'apt',
						label: 'Apartments'
					},
					{
						id: 'land',
						label: 'Land'
					}
				]
			},
			{
				type: 'textbox',
				name: 'priceMin',
				attribute: 'params.s_price_min',
				placeholder: 'Price Min',
				title: 'Price Min',
				icon: <img style={ { paddingTop: 2 }}
						   src={ process.env.BROWSER ? require('../../../assets/images/price-icon-input.png') : '' }/>,
				validators: [Validators.numberWithCommas, Validators.positive],
				wrapperStyle: {
					display: 'inline-block',
					width: 'calc(50% - 10px)',
					marginRight: 20,
					minWidth: 175
				},
				style: {
					width: '100%'
				}
			},
			{
				type: 'textbox',
				name: 'priceMax',
				attribute: 'params.s_price_max',
				placeholder: 'Price Max',
				title: 'Price Max',
				icon: <img style={ { paddingTop: 2 }}
						   src={ process.env.BROWSER ? require('../../../assets/images/price-icon-input.png') : '' }/>,
				validators: [
					Validators.numberWithCommas,
					Validators.positive,
					function validator(value, search) {
						validator.errorText = 'Price Max must be greater than Price Min';

						if (value === null || typeof value === 'undefined') {
							return true;
						}

						if (isNaN(value) && typeof value === 'string') {
							value = value.replace(/,/g, '');
						}
						if (isNaN(value) || value === '' || value === undefined) {
							return true;
						}
						value = Number(value) || 0;
						var priceMin = objectPath.get(search, 'params.s_price_min');
						if (isNaN(priceMin) && typeof priceMin === 'string') {
							priceMin = priceMin.replace(/,/g, '');
						}
						priceMin = Number(priceMin) || 0;
						return value >= priceMin;
					}],
				wrapperStyle: {
					display: 'inline-block',
					width: 'calc(50% - 10px)',
					minWidth: 175
				},
				style: {
					width: '100%',
					height: 50
				}
			},
			{
				type: 'select-classic',
				name: 'bedrooms',
				attribute: 'params.s_beds',
				placeholder: 'Bedrooms',
				title: 'Bedrooms',
				icon: <img src={ process.env.BROWSER ? require('../../../assets/images/bed-icon-input.png') : '' }/>,
				optionKey: 'id',
				optionLabel: 'label',
				optionList: () => {
					var options = [];
					for (var i = 0; i < 10; i++) {
						options.push({
							id: i,
							label: String(i) + '+'
						});
					}
					return options;
				},
				wrapperStyle: {
					display: 'inline-block',
					width: 'calc(33% - 13px)',
					verticalAlign: 'top',
					marginRight: 20,
					minWidth: 175
				},
				style: {
					width: '100%',
					height: 50
				}
			},
			{
				type: 'select-classic',
				name: 'baths',
				attribute: 'params.s_baths',
				placeholder: 'Baths',
				title: 'Baths',
				icon: <img src={ process.env.BROWSER ? require('../../../assets/images/bath-icon-input.png') : '' }/>,
				optionKey: 'id',
				optionLabel: 'label',
				optionList: () => {
					var options = [];
					for (var i = 0; i < 10; i++) {
						options.push({
							id: i,
							label: String(i) + '+'
						});
					}
					return options;
				},
				wrapperStyle: {
					display: 'inline-block',
					width: 'calc(33% - 13px)',
					verticalAlign: 'top',
					marginRight: 20,
					minWidth: 175
				},
				style: {
					width: '100%'
				}
			},
			{
				type: 'textbox',
				name: 's_sqftMin',
				attribute: 'params.s_sqft_min',
				placeholder: 'Sqft Min',
				title: 'Sqft Min',
				icon: <img style={{ paddingTop: 5 }}
						   src={ process.env.BROWSER ? require('../../../assets/images/sqft-icon-input.png') : '' }/>,
				valueFormatter: ValueFormatters.number,
				validators: [Validators.number, Validators.positive],
				wrapperStyle: {
					display: 'inline-block',
					width: 'calc(33% - 14px)',
					verticalAlign: 'top',
					minWidth: 175
				},
				style: {
					width: '100%'
				}
			}
		]
	}
];
export default class LeadSearchDetails extends React.Component {

	static propTypes = {
		leadId: React.PropTypes.number,
		leadUuid: React.PropTypes.string,
		search: React.PropTypes.object,
		searchId: React.PropTypes.number,
		onUpdated: React.PropTypes.func,
		onDeleted: React.PropTypes.func,
		saveButtonVisible: React.PropTypes.bool,
		deleteButtonVisible: React.PropTypes.bool,
		partyId: React.PropTypes.number
	};

	static defaultProps = {
		saveButtonVisible: true,
		deleteButtonVisible: false
	};

	constructor(props) {
		super(props);
		this.loadSearch = this.loadSearch.bind(this);
		this.afterSearchLoaded = this.afterSearchLoaded.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
		this.isValid = this.isValid.bind(this);
		this.deleteSearch = this.deleteSearch.bind(this);
		this.fieldChanged = this.fieldChanged.bind(this);
		this.renderAlertSettings = this.renderAlertSettings.bind(this);
		this.loadAmenitiesList = this.loadAmenitiesList.bind(this);
		this.renderAmenities = this.renderAmenities.bind(this);
		this.changeAmenities = this.changeAmenities.bind(this);
		this.handlePhotosAvailables = this.handlePhotosAvailables.bind(this);
		this.handleOpenHouse = this.handleOpenHouse.bind(this);
		this.handleDayOnMarket = this.handleDayOnMarket.bind(this);
		this.enqueueAlert = this.enqueueAlert.bind(this);
		this.toggleFeatured = this.toggleFeatured.bind(this);
		this.changeAmenitiesInPopular = this.changeAmenitiesInPopular.bind(this);
		this.state = {
			search: {
				params: {}
			},
			searchAlertsSettings: {
				types: [],
				intervalHours: 24
			},
			newParams: {},
			displayErrors: false,
			serverStatus: ServerStatuses.READY,
			serverMessage: undefined,
			amenitiExterior: [],
			amenitiInterior: [],
			amenitiFeatured: [],
			featuredToggled: false,
		};
	}

	componentDidMount() {

	}

	componentWillMount() {
		if (!isEmpty(this.props.search)) {
			this.afterSearchLoaded(this.props.search);
		}
		if (this.props.searchId) {
			this.loadSearch();
		}
		if (this.props.partyId) {
			this.loadAmenitiesList(this.props.partyId);
		}
	}

	componentWillReceiveProps(nextProps) {
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.partyId !== prevProps.partyId) {
			this.loadAmenitiesList(this.props.partyId);
		}
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
					}
					else if (feature.displayGrouping === 'EXTERIOR') {
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

	loadSearch() {
		var leadId = this.props.leadId;
		var leadUuid = this.props.leadUuid;
		var searchId = this.props.searchId;
		if (!searchId) {
			return Promise.resolve();
		}

		var url = null;
		if (leadId) {
			url = `/lead/${ leadId }/search/${ searchId }`;
		}
		else if (leadUuid) {
			url = `/open/${ leadUuid }/search/${ searchId }`;
		}

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		});

		return get(url)
			.then((search) => {
				// Converting from old format
				/* eslint-disable camelcase */

				if (search.params && (search.params.s_city || search.params.s_state || search.params.s_zip)) {
					if (!search.params.s_locations) {
						search.params.s_locations = [];
					}
					var locationObj = {};
					if (search.params.s_city) {
						locationObj.city = search.params.s_city;
						delete search.params.s_city;
					}
					if (search.params.s_state) {
						locationObj.state = search.params.s_state;
						delete search.params.s_state;
					}
					if (search.params.s_zip) {
						locationObj.zip = search.params.s_zip;
						delete search.params.s_zip;
					}

					search.params.s_locations.push(locationObj);
				}
				/* eslint-enable camelcase */
				return search;
			})
			.then((search) => {
				this.afterSearchLoaded(search);
			})
			.then(() => {
				this.setState({
					serverStatus: ServerStatuses.READY
				});
			})
			.catch((error) => {
				this.setState({
					serverMessage: error.errorMessage || error,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	afterSearchLoaded(search) {
		var modifiedState = {
			search: search
		};
		if (!isEmpty(search.searchAlerts)) {
			var searchAlert = search.searchAlerts[0];

			modifiedState.searchAlertsSettings = {
				intervalHours: searchAlert.intervalHours,
				types: !searchAlert.optOutDate ? [searchAlert.type] : []
			};
		}

		this.setState(modifiedState);
	}

	updateSearch(leadId, leadUuid, searchId) {
		var isNew = !searchId;
		var formComponent = this.refs.form;
		var object = formComponent.getFieldsStateObject();

		if (formComponent.isValid()) {
			this.setState({
				serverStatus: ServerStatuses.PROCESSING
			});

			var baseUrl = null;
			if (leadId) {
				baseUrl = `/lead/${ leadId }`;
			}
			else if (leadUuid) {
				baseUrl = `/open/${ leadUuid }`;
			}

			return Promise.resolve()
				.then(() => {
					// Saved Search
					var objectChanges = {
						label: object.label,
						params: object.params
					};
					if (!isNew && isEmpty(objectChanges)) {
						return null;
					}
					// Params are updated all because mf-business-api don't support patch update for jsonb columns
					if (!isEmpty(objectChanges.params)) {
						objectPath.set(objectChanges, 'params', object.params);
					}

					// Converting s_price_min and s_price_max to Numbers
					/* eslint-disable camelcase */
					var priceMin = objectPath.get(objectChanges, 'params.s_price_min'),
						priceMax = objectPath.get(objectChanges, 'params.s_price_max');
					if (priceMin && isNaN(priceMin) && typeof priceMin === 'string') {
						objectPath.set(objectChanges, 'params.s_price_min', Number(priceMin.replace(/,/g, '')));
					}
					if (priceMax && isNaN(priceMax) && typeof priceMax === 'string') {
						objectPath.set(objectChanges, 'params.s_price_max', Number(priceMax.replace(/,/g, '')));
					}

					// Silently adding s_cat=Purchase
					if (objectPath.get(object, 'params.s_cat') !== 'Purchase') {
						if (isEmpty(objectChanges.params)) {
							objectChanges.params = object.params;
						}
						objectChanges.params.s_cat = 'Purchase';
					}
					/* eslint-enable camelcase */

					var url = `${baseUrl}/search`;
					if (!isNew) { // Update
						url += `/${searchId}`;
					}

					return post(url, {}, objectChanges);
				})
				.then((result) => {
					// Search Alerts
					if (isNew) {
						searchId = result.id;
					}
					var url = `${baseUrl}/search-alert/${searchId}`;

					if (isNew || isEmpty(objectPath.get(this.state, 'search.searchAlerts'))) {
						// Creatiing Search Alert
						if (!isEmpty(this.state.searchAlertsSettings.types)) {
							return post(url, {}, {
								id: searchId,
								savedSearchId: searchId,
								type: this.state.searchAlertsSettings.types[0],
								intervalHours: this.state.searchAlertsSettings.intervalHours
							});
						}
					}
					else {
						// Modifying Search Alert
						var searchAlertId = this.state.search.searchAlerts[0].id;
						url += `/${searchAlertId}`;

						if (!isEmpty(this.state.searchAlertsSettings.types)) {
							// Saving changes and enabling if it was disabled
							/* eslint-disable camelcase */
							return post(url, {}, {
								type: this.state.searchAlertsSettings.types[0],
								intervalHours: this.state.searchAlertsSettings.intervalHours,
								opt_out_date: null,
								opt_out_method: null
							});
							/* eslint-enable camelcase */
						}
						else if (!this.state.search.searchAlerts[0].optOutDate) {
							// Disabling Search Alert
							return del(url);
						}
					}
				})
				.then(() => {
					if (typeof this.props.onUpdated === 'function') {
						this.props.onUpdated(object);
					}
				})
				.catch((error) => {
					this.setState({
						serverMessage: error.errorMessage || error,
						serverStatus: ServerStatuses.FAIL
					}, () => {
						ReactDOM.findDOMNode(this).scrollIntoView();
					});
					return Promise.reject();
				});
		}
		else {
			this.setState({
				displayErrors: true
			});

			var components = formComponent.getComponentsWithErrors();
			var node = ReactDOM.findDOMNode(components[0]);
			node.scrollIntoView();
			return Promise.reject();
		}
	}

	isValid() {
		this.setState({
			displayErrors: true
		});
		return this.refs.form.isValid();
	}

	deleteSearch() {
		/* eslint-disable no-alert */
		if (!confirm('Are you sure?')) {
			return;
		}
		/* eslint-enable no-alert */
		var leadId = this.props.leadId;
		var leadUuid = this.props.leadUuid;
		var searchId = this.props.searchId;

		var url = null;
		if (leadId) {
			url = `/lead/${ leadId }/search/${ searchId }`;
		}
		else if (leadUuid) {
			url = `/open/${ leadUuid }/search/${ searchId }`;
		}

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		});

		del(url)
			.then(() => {
				if (typeof this.props.onDeleted === 'function') {
					this.props.onDeleted(searchId);
				}
			})
			.catch((error) => {
				this.setState({
					serverMessage: error.errorMessage || error,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	enqueueAlert() {
		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		});

		post(`/open/${this.props.leadUuid}/search-alert/${this.state.search.id}/${this.state.search.searchAlerts[0].id}/enqueue`)
			.then(() => {
				this.setState({
					serverMessage: 'Alert enqueued!',
					serverStatus: ServerStatuses.SUCCESS
				});
			})
			.catch(error => {
				this.setState({
					serverMessage: error.errorMessage || error,
					serverStatus: ServerStatuses.FAIL
				});
			});
	}

	fieldChanged(object, field) {
		if (this.state.serverStatus !== ServerStatuses.READY) {
			this.setState({
				search: object,
				serverStatus: ServerStatuses.READY
			});
		}
		else {
			this.setState({
				search: object
			});
		}
	}

	renderAlertSettings() {
		var optOutMessage = '';

		var hasSearchAlert = this.state.search && !isEmpty(this.state.search.searchAlerts);
		if (hasSearchAlert) {
			var alertOptOutMethod = this.state.search.searchAlerts[0].optOutMethod;

			if (alertOptOutMethod && alertOptOutMethod !== 'stars') {
				var alertOptOutDate = this.state.search.searchAlerts[0].optOutDate;
				if (alertOptOutDate) {
					optOutMessage = 'Lead opted out on ' + moment(alertOptOutDate).format('L');
				}
			}
		}

		return <Paper className="composite-container" zDepth={0} style={compositeContainer.style}>
			<div style={compositeContainer.labelStyle}>Listing Alert Settings</div>
			{optOutMessage &&
			<div className="field-group" style={{ paddingTop: 10, color: 'Orange' }}>
				{optOutMessage}
			</div>
			}
			<div className="field-group" style={{ paddingTop: 10 }}>
				<div style={{ float: 'left', marginLeft: 5, marginTop: 5, marginBottom: 20, width: 175 }}>
					Send alerts for:
				</div>
				<Checkbox label="New and Updated Listings" style={{ width: 'auto', minWidth: 175 }}
					value={SearchAlertType.NEW_OR_UPDATED.key}
					checked={indexOf(this.state.searchAlertsSettings.types, SearchAlertType.NEW_OR_UPDATED.key) !== -1}
					onCheck={(event) => {
					  var modifiedAlertsSettings = update(this.state.searchAlertsSettings, { types: event.target.checked ? { $push: [event.target.value] } : { $splice: [[this.state.searchAlertsSettings.types.indexOf(event.target.value), 1]] } });
					  this.setState({ searchAlertsSettings: modifiedAlertsSettings });
					}}
				/>
			</div>
			<div className="field-group">
				<div style={{ float: 'left', marginLeft: 5, marginTop: 5, marginBottom: 20, width: 175 }}>
					Frequency:
				</div>
				<SelectFieldClassic value={this.state.searchAlertsSettings.intervalHours}
									disabled={isEmpty(this.state.searchAlertsSettings.types)}
									wrapperStyle={{ display: 'inline-block' }}
									onChange={(event, index, value) => {
										var modifiedAlertsSettings = update(this.state.searchAlertsSettings, {
											intervalHours: { $set: value }
										});
										this.setState({ searchAlertsSettings: modifiedAlertsSettings });
									}}>
					<MenuItem value={24} primaryText="Daily"/>
					<MenuItem value={168} primaryText="Weekly"/>
				</SelectFieldClassic>
			</div>
			{
				process.env.NODE_ENV === 'development' &&
				<div className="field-group">
					<Button
						label="Enqueue Alert"
						large={true}
						className="actionButton"
						onClick={this.enqueueAlert}
						disabled={this.state.serverStatus === ServerStatuses.PROCESSING || !hasSearchAlert}
					/>
				</div>
			}

		</Paper>;
	}

	changeAmenities(e) {
		const values = e.target.value;
		if (isEmpty(this.state.search.params)) {
			this.state.search.params = {};
		}
		var newParams = this.state.search;
		if (e.target.checked) {
			newParams.params[values] = true;
		} else {
			// we want unselected to mean "we don't care", not "exclude those with this feature"
			delete newParams.params[values];
		}

		this.setState({
			search: newParams
		});
	}

	changeAmenitiesInPopular(apiKey) {
		if (isEmpty(this.state.search.params)) {
			this.state.search.params = {};
		}
		var newParams = this.state.search;
		if (newParams.params[apiKey]) {
			delete newParams.params[apiKey];
		} else {
			newParams.params[apiKey] = true;
		}
		this.setState({
			search: newParams
		});
	}

	toggleFeatured() {
		this.setState({
			featuredToggled: !this.state.featuredToggled
		});
	}

	handleOpenHouse() {
		if (isEmpty(this.state.search.params)) {
			this.state.search.params = {};
		}
		var search = this.state.search;
		if (search.params.s_open_house === null) {
			search.params.s_open_house = true;
		} else {
			search.params.s_open_house = !search.params.s_open_house;
		}
		this.setState({
			search: search
		});
	}

	handlePhotosAvailables() {
		if (isEmpty(this.state.search.params)) {
			this.state.search.params = {};
		}
		var search = this.state.search;
		if (search.params.s_photos_available === null) {
			search.params.s_photos_available = true;
		} else {
			search.params.s_photos_available = !search.params.s_photos_available;
		}
		this.setState({
			search: search
		});
	}

	handleDayOnMarket(event, index, value) {
		var search = this.state.search;

		// 'any' should remove the parameter entirely
		if (value) {
			search.params.s_age_days_max = value;
		} else {
			delete search.params.s_age_days_max;
		}

		this.setState({
			search: search
		});
	}

	renderAmenities() {
		if (this.state.amenitiExterior.length > 0) {
			var amenitiExterior = this.state.amenitiExterior.map(function (ameniti, index) {
				return (
					<Checkbox label={ameniti.label}
							  style={{ display: 'inline-block', marginBottom: 20, width: '33%', fontSize: 14 }}
							  value={ameniti.apiKey}
							  key={index}
							  checked={this.state.search.params[ameniti.apiKey]}
							  onCheck={this.changeAmenities}
					/>
				);
			}, this);
		}
		if (this.state.amenitiInterior.length > 0) {
			var amenitiInterior = this.state.amenitiInterior.map(function (ameniti, index) {
				return (
					<Checkbox label={ameniti.label}
							  style={{ display: 'inline-block', marginBottom: 20, width: '33%', fontSize: 14 }}
							  value={ameniti.apiKey}
							  key={index}
							  checked={this.state.search.params[ameniti.apiKey]}
							  onCheck={this.changeAmenities}
					/>
				);
			}, this);
		}
		if (this.state.amenitiFeatured.length > 0) {
			var featured = this.state.amenitiFeatured.map(function (ameniti, index) {
				return (
					<div className={classNames('amenity-icon')}>
						<div
							className={classNames('icon', { active: this.state.search.params[ameniti.apiKey] })}
							onClick={() => this.changeAmenitiesInPopular(ameniti.apiKey)}
							key={index}
							style={{ backgroundImage: 'url(' + ameniti.amenitiesSearchIconUrl + ')'}}
						>
						</div>
						<span className="amenity-label">{ameniti.label}</span>
					</div>
				);
			}, this);
		}
		return (
			( this.state.amenitiFeatured.length > 0 && ( this.state.amenitiInterior.length > 0 || this.state.amenitiExterior.length > 0 )) ?
				<Paper className="composite-container" zDepth={0} style={compositeContainer.style}>
					<div className={classNames({ toggled: this.state.featuredToggled }, 'featured-toggle')}>
						{ !this.state.featuredToggled && this.state.amenitiFeatured.length > 0 ?
							<div className={classNames('full-field featured', 'popular-amenities')}>
								<div className="section">
									<div className="head">Most Popular Amenities</div>
									<div className="amenities-wrapper">
										{featured}
									</div>
								</div>
							</div> : null
						}
						{ this.state.featuredToggled && (this.state.amenitiExterior.length > 0 || this.state.amenitiExterior.length > 0) ?
							<div className="full-field all-amenities">
								<div className="head">All Amenities</div>
								<div className="field-group" style={{ paddingTop: 10 }}>
									<div display-if={this.state.amenitiInterior.length > 0}
										 className="bordered-content-block featured">
										<h4>Interior Features</h4>
										<div className="content">
											{amenitiInterior}
										</div>
									</div>
									{ this.state.amenitiExterior.length > 0 ?
										<div className="bordered-content-block featured">
											<h4>Exterior Features</h4>
											<div className="content">
												{amenitiExterior}
											</div>
										</div> : null
									}
								</div>
							</div> : null
						}
					</div>
					{ this.state.amenitiFeatured.length > 0 &&
					( this.state.amenitiInterior.length > 0 || this.state.amenitiExterior.length > 0 ) ?
						<div className={classNames({ toggled: this.state.featuredToggled }, 'toggle-featured-button')}
							 onClick={this.toggleFeatured}>
							{
								this.state.featuredToggled ? 'Back to Popular Amenities' : 'View All Amenities'
							}
						</div> : null
					}
				</Paper> : null
		);
	}

	renderDayOnMarket() {
		var listTime = SearchDefaults.timeOnMarket.map(function (time, index) {
			return <MenuItem key={`${time.value}-${index}`} value={time.value} primaryText={time.label}/>;
		}, this);

		return <div className="form-field full-field show-only">
			<div className={classNames('full-field', 'time-on-market-input-component')}>
				<div className="time-on-market-search-block section">
					<div className="head">Days on Market</div>
					<div
						className={classNames('time-on-market-select', 'searchField')}
					>
						<SelectFieldClassic value={this.state.search.params.s_age_days_max ||
						SearchDefaults.timeOnMarket[0].value}
											wrapperStyle={{ display: 'inline-block' }}
											onChange={this.handleDayOnMarket}
											icon={<img
												src="../../assets/images/days-on-market-icon-green.png"/>}>
							{listTime}
						</SelectFieldClassic>
					</div>
				</div>
			</div>
		</div>;
	}

	render() {
		var searchId = this.props.searchId;
		var search = this.state.search || {};
		return <div className="lead-search-details">
			<MessageBin
				status={this.state.serverStatus}
				message={this.state.serverMessage}
			/>
			<FormFieldsMaterial
				ref="form"
				editMode={true}
				fields={searchFields}
				object={search}
				displayErrors={this.state.displayErrors}
				onChange={this.fieldChanged}
			/>
			{this.renderDayOnMarket()}
			{this.renderAmenities()}
			{this.renderAlertSettings()}

			<div>
				{this.props.saveButtonVisible &&
				<Button
					label="Submit and Save"
					large={true}
					className="actionButton"
					style={{ float: 'right' }}
					onClick={this.updateSearch.bind(this, this.props.leadId, this.props.leadUuid, this.props.searchId)}
					disabled={this.state.serverStatus === ServerStatuses.PROCESSING}
				/>
				}
				{searchId && this.props.deleteButtonVisible &&
				<Button
					label="Delete"
					large={true}
					className="actionButton"
					style={{ float: 'left' }}
					onClick={this.deleteSearch}
					disabled={this.state.serverStatus === ServerStatuses.PROCESSING}
				/>
				}
				<div className="clear"></div>
			</div>
			<Loader status={ this.state.serverStatus }/>
		</div>;
	}
}
