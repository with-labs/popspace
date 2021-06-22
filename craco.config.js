const webpack = require('webpack');
const git = require('git-rev-sync');
const CracoAlias = require('craco-alias');
const CopyPlugin = require('copy-webpack-plugin');

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
      // assuming HtmlWebpackPlugin is plugin 0.
      // We reconfigure the plugin to output our app's HTML entry file to app.html
      // instead of index.html.
      config.plugins[0].options.filename = 'app.html';

      config.plugins.push(
        ...[
          new webpack.DefinePlugin({
            VERSION: JSON.stringify(git.short()),
          }),
          // copy files from the landing page to the public directory
          new CopyPlugin({
            patterns: [{ context: './landing/dist/', from: '**/*', globOptions: { ignore: ['**/_*'] } }],
          }),
        ]
      );

      return config;
    },
  },
  devServer: (devServerConfig) => {
    devServerConfig.historyApiFallback = {
      disableDotRule: true,
      rewrites: [{ from: /./, to: '/app.html' }],
    };
    return devServerConfig;
  },
};
