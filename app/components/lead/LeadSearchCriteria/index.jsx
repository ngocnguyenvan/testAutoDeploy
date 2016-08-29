'use strict';

import React from 'react';
import { assign, filter } from 'lodash';
import { ServerStatuses } from '../../../Constants';
import { Block, BlockHeader, BlockContent } from '../../core/Block';
import Button from '../../../components/core/Button';
import LeadSearchContainer from '../LeadSearchContainer';
import LeadSaveList from '../LeadSaveList';
import ListingList from '../../../components/listings/listingsList';
import LeadMailContainer from '../LeadMailContainer';
import { get, del } from '../../../utils/api';
if (process.env.BROWSER) {
	require( './styles.less' );
}

export default class LeadSearchCriteria extends React.Component {
	static propTypes = {
		lead: React.PropTypes.object,
		style: React.PropTypes.string,
		sendMailSuccess: React.PropTypes.func
	};

	constructor( props ) {
		super( props );
		this.onSearch = this.onSearch.bind(this);
		this.sendList = this.sendList.bind(this);
		this.beforeSearch = this.beforeSearch.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.loadListSave = this.loadListSave.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.state = {
			serverStatus: ServerStatuses.LOADING,
			serverMessage: undefined,
			beforeSearch: true,
			beingSearch: false,
			afterSearch: false,
			search: {
				s_type: ['house', 'condo'],
				s_cat: "Purchase",
				s_da: "t"
			},
			saveList: [],
			saveListId: 0,
			searchQuery: {},
			selectedListingIds: [],
			saveName: ''
		};
	}
	componentWillMount() {
		this.loadListSave(this.props.lead.id);
	}
	beforeSearch() {
		this.setState({
			beforeSearch: true,
			beingSearch: false,
			afterSearch: false
		});
	}
	onSearch(search, saveListId, label = '', selectedListingIds = []) {
		this.setState({
			beforeSearch: false,
			beingSearch: false,
			afterSearch: true,
			searchQuery: JSON.stringify(search),
			saveListId: saveListId,
			saveName: label,
			selectedListingIds: selectedListingIds
		});
	}
	sendList(search, saveListId, label = '', selectedListingIds = []) {
		this.setState({
			beforeSearch: false,
			beingSearch: false,
			afterSearch: false,
			searchQuery: JSON.parse(search),
			saveListId: saveListId,
			saveName: label,
			selectedListingIds: selectedListingIds
		});
	}
	changeSearch(search, saveListId, label = '', selectedListingIds = []) {
		console.log(selectedListingIds);
		search = JSON.parse(search);
		search.s_locations = JSON.parse(search.s_locations);
		this.setState({
			beforeSearch: false,
			beingSearch: true,
			afterSearch: false,
			saveListId: saveListId,
			saveName: label,
			search: search,
			selectedListingIds: selectedListingIds
		});
	}
	loadListSave(leadId) {
		return get( `/savedList/byLeadId/${ leadId }`)
			.then((list) => {
				if (list.length > 0) {
					this.setState({
						saveList: list
					});
				}
				else {
					this.setState({
						saveList: list,
						beforeSearch: false,
						beingSearch: true
					});
				}
			})
			.catch((error) => {
			});
	}
	onDelete(saveId) {
		return del( `/savedList/${this.props.lead.id}/result/${saveId}`, {})
			.then((result) => {
				const saveList = filter(this.state.saveList, (save) => {
					return save.id !== saveId;
				})
				if ( saveList.length > 0) {
					this.setState({
						saveList: saveList
					});
				}
				else {
					this.setState({
						saveList: saveList,
						beforeSearch: false,
						beingSearch: true
					});
				}
			})
			.catch((error) => {
			});
	}
	render() {
		return ( this.state.beforeSearch && this.state.saveList.length > 0 ?
				<Block className="lead-details-cell lead-search-list-block ">
					<BlockHeader title="Push Notification" fontSize={17}/>
					<BlockContent style={{ padding: 0 }} className="box-search">
						<div className="box-body">
							<h4 className="step-title">Step 1: Start with New Search or Select a List to Start Search</h4>
							<div className="box-step">
								<label>Save list (Unsent)</label>
								{ this.state.saveList.length > 0 &&
									<LeadSaveList saveList={this.state.saveList} onSearch={this.onSearch} onDelete={this.onDelete}/>
								}
								<div className="text-center">
									<Button label="Start With New Search"
											className="start-new-search"
											icon={<i className="fa fa-search"></i>}
											search={true}
											onClick={(event) => {
												this.setState({
													beforeSearch: false,
													beingSearch: true
												});
											} }
									/>
								</div>
							</div>
						</div>
					</BlockContent>
				</Block> : <div>
				{ this.state.beingSearch ?
					<LeadSearchContainer
							lead={ this.props.lead }
							onSearch={this.onSearch}
							search={this.state.search}
							saveListId={this.state.saveListId}
							saveName={this.state.saveName}
							selectedListingIds={this.state.selectedListingIds}
						/> : this.state.searchQuery && this.state.afterSearch ? <ListingList
								lead={this.props.lead}
								searchQuery={this.state.searchQuery}
								selectedListingIds={this.state.selectedListingIds}
								saveListId={this.state.saveListId}
								sendList={this.sendList}
								changeSearch={this.changeSearch}
								beforeSearch={this.beforeSearch}
								saveName={this.state.saveName}
							/> : !this.state.afterSearch && !this.state.beingSearch && !this.state.beforeSearch && <LeadMailContainer
									lead={this.props.lead}
									searchQuery={this.state.searchQuery}
									saveListId={this.state.saveListId}
									selectedListingIds={this.state.selectedListingIds}
									onSearch={this.onSearch}
									sendMailSuccess={this.props.sendMailSuccess}
									saveName={this.state.saveName}
							/>
				}
				</div>

		);
	}
}
