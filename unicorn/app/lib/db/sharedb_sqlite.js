const DB = require('sharedb').DB;
const sqlite = require('better-sqlite3');

// SQLite-backed ShareDB database

function SQLiteDB(options) {
  if (!(this instanceof SQLiteDB)) return new SQLiteDB(options);
  DB.call(this, options);

  this.closed = false;

  this.db = sqlite(options.filename, {
    fileMustExist: false
  });
  this.db.prepare(`CREATE TABLE IF NOT EXISTS snapshots (
    collection TEXT NOT NULL,
    doc_id TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    version INTEGER NOT NULL,
    data TEXT NOT NULL,
    meta TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection, doc_id)
  )`).run();
  this.db.prepare(`CREATE TABLE IF NOT EXISTS ops (
    collection TEXT NOT NULL,
    doc_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    operation TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection, doc_id, version)
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
 * with our current usage which involves passing int widget ids
 * as primary keys for documents - this unintentionally enforces that
 * ids are always integers
 */
function idToInt(id) {
  if (typeof id === 'number') return id;
  if (typeof id === 'string') return parseInt(id);
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
  try {
    const maxVersionResult = this.db.prepare(
      `SELECT max(version) AS max_version FROM ops where COLLECTIOn = $collection AND doc_id = $id`
    ).get({
      collection,
      id: intId
    });

    const maxVersion = maxVersionResult.max_version || 0;
    if (snapshot.v !== maxVersion + 1) {
      return callback(null, false);
    }

    const transaction = this.db.transaction(() => {
      this.db.prepare(
        `INSERT INTO ops (collection, doc_id, version, operation) VALUES ($collection, $id, $version, $operation)`
      ).run({
        collection,
        id: intId,
        version: snapshot.v,
        operation: JSON.stringify(op)
      });
      if (snapshot.v === 1) {
        this.db.prepare(
          `INSERT INTO snapshots (collection, doc_id, doc_type, version, data) VALUES ($collection, $id, $type, $version, $data)`
        ).run({
          collection,
          id: intId,
          type: snapshot.type,
          version: snapshot.v,
          data: JSON.stringify(snapshot.data)
        });
      } else {
        const updated = this.db.prepare(
          `UPDATE snapshots SET doc_type = $type, version = $version, data = $data WHERE collection = $collection AND doc_id = $id AND version = ($version - 1)`
        ).run({
          collection,
          id: intId,
          version: snapshot.v,
          data: JSON.stringify(snapshot.data),
          type: snapshot.type
        });
        // if (updated.changes !== 1) {
        //   return callback(null, false);
        // }
      }
    });
    transaction();
    callback(null, true);
  } catch (e) {
    return callback(e, false);
  }
};

// Get the named document from the database. The callback is called with (err,
// snapshot). A snapshot with a version of zero is returned if the docuemnt
// has never been created in the database.
SQLiteDB.prototype.getSnapshot = function(collection, id, fields, options, callback) {
  let intId = idToInt(id);
  const row = this.db.prepare(`SELECT version, doc_type, data, meta FROM snapshots WHERE collection = $collection AND doc_id = $id`).get({
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
      `SELECT operation FROM ops WHERE collection = $collection AND doc_id = $id AND version > $from AND version <= $to ORDER BY version ASC`
    ).all({
      collection,
      id: intId,
      from,
      to
    })
  } else {
    rows = this.db.prepare(
      `SELECT version, operation FROM ops WHERE collection = $collection AND doc_id = $id AND version > $from ORDER BY version ASC`
    ).all({
      collection,
      id: intId,
      from
    });
  }
  callback(null, rows.map(row => row.operation ? JSON.parse(row.operation) : null));
};

function SqliteSnapshot(id, version, type, data, meta) {
  this.id = id;
  this.v = parseInt(version);
  this.type = type;
  this.data = data ? JSON.parse(data) : data;
  this.m = meta;
}
