/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('rooms', {
    id: { type: 'bigserial', primaryKey: true },
    owner_id: { type: 'bigint', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    }
  })
  pgm.createIndex('rooms', 'owner_id')
};

exports.down = pgm => {
  pgm.dropTable('rooms')
};
