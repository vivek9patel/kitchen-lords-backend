const webpack = require('webpack');

module.exports = {
  entry: "./dist/index.js",
  output: {
    filename: `./built.js`,
  },
  target: 'node',
  mode: 'production',
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
};