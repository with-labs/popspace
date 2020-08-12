/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('sessions', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: { type: 'bigint', notNull: true },
    secret: { type: 'text' },
    expires_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    }
  })
  pgm.createIndex('sessions', ['user_id', 'secret'])
  pgm.createIndex('sessions', 'expires_at')
  pgm.createIndex('sessions', 'created_at')
};

exports.down = pgm => {
  pgm.dropTable('sessions')
};
