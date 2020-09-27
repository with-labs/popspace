/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('room_names', {
    id: { type: 'bigserial', primaryKey: true },
    room_id: { type: 'bigint', notNull: true },
    name: { type: 'text', notNull: true, unique: true},
    // Allows chosing a most preferred name for a room with many names
    priority_level: { type: 'integer', notNull: true, default: 0 },
    is_vanity: { type: 'boolean' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    }
  })
  pgm.createIndex('room_names', ['room_id', 'priority_level'])
  pgm.createIndex('room_names', 'name')
};

exports.down = pgm => {
  pgm.dropTable('room_names')
};
