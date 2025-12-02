module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      'better-sqlite3',
      'bcrypt',
      'sql.js',
    ],
  };
};
