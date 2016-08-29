var webpack = require( 'webpack' ),
	WebpackDevServer = require( 'webpack-dev-server' ),
	compilerConfig = require( './webpack.config.dev' ),
	_ = require( 'lodash' ),
	serverConfig = _.cloneDeep( require( 'config' ).get( 'webpack' ) );

module.exports = new WebpackDevServer(
	webpack( compilerConfig ),
	_.merge( serverConfig, { publicPath: compilerConfig.output.publicPath } )
).listen(
	serverConfig.port,
	serverConfig.domainName,
	function( err, result ) {
		if ( err ) {
			console.log( err );
		}
		console.log( 'Webpack is listening at ' + serverConfig.contentBase );
	}
);
