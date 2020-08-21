/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('otp_login_requests', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: { type:  'bigint', notNull: true },
    otp: { type: 'text', notNull: true },
    requested_at: {
      type: 'timestamptz',
      notNull: true
    },
    expires_at: {
      type: 'timestamptz'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
    resolved_at: { type: 'timestamptz' }
  })
  pgm.createIndex('otp_login_requests', ['user_id', 'otp'])
  pgm.createIndex('otp_login_requests', 'requested_at')
  pgm.createIndex('otp_login_requests', 'expires_at')
};

exports.down = pgm => {
  pgm.dropTable('otp_login_requests')
};
