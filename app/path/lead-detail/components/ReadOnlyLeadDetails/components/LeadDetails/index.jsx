import React from 'react';
import { isEmpty, forEach } from 'lodash';
import objectPath from 'object-path';
import { Block, BlockHeader, BlockContent } from '../../../../../../components/core/Block';

export default class LeadDetails extends React.Component {

	static propTypes = {
		lead: React.PropTypes.object.isRequired,
		fubInfo: React.PropTypes.object
	};

	constructor() {
		super();
		this.getLeadDetailsCollection = this.getLeadDetailsCollection.bind(this);
		this.renderLeadDetailsCollection = this.renderLeadDetailsCollection.bind(this);
		this.renderLeadFubInfo = this.renderLeadFubInfo.bind(this);
	}

	getLeadDetailsCollection(lead) {
		var returnVal = {};

		var summary = objectPath.get(lead, 'stats.creation.payloadWithoutResponses.lead.summary');
		if (summary) {
			returnVal.Summary = summary;
		}

		var location = objectPath.get(lead, 'stats.creation.payloadWithoutResponses.lead_traits.location');
		if (location) {
			returnVal['Location of Interest'] = location;
		}

		return returnVal;
	}

	renderLeadDetailsCollection(leadDetailsCollection) {
		var listChildren = [];
		forEach(leadDetailsCollection, (value, key) => {
			listChildren.push(
				<div key={key} className="row clearfix">
					<div className="title" style={{ width: "100%" }}>{key}:</div>
					<div className="value">{value}</div>
				</div>);
			listChildren.push(<div key={key + '_divider'} className="row row-divider clearfix"></div>);
		});
		return <div className="profileCard">{listChildren}</div>;
	}

	renderLeadFubInfo(fubInfo) {
		if (!fubInfo) {
			return null;
		}

		var preparedInfo = {};
		preparedInfo['FUB Tags'] = fubInfo.tags ? fubInfo.tags.join(', ') : '';
		preparedInfo['FUB Disposition'] = fubInfo.stage;
		if (fubInfo.assignedTo) {
			preparedInfo['FUB Assigned Agent'] = fubInfo.assignedTo;
		}
		if (fubInfo.assignedLenderName) {
			preparedInfo['FUB Assigned Lender'] = fubInfo.assignedLenderName;
		}
		if (fubInfo.yFubURL) {
			let fubLink = `${fubInfo.yFubURL}/people/view/${fubInfo.id}`;
			preparedInfo.Link = <a href={fubLink} target="_blank">View in Follow Up Boss</a>;
		}

		var listChildren = [];

		forEach(preparedInfo, (value, key) => {
			var breakWordClass = key === 'FUB Tags' ? ' value-break-word' : '';
			listChildren.push(
				<div key={key} className="row clearfix">
					{key !== 'Link' &&
					<div className="title" style={{ width: "100%" }}>{key}:</div>
					}
					<div className={"value" + breakWordClass}>{value}</div>
				</div>);
			listChildren.push(<div key={key + "_divider"} className="row row-divider clearfix"></div>);
		});
		return <div className="profileCard">{listChildren}</div>;
	}

	render() {
		var leadDetailsCollection = this.getLeadDetailsCollection(this.props.lead);

		if (!isEmpty(leadDetailsCollection) || !isEmpty(this.props.fubInfo)) {
			return <Block className="lead-details-cell">
				<BlockHeader primary={true} title="Lead Details"/>
				<BlockContent>
					{ this.renderLeadDetailsCollection(leadDetailsCollection) }
					{ this.renderLeadFubInfo(this.props.fubInfo) }
				</BlockContent>
			</Block>;
		}
		else {
			return null;
		}
	}
}
