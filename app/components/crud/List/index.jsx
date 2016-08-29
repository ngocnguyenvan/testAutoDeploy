/*

CRUD List

A simple list of items with specific display elements for this application.

*/
'use strict';

import React from 'react';
import classNames from 'classnames';

if ( process.env.BROWSER ) {
	require( './styles.less' );
}

export default class List extends React.Component {

	static propTypes = {
		emptyListMessage: React.PropTypes.string,
		listItemClassName: React.PropTypes.string,
		listItemOnClick: React.PropTypes.func,
		children: React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		]),
		className: React.PropTypes.string
	};

	static defaultProps = {
		emptyListMessage: 'There are no items in your list',
		listItemOnClick: () => {}
	};

	render() {
		if ( this.props.children && this.props.children.length > 0 ) {
			return <ul className={ classNames( 'crud-list', this.props.className ) }>
					{ this.props.children.map( ( child, index ) => {
						return <li
							key={ child.key || index }
							className={ classNames( 'crud-list-item', this.props.listItemClassName ) }
							onClick={ this.listItemOnClick }
						>
							{ child }
						</li>;
					}) }
				</ul>;
		}
		else {
			return <div className={ classNames( 'crud-list-message-bin', this.props.className ) }>
					{ this.props.emptyListMessage }
				</div>;
		}
	}
}
