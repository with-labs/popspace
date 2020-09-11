/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('room_names', {
    id: { type: 'bigserial', primaryKey: true },
    room_id: { type: 'bigint', notNull: true },
    name: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    }
  })
  pgm.createIndex('room_names', 'name')
};

exports.down = pgm => {
  pgm.dropTable('room_names')
};
