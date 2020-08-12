/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('users', {
    id: { type: 'bigserial', primaryKey: true },
    first_name: { type: 'text' },
    last_name: { type: 'text' },
    display_name: { type: 'text' },
    email: { type:  'text', notNull: true, unique: true},
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
    newsletter_opt_in: { type: 'boolean' }
  })
  pgm.createIndex('users', 'email')
};

exports.down = pgm => {
  pgm.dropTable('users')
};
