/*
	The main script for initializing this repo.  It wraps the defined server script with babel for ES6/7 and JSX
	transformation.
*/
'use strict';

var config = require( 'config' ),
	debug = require( 'debug' )( 'ylopo:stars:main' ),
	fs = require( 'fs' );

require('babel-register');

var fileName = config.get( 'serverFileName' );
fs.stat( fileName + '.js', function( err, fileStats ) {
	if ( !err && fileStats.isFile() ) {
		debug( 'Initializing [' + fileName + ']' );
		require( fileName );
	}
	else {
		console.log( 'Error.  File [' + fileName + ']. Error: ' + err );
	}
});

