// the dev settings are fine, but they run the webpack dev server at the same time as the Node API
// this causes hot reloading to take a millenium
// this piggybacks off other dev configuration, but tweaks the few options required to split the webpack dev server
// and the main express server
// run with `npm run debug`

const devConfig = require('./webpack.config.dev');
const serverConfig = require('config').get('webpack');

devConfig.output.publicPath = `${serverConfig.contentBase}${devConfig.output.publicPath}`;

devConfig.devServer = {
	port: serverConfig.port,
	hot: true
};

module.exports = devConfig;
