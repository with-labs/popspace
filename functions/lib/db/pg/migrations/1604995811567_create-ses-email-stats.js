/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createIndex('ses_email_messages', ['message_id'])
  pgm.createTable('ses_email_stats', {
    message_id: { type: 'text', primaryKey: true },
    sent_at: { type: 'timestamptz' },
    opened_at: { type: 'timestamptz' },
    clicked_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')")
    }
  })
  pgm.createIndex('ses_email_stats', ['message_id'])
  pgm.createIndex('ses_email_stats', ['sent_at'])
  pgm.createIndex('ses_email_stats', ['opened_at'])
  pgm.createIndex('ses_email_stats', ['clicked_at'])
};

exports.down = pgm => {
  pgm.dropTable('ses_email_stats')
};
