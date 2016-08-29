/*

LoadItemsPaginator

Fires an action/callback when the window scrolls this element in view.  Passing back an incremented "page" attribute
to the method.

*/
'use strict';

import React from 'react';
import { ServerStatuses } from '../../../Constants';
import { merge } from 'lodash';

export default class LoadItemsPaginator extends React.Component {

	static propTypes = {
		action: React.PropTypes.func.isRequired,
		actionOptions: React.PropTypes.object.isRequired,
		serverStatus: React.PropTypes.string.isRequired,
		endOfItems: React.PropTypes.bool.isRequired,
		scrollElement: React.PropTypes.node
	};

	constructor( props ) {
		super( props );

		this.fireAction = this.fireAction.bind( this );
		this.getScrollElement = this.getScrollElement.bind( this );
		this.handleScroll = this.handleScroll.bind( this );
		this.inView = this.inView.bind( this );
		this.shouldExecuteAction = this.shouldExecuteAction.bind( this );

		this.state = {
			loading: this.props.serverStatus !== ServerStatuses.SUCCESS
		};
	}

	componentWillReceiveProps( newProps ) {
		this.setState(
			{ loading: newProps.serverStatus === ServerStatuses.LOADING },
			() => {
				if ( this.shouldExecuteAction() ) {
					this.setState(
						{ loading: true },
						this.fireAction
					);
				}
			}

		);
	}

	componentDidMount() {
		this.getScrollElement().addEventListener( 'scroll', this.handleScroll );
		if ( this.shouldExecuteAction() ) {
			this.setState(
				{ loading: true },
				this.fireAction
			);
		}
	}

	componentWillUnmount() {
		this.getScrollElement().removeEventListener( 'scroll', this.handleScroll );
	}

	shouldExecuteAction() {
		return this.inView() && !this.state.loading && !this.props.endOfItems;
	}

	getScrollElement() {
		return this.props.scrollElement || window;
	}

	handleScroll() {
		if ( this.shouldExecuteAction() ) {
			this.setState(
				{ loading: true },
				this.fireAction
			);
		}
	}

	fireAction() {
		var newActionOptions = merge({ page: 0 }, this.props.actionOptions );
		newActionOptions.page ++;
		this.props.action( newActionOptions );
	}

	/**
	 * inView
	 *
	 * Returns true if the inVisibleElement is viewable with in the scrollElement.  The scroll element should always be
	 * an overflow element.
	 *
	 * Only checks in the y axis.  Assumes it is visiable in the x axis.
	 *
	 * @return {boolean}
	 */
	inView() {
		var isVisibleElement = this.refs.statusBin,
			scrollElement = this.getScrollElement(),
			top = isVisibleElement.offsetTop,
			left = isVisibleElement.offsetLeft;

		// add the "top" to any elements which contain the `isVisibleElement` until we reach the scrollElement to ensure
		// we have its proper top offset from the scrollElement
		var checkingElement = isVisibleElement;
		while ( checkingElement.offsetParent && checkingElement.offsetParent !== scrollElement ) {
			checkingElement = checkingElement.offsetParent;
			top += checkingElement.offsetTop;
			left += checkingElement.offsetLeft;
		}


		var scrollElementViewableMin,
			scrollElementViewableMax;

		if ( scrollElement === window ) {
			scrollElementViewableMin = window.pageYOffset;
			scrollElementViewableMax = window.pageYOffset + window.innerHeight;
		}
		else {
			scrollElementViewableMin = scrollElement.scrollTop;
			scrollElementViewableMax = scrollElementViewableMin + scrollElement.offsetHeight;
		}

		return scrollElementViewableMin < top && top < scrollElementViewableMax;
	}

	render() {
		var status = '';
		if ( this.state.loading && !this.props.endOfItems ) {
			status = 'Loading Next Page...';
		}
		else if ( this.props.endOfItems ) {
			status = 'End';
		}
		else {
			status = 'Waiting';
		}
		return <div className="items-status-bin" ref="statusBin">{ status }</div>;
	}

}
