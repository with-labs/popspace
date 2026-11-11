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

      // alias React to the app's own copy: @withso/unicorn lives under unicorn/, whose
      // Next.js app installs a newer React that would otherwise get bundled twice
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias.react = path.dirname(require.resolve('react/package.json'));
      config.resolve.alias['react-dom'] = path.dirname(require.resolve('react-dom/package.json'));

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
