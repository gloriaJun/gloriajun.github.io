import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import { resolve, webpackCommonConfig } from './webpack.util';

const config: webpack.Configuration = {
  mode: 'development',
  entry: {
    'public/js/index': resolve('src/public/js/index.ts'),
  },
  output: {
    path: resolve('dist'),
    filename: '[name].bundle.js',
    publicPath: 'public',
  },
  module: {
    rules: [...webpackCommonConfig.module.rules],
  },
  resolve: webpackCommonConfig.resolve,
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['public/**/*', 'common/**/*'],
    }),
  ],
};

export default config;
