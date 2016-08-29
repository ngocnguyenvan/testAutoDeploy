var Path = require( 'path' ),
	webpack = require( 'webpack' ),
	StatsWriterPlugin = require( 'webpack-stats-plugin' ).StatsWriterPlugin;
var npmDir = Path.join(__dirname, '/../', 'node_modules');
var definePlugin = new webpack.DefinePlugin({
	'process.env': {
		NODE_ENV: JSON.stringify( process.env.NODE_ENV ),
		BROWSER: true
	}
});

var webpackConfig = {

	addVendor: function( name, path ) {
		this.resolve.alias[ name ] = path;
		this.module.noParse.push( new RegExp( '^' + name + '$' ) );
	},

	entry: [
		'babel-polyfill',
		'./app/client'
	],

	output: {
		filename: '[hash].js',
		chunkFilename: '[id].chunk.js',
		path: Path.join( __dirname, '../', 'build', 'js'),
		publicPath: '/build/js/'
	},

	module: {
		noParse: [],
		loaders: [
			{
				test: /\.(js|jsx)?$/,
				loaders: [
					'babel'
				],
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.less$/,
				loader: 'style-loader!css-loader!less-loader'
			},
			{
				test: /\.png$/,
				loader: 'url-loader?limit=100000'
			},
			{
				test: /.(jpg|gif|ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/,
				loader: 'file-loader?name=[name].[ext]'
			},
			{
				test: /\.svg$/,
				loader: 'raw-loader'
			},
			{
				test: /.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/,
				loader: 'url-loader?mimetype=application/font-woff'
			},
			{
				include: /\.json$/,
				loader: 'json-loader'
			}
		]
	},

	resolve: {
		alias: {},
		extensions: [ '', '.json', '.js', '.jsx' ]
	},

	plugins: [
		new webpack.NoErrorsPlugin(),
		definePlugin,
		new StatsWriterPlugin({
			filename: 'stats.json',
			fields: [ 'assetsByChunkName' ]
		})
	]
};

webpackConfig.addVendor( 'react-select.css', npmDir + '/react-select/dist/default.css' );

module.exports = webpackConfig;
