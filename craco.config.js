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
    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(git.short()),
      }),
      new CopyPlugin({
        patterns: [
          { context: 'node_modules/noodle-landing/dist/', from: '**/*', globOptions: { ignore: ['**/index.html'] } },
        ],
      }),
    ],
    configure: (config, { env, paths }) => {
      config.module.rules.push({
        test: /\.html$/i,
        loader: 'html-loader',
        options: {
          esModule: false,
          attributes: false,
        },
      });
      return config;
    },
  },
};
