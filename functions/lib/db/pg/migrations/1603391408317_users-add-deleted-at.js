/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumn('users', {
    deleted_at: { type: 'timestamptz' },
  })
};

exports.down = pgm => {
  pgm.dropColumn('users', ["deleted_at"])
};
