const webpackMerge = require('webpack-merge');
const prodConfig = require('./webpack.production.conf');

module.exports = webpackMerge(prodConfig,
  {},
);
