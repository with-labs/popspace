/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('magic_links', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: { type:  'bigint', notNull: true },
    otp: { type: 'text', notNull: true },
    action: { type: 'text', notNull: true },
    meta: { type: 'json'},
    issued_at: {
      type: 'timestamptz',
      notNull: true
    },
    expires_at: {
      type: 'timestamptz'
    },
    resolved_at: { type: 'timestamptz' },
    revoked_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    }
  })
  pgm.createIndex('magic_links', ['user_id', 'otp', 'action'])
};

exports.down = pgm => {
  pgm.dropTable('magic_links')
};
