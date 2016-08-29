import React from 'react';
import StatisticsCircle from '../../core/StatisticsCircle';
import numeral from 'numeral';
import moment from 'moment';
import { ServerStatuses } from '../../../Constants';
import { get } from '../../../utils/api';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class LeadStatistics extends React.Component {

	static propTypes = {
		leadId: React.PropTypes.number,
		leadUuid: React.PropTypes.string
	};

	constructor() {
		super();
		this.loadLeadStatistics = this.loadLeadStatistics.bind(this);

		this.state = {
			statistics: {}
		};
	}

	componentWillMount() {
		this.loadLeadStatistics( this.props.leadId, this.props.leadUuid );
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.leadId === nextProps.leadId && this.props.leadUuid === nextProps.leadUuid &&
			this.state === nextState) {
			return false;
		}
		return true;
	}

	loadLeadStatistics(id, uuid) {
		var url = null;
		if (id) {
			url = `/lead/${ id }/statistics`;
		}
		else if (uuid) {
			url = `/open/${ uuid }/statistics`;
		}

		this.setState({
			serverStatus: ServerStatuses.PROCESSING
		}, () => {
			get(url)
				.then((result) => {
					this.setState({
						serverStatus: ServerStatuses.SUCCESS,
						statistics: result
					});
				})
				.catch((error) => {
					this.setState({
						serverMessage: error,
						serverStatus: ServerStatuses.FAIL
					});
				});
		});
	}

	render() {
		var formattedAvgPrice = this.state.statistics.avgPrice ?
			numeral( this.state.statistics.avgPrice ).format( '$0,0' ) :
			null;

		var formattedLastVisitDate = this.state.statistics.lastVisitDate ?
			moment(this.state.statistics.lastVisitDate).fromNow()
				.replace('hours', 'hrs').replace('minutes', 'mins') : // Saving screen space
			null;

		return <div className="lead-statistics lead-details-cell">
				<StatisticsCircle
					icon={<img src={ process.env.BROWSER ? require('../../../assets/images/lead/statistics/ave-price-icon.png') : '' } />}
					title="AVG PRICE"
					subtitle={formattedAvgPrice} />
				<StatisticsCircle
					icon={<img src={ process.env.BROWSER ? require('../../../assets/images/lead/statistics/last-visit-icon.png') : '' } />}
					title="LAST VISIT"
					subtitle={formattedLastVisitDate} />
				<StatisticsCircle
					icon={<img src={ process.env.BROWSER ? require('../../../assets/images/lead/statistics/listings-viewed-icon.png') : '' } />}
					title="LISTINGS VIEWED"
					subtitle={this.state.statistics.listingsViewed} />
				<StatisticsCircle
					icon={<img src={ process.env.BROWSER ? require('../../../assets/images/lead/statistics/total-visits-icon.png') : '' } />}
					title="TOTAL VISITS"
					subtitle={this.state.statistics.totalVisits} />
			</div>;
	}
}
