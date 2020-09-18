/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('room_claims', {
    id: { type: 'bigserial', primaryKey: true },
    room_id:   { type: 'bigint', notNull: true },
    email:     { type: 'text', notNull: true },
    otp:       { type: 'text', notNull: true },
    issued_at: { type: 'timestamptz' },
    expires_at: { type: 'timestamptz'},
    revoked_at: { type: 'timestamptz' },
    resolved_at: { type: 'timestamptz' },
    emailed_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  })
  pgm.createIndex('room_claims', ['room_id', 'email', 'otp'])
  pgm.createIndex('room_claims', 'email')
};

exports.down = pgm => {
  pgm.dropTable('room_claims')
};
