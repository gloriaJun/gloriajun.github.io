import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

import { resolve, webpackCommonConfig } from './webpack.util';

const config: webpack.Configuration = {
  target: 'node',
  externals: [nodeExternals()],
  mode: 'development',
  entry: {
    'server/index': resolve('src/server/index.ts'),
  },
  output: {
    path: resolve('dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [...webpackCommonConfig.module.rules],
  },
  resolve: webpackCommonConfig.resolve,
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: resolve('src/views'), to: 'views' }],
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['server/**/*', 'common/**/*'],
    }),
  ],
};

export default config;
