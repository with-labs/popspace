const webpack = require('webpack');
const git = require('git-rev-sync');
const CracoAlias = require('craco-alias');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

console.log('Customizing Webpack');
module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        tsConfigPath: './tsconfig.extend.json',
      },
    },
  ],
  webpack: {
    configure: (config, { env, paths }) => {
      config.plugins.push(
        ...[
          new webpack.DefinePlugin({
            VERSION: JSON.stringify(git.short()),
          }),
        ]
      );

      // alias React to the local installed dependency so we can yarn link other React-based
      // modules without problems
      // config.resolve.alias = config.resolve.alias || {};
      // config.resolve.alias.react = path.resolve(__dirname, 'node_modules/react');
      // config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules/react-dom');

      return config;
    },
  },
  devServer: (devServerConfig) => {
    devServerConfig.historyApiFallback = {
      disableDotRule: true,
    };
    return devServerConfig;
  },
};
