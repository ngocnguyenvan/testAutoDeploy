'use strict';

import React from 'react';
import Button from '../../../components/core/Button';
import { FlatButton } from 'material-ui';
import { cloneDeep } from 'lodash';
export default class LeadSaveList extends React.Component {
	static propTypes = {
		onSearch: React.PropTypes.func,
		saveList: React.PropTypes.array,
		onDelete: React.PropTypes.func
	};

	constructor( props ) {
		super( props );
		this.onSearch = this.onSearch.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.state = {
			saveList: [],
			searchResult: false,
			searchQuery: {},
			listingId: [],
			disabledBtn: {}
		};
	}
	componentWillMount() {
		if (this.props.saveList.length > 0) {
			var disabledBtn = cloneDeep(this.state.disabledBtn);
			this.props.saveList.forEach((save) => {
				disabledBtn[save.id] = false;
			});
			this.setState({
				disabledBtn: disabledBtn
			});
		}
	}
	onSearch(save) {
		this.props.onSearch(save.searchParams, save.id, save.label, save.selectedListingIds);
	}
	onDelete(save) {
		if (!confirm('Are you sure you want to delete this saved list?')){
			return;
		}
		var disabledBtn = cloneDeep(this.state.disabledBtn);
		disabledBtn[save.id] = true;
		this.setState({
			disabledBtn: disabledBtn
		});
		this.props.onDelete(save.id);
	}
	render() {
		let listSave = [];
		if (this.props.saveList.length > 0) {
			listSave = this.props.saveList.map(function(save, index) {
				return <div className="form-group" key={index}>
					<div className="input-group">
						<span className="input-group-addon">
							<i className="fa fa-check"></i></span>
						<span className="form-control">{save.label} ({save.selectedListingIds.length} listings selected)</span>
					</div>
					<Button
						className="btn btn-success btn-submit"
						label="Start Search"
						onClick={()=>this.onSearch(save)}
					/>
					<FlatButton
						className="btn btn-danger btn-submit"
						backgroundColor="#d9534f"
						hoverColor="rgb(84,84,84)"
						style={{ minWidth: 40, minHeight: 44, borderRadius: 4, paddingRight: 12, paddingTop: 3, paddingBottom: 3 }}
						icon={<i style={{marginLeft: 12}} className="fa fa-trash"></i>}
						onClick={()=>this.onDelete(save)}
						disabled={this.state.disabledBtn[save.id]}
					/>
				</div>;
			}, this);
		}
		return ( <div>
				{listSave}
			</div>
		);
	}
}
