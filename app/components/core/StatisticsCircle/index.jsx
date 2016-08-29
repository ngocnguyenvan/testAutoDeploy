import React from 'react';
import { merge } from 'lodash';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class StatisticeCircle extends React.Component {

	static propTypes = {
		icon: React.PropTypes.node,
		title: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		subtitle: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),

		style: React.PropTypes.object,
		iconStyle: React.PropTypes.object,
		titleStyle: React.PropTypes.object,
		subtitleStyle: React.PropTypes.object
	};

	render() {
		var style = merge({}, this.props.style, {
			width: 170,
			height: 170
		});

		var circleWidthPercents = 15;

		return <div className="statistics-circle">
			<div className="outer-circle" style={style}>
				<div className="inner-circle" style={{
					width: style.width * (1 - circleWidthPercents / style.width),
					height: style.height * (1 - circleWidthPercents / style.height)
				}}>
					<div className="icon" style={this.props.iconStyle}>
						{this.props.icon}
					</div>
					<div className="title" style={this.props.titleStyle}>
						{this.props.title}
					</div>
					<div className="subtitle" style={this.props.subtitleStyle}>
						{this.props.subtitle}
					</div>
				</div>
			</div>
		</div>;
	}
}
