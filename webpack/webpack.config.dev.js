var Path = require( 'path' ),
	webpack = require( 'webpack' ),
	config = require( 'config' );
var npmDir = Path.join(__dirname, '/../', 'node_modules');
var definePlugin = new webpack.DefinePlugin({
	'process.env': {
		NODE_ENV: JSON.stringify( 'development' ),
		BROWSER: true
	}
});

var webpackConfig = {

	addVendor: function( name, path ) {
		this.resolve.alias[ name ] = path;
		this.module.noParse.push( new RegExp( '^' + name + '$' ) );
	},

	devtool: 'eval-source-map',

	entry: [
		'webpack-dev-server/client?' + config.get( 'webpack.contentBase' ),
		'webpack/hot/only-dev-server',
		'babel-polyfill',
		'./app/client'
	],

	output: {
		filename: '[name].js',
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
					'react-hot',
					'babel-loader'
				],
				exclude: /node_modules/
			},
			{
				test: /\.jsx?$/,
				loaders: [
					'babel-loader'
				],
				include: /d3rrc/
			},
			{
				test: /\.css$/,
				loader: 'style-loader?sourceMap!css-loader?sourceMap'
			},
			{
				test: /\.less$/,
				loader: 'style-loader?sourceMap!css-loader?sourceMap!less-loader?sourceMap'
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
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		definePlugin
	]
};

webpackConfig.addVendor( 'react-select.css', npmDir + '/react-select/less/default.less' );

module.exports = webpackConfig;
