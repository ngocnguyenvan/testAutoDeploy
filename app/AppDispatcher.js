'use strict';

var _ = require( 'lodash' ),
	Dispatcher = require( 'flux' ).Dispatcher;

var AppDispatcher = _.merge(new Dispatcher(), {
	handleAction: function( action ) {
		try {
			this.dispatch( action );
		}
		catch ( e ) {
			console.log( 'Dispatch Error' );
			console.log( e );
		}
	}
});

export default AppDispatcher;
