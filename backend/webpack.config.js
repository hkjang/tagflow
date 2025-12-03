const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      nodeExternals({
        modulesDir: path.resolve(__dirname, '../node_modules'),
      }),
    ],
  };
};
