const webpack = require('webpack');
const git = require('git-rev-sync');
const CracoAlias = require('craco-alias');

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
    ],
  },
};
