import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

export const resolve = (file: string) => path.join(process.cwd(), file);

export const webpackCommonConfig = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve('tsconfig.json'),
        extensions: ['.ts', '.tsx'],
      }),
    ],
  },
};
