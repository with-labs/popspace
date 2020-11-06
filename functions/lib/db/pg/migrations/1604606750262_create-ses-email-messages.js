/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('ses_email_messages', {
    id: { type: 'bigserial', primaryKey: true },
    name: { type: 'text', notNull: true },
    to_email: { type: 'text', notNull: true },
    version: { type: 'bigint', notNull: true },
    error: { type: 'text' },
    message_id: { type: 'text' },
    response: { type: 'text' },
    aws_requested_at: { type: 'timestamptz' },
    aws_responded_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')")
    }
  })
  pgm.createIndex('ses_email_messages', ['name', 'version', 'to_email'])
  pgm.createIndex('ses_email_messages', ['name', 'aws_requested_at', 'aws_responded_at'])
};

exports.down = pgm => {
  pgm.dropTable('ses_email_messages')
};
