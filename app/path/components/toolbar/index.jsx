'use strict';

import React from 'react';
import { assign } from 'lodash';
import { logout } from '../../../actions/authActionCreators';
import objectPath from 'object-path';
import UserStore from '../../../stores/UserStore';
import Button from '../../../components/core/Button';
import history from '../../../history';
import ContentAddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';

if (process.env.BROWSER) {
	require('./styles.less');
}

export default class Toolbar extends React.Component {

	static contextTypes = {
		location: React.PropTypes.object
	};

	static propTypes = {
		style: React.PropTypes.object
	};

	render() {
		// Have to create component to set width because Material-UI Button render clears icon styles
		const AddCircleOutlineIcon = (props) => {
			var { style, ...other } = props;

			style = assign(style, {
				width: 18,
				height: 18
			});

			return <ContentAddCircleOutline style={style} {...other} />;
		};

		return <div className="toolbar">
			{ objectPath.get(this.context, 'location.pathname') !== '/lead-detail/add' &&
			<Button className="addLeadBtn"
					label="Add Lead"
					icon={<AddCircleOutlineIcon />}
					onClick={() => history.push('/lead-detail/add')}/>
			}
			<Button className="logoutBtn" label="Logout" onClick={logout} />
			{ UserStore.getState() &&
			<div className="userName">{ UserStore.getState().fullName }</div>
			}
			<div className="clearfix"></div>
		</div>;
	}
}
