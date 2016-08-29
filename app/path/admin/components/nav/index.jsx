'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import { logout } from '../../../../actions/authActionCreators';
import LeftNav from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import history from '../../../../history';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

var mainNavList = [
	{
		route: '/admin',
		text: 'Dashboard'
	},
	{
		route: '/admin/lead',
		text: 'Leads'
	},
	{
		route: '/admin/my-account',
		text: 'My Account'

	},
	{
		action: logout,
		text: 'Logout'
	}
];

export default class Nav extends React.Component {

	static propTypes = {
		pathname: React.PropTypes.string
	};

	render() {
		return <LeftNav ref="leftNav" className="left-nav">
			<div className="logo">
				<img src="/assets/ylopo-logo.svg" />
			</div>
			{mainNavList.map((menuItem, index) => {
				return <MenuItem
					className={ classNames( 'menu-item', this.props.pathname === menuItem.route && 'active') }
					key={ index }
					onClick={() => {
						if ( menuItem.action ) {
							menuItem.action();
						}
						else {
							 history.push( menuItem.route );
						}
					}}
				>
					{menuItem.text}
				</MenuItem>;
			})}
		</LeftNav>;
	}
}
