/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { dependencies } from '../package.json';

export default {
  externals: [...Object.keys(dependencies || {})],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    alias: {
      // config alias
      views: path.resolve(__dirname, '../app/views'),
      utils: path.resolve(__dirname, '../app/utils'),
      components: path.resolve(__dirname, '../app/components'),
      config: path.resolve(__dirname, '../app/config'),
      // assets: path.resolve(__dirname, '../app/assets'),
      // support: path.resolve(__dirname, '../app/support'),
      // reducers: path.resolve(__dirname, '../app/reducers'),
      // actions: path.resolve(__dirname, '../app/actions'),
      // images: path.resolve(__dirname, '../app/images'),

      // constants: path.resolve(__dirname, '../app/constants'),
    },
    extensions: ['.js', '.jsx', '.json']
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),

    new webpack.NamedModulesPlugin()
  ]
};
