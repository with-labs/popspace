/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('room_invitations', {
    id: { type: 'bigserial', primaryKey: true },
    room_id:   { type: 'bigint', notNull: true },
    email:     { type: 'text', notNull: true },
    otp:       { type: 'text', notNull: true },
    issued_at: { type: 'timestamptz' },
    expires_at: { type: 'timestamptz'},
    // this way we can expire relative to invite date or accept date,
    // just by changing the logic - vs setting an expired_at,
    // which locks us into expiring relative to issue date
    membership_duration_millis: { type: 'bigint' },
    revoked_at: { type: 'timestamptz' },
    resolved_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  })
  pgm.createIndex('room_invitations', ['room_id', 'email', 'otp'])
  // Use case: show all invitations for a given email
  pgm.createIndex('room_invitations', 'email')
};

exports.down = pgm => {
  pgm.dropTable('room_invitations')
};
