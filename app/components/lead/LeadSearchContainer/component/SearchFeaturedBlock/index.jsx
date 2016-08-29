'use-strict';

import { default as React, Component, PropTypes } from 'react';
import classNames from 'classnames';
import { cloneDeep, isUndefined} from 'lodash';
import Checkbox from '../../../../core/Checkbox';
if (process.env.BROWSER) {
	require('./styles.less');
}

export default class SearchFeaturedBlock extends Component {

	static propTypes = {
		classes: PropTypes.string,
		setValue: PropTypes.func.isRequired,
		value: PropTypes.object.isRequired,
		options: PropTypes.array.isRequired,
		label: PropTypes.string.isRequired
	};

	static defaultProps = {
		value: []
	};

	constructor(props) {
		super(props);
		this.renderFields = this.renderFields.bind(this);
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
	handleChange(e) {
		const value = e.target.value;
		if (e.target.checked) {
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

	renderFields() {
		const featureTypes = this.state.search;
		return this.props.options.map((opt, index) => {
			let checked = !isUndefined(featureTypes[opt.apiKey]);
			return (
				<Checkbox
					className="feature-checkbox"
							label={opt.label}
						  value={opt.apiKey}
						  key={`feature-${index}`}
						  checked={checked}
						  onCheck={this.handleChange}
				/>
			);
		});
	}

	render() {
		return (
			<div className={classNames('bordered-content-block', this.props.classes)} >
				<h4>{this.props.label}</h4>
				<div className="content" >
					{this.renderFields()}
				</div>
			</div>
		);
	}

}
