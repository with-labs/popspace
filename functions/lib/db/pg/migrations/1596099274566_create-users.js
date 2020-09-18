/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('users', {
    id: { type: 'bigserial', primaryKey: true },
    first_name: { type: 'text' },
    last_name: { type: 'text' },
    display_name: { type: 'text' },
    email: { type: 'text', notNull: true, unique: true},
    avatar_url: { type: 'text' },
    newsletter_opt_in: { type: 'boolean' },
    admin: { type: 'boolean', default: false }
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')")
    }
  })
  pgm.createIndex('users', 'email')
};

exports.down = pgm => {
  pgm.dropTable('users')
};
