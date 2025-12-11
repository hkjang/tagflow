const nodeExternals = require('webpack-node-externals');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      nodeExternals({
        modulesDir: path.resolve(__dirname, '../node_modules'),
      }),
    ],
    node: {
      __dirname: false,
      __filename: false,
    },
    plugins: [
      ...(options.plugins || []),
      new CopyPlugin({
        patterns: [
          { from: 'src/database/migrations', to: 'database/migrations' },
          { from: 'src/database/seeds', to: 'database/seeds' },
        ],
      }),
    ],
  };
};
