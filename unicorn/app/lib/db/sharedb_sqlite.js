const DB = require('sharedb').DB;
const sqlite = require('better-sqlite3');

// SQLite-backed ShareDB database

function SQLiteDB(options) {
  if (!(this instanceof SQLiteDB)) return new SQLiteDB(options);
  DB.call(this, options);

  this.closed = false;

  this.db = sqlite(options.filename);
  this.db.prepare(`CREATE TABLE IF NOT EXISTS unicorn.snapshots (
    id TEXT NOT NULL,
    version INTEGER NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    meta TEXT NOT NULL,
    PRIMARY KEY (id, version)
  )`).run();
  this.db.prepare(`CREATE TABLE IF NOT EXISTS unicorn.ops (
    id TEXT NOT NULL,
    version INTEGER NOT NULL,
    op TEXT NOT NULL,
    PRIMARY KEY (id, version)
  )`).run();
};
module.exports = SQLiteDB;

SQLiteDB.prototype = Object.create(DB.prototype);

SQLiteDB.prototype.close = function(callback) {
  this.closed = true;
  this.db.close();

  if (callback) callback();
};

function rollback(client, done) {
  client.query('ROLLBACK', function(err) {
    return done(err);
  })
}

/**
 * normalizes an id to an integer, allowing compatibility
 * with our current usage which involves passing bigint widget ids
 * as primary keys for documents - this unintentionally enforces that
 * ids are always integers
 */
function idToInt(id) {
  if (typeof id === 'number') return id;
  if (shared.db.serialization.detectBigInt(id)) {
    return shared.db.serialization.parseBigInt(id);
  }
  // fallback to hashing algorithm
  if (typeof id === 'string') {
    var hash = 0, i, chr;
    if (id.length === 0) return hash;
    for (i = 0; i < id.length; i++) {
      chr = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  throw new Error('Invalid ID: Cannot parse ' + id + ' to integer');
}

// Persists an op and snapshot if it is for the next version. Calls back with
// callback(err, succeeded)
SQLiteDB.prototype.commit = function(collection, id, op, snapshot, options, callback) {
  let intId = idToInt(id);
  /*
   * op: CreateOp {
   *   src: '24545654654646',
   *   seq: 1,
   *   v: 0,
   *   create: { type: 'http://sharejs.org/types/JSONv0', data: { ... } },
   *   m: { ts: 12333456456 } }
   * }
   * snapshot: SqliteSnapshot
   */
  const rows = db.prepare(`WITH snapshot_id AS (
    INSERT INTO unicorn.snapshots (collection, doc_id, doc_type, version, data)
    SELECT $collection::varchar collection, $id doc_id, $doc_type doc_type, $version v, $data d
    WHERE $version = (
      SELECT version+1 v
      FROM unicorn.snapshots
      WHERE collection = $collection AND doc_id = $id
      FOR UPDATE
    ) OR NOT EXISTS (
      SELECT 1
      FROM unicorn.snapshots
      WHERE collection = $collection AND doc_id = $id
      FOR UPDATE
    )
    ON CONFLICT (collection, doc_id) DO UPDATE SET version = $version, data = $data, doc_type = $doc_type
    RETURNING version
  )
  INSERT INTO unicorn.ops (collection, doc_id, version, operation)
  SELECT $collection::varchar collection, $id doc_id, $version v, $op operation
  WHERE (
    $3 = (
      SELECT max(version)+1
      FROM unicorn.ops
      WHERE collection = $collection and doc_id = $id
    ) OR NOT EXISTS (
      SELECT 1
      FROM unicorn.ops
      WHERE collection = $collection and doc_id = $id
    )
  ) AND EXISTS (SELECT 1 FROM snapshot_id)
  RETURNING version`).all({
    collection,
    id: intId,
    version: snapshot.v,
    data: snapshot.data,
    doc_type: snapshot.type,
    op
  })
  callback(null, !!rows?.length);
};

// Get the named document from the database. The callback is called with (err,
// snapshot). A snapshot with a version of zero is returned if the docuemnt
// has never been created in the database.
SQLiteDB.prototype.getSnapshot = function(collection, id, fields, options, callback) {
  let intId = idToInt(id);
  const row = this.db.prepare(`SELECT version, doc_type, data, meta FROM unicorn.snapshots WHERE collection = $collection AND doc_id = $id`).get({
    collection,
    id: intId
  });
  const snapshot = row ? new SqliteSnapshot(
    intId,
    row.version,
    row.doc_type,
    row.data,
    undefined
  ) : new SqliteSnapshot(
    intId,
    0,
    null,
    undefined,
    undefined
  )
  callback(null, snapshot);
};

// Get operations between [from, to) noninclusively. (Ie, the range should
// contain start but not end).
//
// If end is null, this function should return all operations from start onwards.
//
// The operations that getOps returns don't need to have a version: field.
// The version will be inferred from the parameters if it is missing.
//
// Callback should be called as callback(error, [list of ops]);
SQLiteDB.prototype.getOps = function(collection, id, from, to, options, callback) {
  let intId = idToInt(id);
  let rows = [];
  if (to) {
    rows = this.db.prepare(
      `SELECT operation FROM unicorn.ops WHERE collection = $collection AND doc_id = $id AND version > $from AND version <= $to ORDER BY version ASC`
    ).all({
      collection,
      id: intId,
      from,
      to
    })
  } else {
    rows = this.db.prepare(
      `SELECT version, operation FROM unicorn.ops WHERE collection = $collection AND doc_id = $id AND version > $from ORDER BY version ASC`
    ).all({
      collection,
      id: intId,
      from
    });
  }
  callback(null, rows.map(row => row.operation));
};

function SqliteSnapshot(id, version, type, data, meta) {
  this.id = id;
  this.v = parseInt(version);
  this.type = type;
  this.data = data;
  this.m = meta;
}
