const webpack = require('webpack');
const git = require('git-rev-sync');

console.log('Customizing Webpack');
module.exports = {
  webpack: {
    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(git.short()),
      }),
    ],
  },
};
