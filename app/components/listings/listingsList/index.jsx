'use strict';

import React from 'react';
import { get, post } from '../../../utils/api';
import ListingItem from '../listingsItem';
import Button from '../../../components/core/Button';
import { getTimezone } from '../../../utils/dateUtil';
import moment from 'moment-timezone';
import Loader from '../../core/Loader';
import { ServerStatuses } from '../../../Constants';
import { Block, BlockHeader } from '../../core/Block';
import Dialog from '../../core/Dialog';
import TextBox from '../../core/TextBox';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class ListingList extends React.Component {

	include = 'savedSearches.searchAlerts';

	static propTypes = {
		searchQuery: React.PropTypes.string,
		selectedListingIds: React.PropTypes.array,
		scrollElement: React.PropTypes.any,
		lead: React.PropTypes.object,
		sendList: React.PropTypes.func,
		beforeSearch: React.PropTypes.func,
		changeSearch: React.PropTypes.func,
		saveListId: React.PropTypes.number,
		saveName: React.PropTypes.string
	};

	constructor(props) {
		super(props);
		this.renderDialog = this.renderDialog.bind(this);
		this.loadMapSearch = this.loadMapSearch.bind(this);
		this.loadListings = this.loadListings.bind(this);
		this.addListing = this.addListing.bind(this);
		this.listChange = this.listChange.bind(this);
		this.saveList = this.saveList.bind(this);
		this.sendList = this.sendList.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.dialogClose = this.dialogClose.bind(this);
		this.openDialog = this.openDialog.bind(this);
		this.labelChange = this.labelChange.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.state = {
			listingIds: [],
			listings: [],
			loadmore: false,
			dialogOpen: false,
			page: 0,
			label: '',
			headerPosition: 'relative',
			headerWidth: '100%',
			statusBinHeight: '0px',
			savedList: [],
			serverStatuses: ServerStatuses.LOADING,
			listingContainerHeight: 0,
			disableSaveButton: false,
			itemWidth: 0
		};
	}

	componentWillMount() {
		this.setState({
			label: this.props.saveName
		});
		this.loadMapSearch(this.props.searchQuery)
			.then(()=> {
				this.loadListings(this.props.selectedListingIds, false)
					.then(()=> {
						var listingIds = this.state.listingIds;
						var savedList = [];
						this.state.listings.forEach((listing)=> {
							var index = this.state.listingIds.indexOf(listing.id);
							savedList.push(listing.id);
							if (index !== -1) {
								listingIds.splice(index, 1);
							}
						});
						this.setState({
							listingIds: listingIds,
							savedList: savedList
						});
						var listLength = 18;
						while (listLength < this.state.savedList.length) {
							listLength += 18;
						}
						listingIds = this.state.listingIds.slice(0, listLength - this.state.savedList.length);
						this.setState({
							page: listLength - this.state.savedList.length
						});
						this.loadListings(listingIds);
					});
			});
	}
	componentDidMount() {
		window.addEventListener('resize', this.handleResize);
		window.addEventListener('scroll', this.handleScroll);
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
		window.removeEventListener('scroll', this.handleScroll);
	}

	handleResize() {
		if (this.listingContainer) {
			const top = this.listingContainer.getBoundingClientRect().top;
			const height = window.innerHeight - top;
			this.setState({
				listingContainerHeight: height
			});
		}
	}
	handleScroll() {
		var rect = this.refs.listingBin;
		if ( rect.getBoundingClientRect().top < 0 ) {
			this.setState({
				headerClass: 'fixed',
				headerWidth: rect.offsetWidth,
				statusBinHeight: '130px'
			});
		}
		else {
			this.setState({
				headerClass: 'relative',
				headerWidth: '100%',
				statusBinHeight: '0px'
			});
		}
		if (this.state.loadmore && this.state.serverStatuses !== ServerStatuses.LOADING) {
			if (window.pageYOffset + window.innerHeight + 100 > document.body.scrollHeight) {
				this.addListing();
			}
		}
	}

	addListing() {
		this.setState(
			{
				serverStatuses: ServerStatuses.LOADING,
				page: this.state.page + 18
			}
		);
		var listingIds = this.state.listingIds.slice(this.state.page - 18, this.state.page);
		this.loadListings(listingIds);
	}

	loadMapSearch(searchQuery) {
		const listingIds = [];
		return get('/mapsearch',
			{
				s: searchQuery,
				partyWebsiteId: this.props.lead.listingAlertWebsiteId
			})
			.then((result) => {
				result.forEach((search) => {
					listingIds.push(search.id);
				});
				this.setState({
					listingIds: listingIds
				});
			})
			.catch((error) => {
			});
	}

	loadListings(listingIds, disableLoading = true) {
		if (this.state.page <= this.state.listingIds.length) {
			this.setState({
				loadmore: true
			});
		}
		else {
			this.setState({
				loadmore: false
			});
		}
		var listings = this.state.listings;
		return get('/listing',
			{
				s: { listingIds: listingIds },
				partyWebsiteId: this.props.lead.listingAlertWebsiteId
			})
			.then((result) => {
				result.forEach((listing) => {
					listings.push(listing);
				});
				if (disableLoading) {
					this.setState({
						listings: listings,
						serverStatuses: ServerStatuses.SUCCESS
					});
				}
				else {
					this.setState({
						listings: listings
					});
				}
			})
			.catch((error) => {
				this.setState({
					serverStatuses: ServerStatuses.FAIL
				});
			});
	}

	listChange(listingId) {
		var savedList = this.state.savedList;
		var index = savedList.indexOf(listingId);
		if (index === -1) {
			savedList.push(listingId);
		}
		else {
			savedList.splice(index, 1);
		}
		this.setState(
			{ savedList: savedList }
		);
	}

	saveList() {
		this.setState({
			disableSaveButton: true
		});
		return post('/savedList/' + this.props.lead.id,
			{ id: this.props.saveListId },
			{
				label: this.state.label,
				params: this.props.searchQuery,
				selectedListingIds: this.state.savedList
			})
			.then((result) => {
				window.location.href = `/lead-detail/${this.props.lead.uuid}/push-notification`;
			})
			.catch((error) => {
			});
	}

	sendList() {
		this.props.sendList(this.props.searchQuery, this.props.saveListId, this.props.saveName, this.state.savedList);
	}

	changeSearch() {
		this.props.changeSearch(this.props.searchQuery, this.props.saveListId, this.props.saveName, this.state.savedList);
	}

	openDialog() {
		var dateString = this.props.saveName
		if (dateString === undefined || dateString === '' ) {
			var date = new Date();
			dateString = moment.tz(date, getTimezone()).format('M/DD/YYYY hh:mmA');
		}
		this.setState(
			{
				dialogOpen: true,
				label: dateString
			}
		);
	}

	dialogClose() {
		this.setState(
			{ dialogOpen: false }
		);
	}

	labelChange(e) {
		this.setState({
			label: e.target.value
		});
	}

	renderDialog() {
		return <Dialog
			key="content_dialog"
			title={'Save These Listings'}
			modal={false}
			open={this.state.dialogOpen}
			onRequestClose={this.dialogClose}
			titleStyle={{ paddingRight: 30 }}
			contentStyle={{ width: 400, height: 400 }}
		>
			<div className="div-align-center">
				<p>{'(' + this.state.savedList.length + ' Listings Selected)'}</p>
			</div>
			<div className="div-align-right">
				<p>Name this search</p>
				<TextBox className="text-box"
						 disabled={false}
						 value={this.state.label}
						 onChange={this.labelChange}/>
			</div>
			<div className="div-align-center">
				<Button disabled={ this.state.label === '' || this.state.label === undefined || this.state.disableSaveButton }
						onClick={this.saveList}>
					Save List
				</Button>
			</div>
		</Dialog>;
	}

	render() {
		if (this.state.listings && this.state.listings.length > 0) {
			var listingList = this.state.listings.map(function(listing, index) {
				var selected = false;
				if (this.props.selectedListingIds.indexOf(listing.id) !== -1) {
					selected = true;
				}
				return (
					<div key={index}>
						<ListingItem
							listing={listing}
							selected={ selected }
							onChange={this.listChange}
						/>
					</div>
				);
			}, this);
		}
		return (
			<div>
				{ this.state.listings.length > 0 && <Block className="ylo">
					<BlockHeader className="header" title="Push Notification" fontSize={17}/>
					<div ref="listingBin" style={{ height: this.state.statusBinHeight }}></div>
					<div className="tr-scroll2" style={{ position: this.state.headerClass, width: this.state.headerWidth }}>
						<div className="top-left">
							<p>Step 2: Choose your listing</p>
							<Button className="large-button" onClick={this.changeSearch}>
								Change Search
							</Button>
						</div>
						<div>
							<div className="top-right">
								<Button style={{ marginTop: 5 }}
										disabled={this.state.savedList.length > 100}
										onClick={this.openDialog}>
									Save List
								</Button>
								<Button style={{ backgroundColor: '#5496c5', marginLeft: 10, marginTop: 5 }}
										disabled={this.state.savedList.length > 8 || this.state.savedList.length < 1}
										onClick={this.sendList}>
									Send List
								</Button>
								<p className="p-right">{this.state.savedList.length + ' listings selected' +
								(this.state.savedList.length > 8 ? ' (Max 8)' : '')}</p>
							</div>
							<div className="clearfix"/>
						</div>
					</div>
					<div ref={(c) => {
						if (!this.listingContainer) {
							this.listingContainer = c;
							this.handleResize();
						}
					}}>
						<div className="ylo-section">
							{listingList}
						</div>
					</div>
				</Block>}
				<Loader status={this.state.serverStatuses} fullScreen={true}/>
				{this.state.listings.length === 0 && this.state.serverStatuses !== ServerStatuses.LOADING &&
				<div className="div-align-center">
					<p>Uh oh, your last search was too narrow. We couldn't find any listings that match your search. Want to
						try something new?</p>
					<Button style={{ marginTop: 30, width: 150 }} onClick={this.changeSearch}>
						Change Search
					</Button>
				</div>}
				{ this.renderDialog() }
			</div>

		);
	}
}
