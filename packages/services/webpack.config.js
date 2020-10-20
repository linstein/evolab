const version = require('./package.json').version;

module.exports = {
  entry: './lib',
  output: {
    filename: './dist/index.js',
    library: '@evolab/services',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    publicPath: 'https://unpkg.com/@evolab/services@' + version + '/dist/'
  },
  bail: true,
  mode: 'production',
  devtool: 'source-map'
};
