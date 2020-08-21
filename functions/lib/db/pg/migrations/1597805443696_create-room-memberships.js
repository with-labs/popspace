/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('room_memberships', {
    id: { type: 'bigserial', primaryKey: true },
    room_id: { type: 'bigint', notNull: true },
    user_id: { type: 'bigint', notNull: true },
    invite_id: { type: 'bigint' },
    began_at: { type: 'timestamptz' },
    expires_at: { type: 'timestamptz' },
    revoked_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    }
  })
  pgm.createIndex('room_memberships', 'room_id')
  pgm.createIndex('room_memberships', 'user_id')
  pgm.createIndex('room_memberships', 'invite_id')
};

exports.down = pgm => {
  pgm.dropTable('room_memberships')
};
