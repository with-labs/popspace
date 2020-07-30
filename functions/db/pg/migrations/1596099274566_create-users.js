/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('users', {
    id: { type: 'bigint', primaryKey: true, autoIncrement: true },
    first_name: { type: 'text' },
    last_name: { type: 'text' },
    display_name: { type: 'text' },
    email: { type:  'text', notNull: true},
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  })
  pgm.createIndex('users', 'email')
};

exports.down = pgm => {
  pgm.dropTable('users')
};
