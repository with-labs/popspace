/*
  Fork from
  https://github.com/plotdb/sharedb-postgres/blob/master/index.js

  primarily, we don't like the default table names:
  ops and snapshots
  and prefer something more descriptive.

  I also changed the integer versions to bigint
*/

const DB = require('sharedb').DB;
const pg = require('pg');

// Postgres-backed ShareDB database

function PostgresDB(options) {
  if (!(this instanceof PostgresDB)) return new PostgresDB(options);
  DB.call(this, options);

  this.closed = false;

  this.pg_config = options;
  this.pool = new pg.Pool(options);
};
module.exports = PostgresDB;

PostgresDB.prototype = Object.create(DB.prototype);

PostgresDB.prototype.close = function(callback) {
  this.closed = true;
  this.pool.end();

  if (callback) callback();
};

function rollback(client, done) {
  client.query('ROLLBACK', function(err) {
    return done(err);
  })
}

// Persists an op and snapshot if it is for the next version. Calls back with
// callback(err, succeeded)
PostgresDB.prototype.commit = function(collection, id, op, snapshot, options, callback) {
  /*
   * op: CreateOp {
   *   src: '24545654654646',
   *   seq: 1,
   *   v: 0,
   *   create: { type: 'http://sharejs.org/types/JSONv0', data: { ... } },
   *   m: { ts: 12333456456 } }
   * }
   * snapshot: PostgresSnapshot
   */
  this.pool.connect(function(err, client, done) {
    if (err) {
      done(client);
      callback(err);
      return;
    }
    /*
    * This query uses common table expression to upsert the snapshot table
    * (iff the new version is exactly 1 more than the latest table or if
    * the document id does not exists)
    *
    * It will then insert into the ops table if it is exactly 1 more than the
    * latest table or it the first operation and iff the previous insert into
    * the snapshot table is successful.
    *
    * This result of this query the version of the newly inserted operation
    * If either the ops or the snapshot insert fails then 0 rows are returned
    *
    * If 0 zeros are return then the callback must return false
    */
   const query = {
     name: 'sdb-commit-op-and-snap',
     text: `WITH snapshot_id AS (
  INSERT INTO unicorn.snapshots (collection, doc_id, doc_type, version, data)
  SELECT $1::varchar collection, $2 doc_id, $4 doc_type, $3 v, $5 d
  WHERE $3 = (
    SELECT version+1 v
    FROM unicorn.snapshots
    WHERE collection = $1 AND doc_id = $2
    FOR UPDATE
  ) OR NOT EXISTS (
    SELECT 1
    FROM unicorn.snapshots
    WHERE collection = $1 AND doc_id = $2
    FOR UPDATE
  )
  ON CONFLICT (collection, doc_id) DO UPDATE SET version = $3, data = $5, doc_type = $4
  RETURNING version
)
INSERT INTO unicorn.ops (collection, doc_id, version, operation)
SELECT $1::varchar collection, $2 doc_id, $3 v, $6 operation
WHERE (
  $3 = (
    SELECT max(version)+1
    FROM unicorn.ops
    WHERE collection = $1 and doc_id = $2
  ) OR NOT EXISTS (
    SELECT 1
    FROM unicorn.ops
    WHERE collection = $1 and doc_id = $2
  )
) AND EXISTS (SELECT 1 FROM snapshot_id)
RETURNING version`,
    values: [collection, id, snapshot.v, snapshot.type, snapshot.data, op]
   };
   client.query(query, (err, res) => {
     if (err) {
       callback(err);
     } else if (res.rows.length === 0) {
       done(client);
       callback(null, false);
     } else {
       done(client);
       callback(null, true);
     }
   })
  })
};

// Get the named document from the database. The callback is called with (err,
// snapshot). A snapshot with a version of zero is returned if the docuemnt
// has never been created in the database.
PostgresDB.prototype.getSnapshot = function(collection, id, fields, options, callback) {
  this.pool.connect(function(err, client, done) {
    if (err) {
      done(client);
      callback(err);
      return;
    }
    client.query(
      `SELECT version, data, doc_type FROM unicorn.snapshots WHERE collection = $1 AND doc_id = $2 LIMIT 1`,
      [collection, id],
      function(err, res) {
        done();
        if (err) {
          callback(err);
          return;
        }
        if (res.rows.length) {
          var row = res.rows[0]
          var snapshot = new PostgresSnapshot(
            id,
            row.version,
            row.doc_type,
            row.data,
            undefined // TODO: metadata
          )
          callback(null, snapshot);
        } else {
          var snapshot = new PostgresSnapshot(
            id,
            0,
            null,
            undefined,
            undefined
          )
          callback(null, snapshot);
        }
      }
    )
  })
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
PostgresDB.prototype.getOps = function(collection, id, from, to, options, callback) {
  this.pool.connect(function(err, client, done) {
    if (err) {
      done(client);
      callback(err);
      return;
    }
    let cmd = `SELECT version, operation FROM unicorn.ops WHERE collection = $1 AND doc_id = $2 AND version > $3`
    let params = [collection, id, from];
    if (to || to === 0) {
      cmd += ' AND version <= $4';
      params.push(to);
    }
    cmd += ' order by version';

    client.query(
      cmd,
      params,
      function(err, res) {
        done();
        if (err) {
          callback(err);
          return;
        }
        callback(null, res.rows.map(function(row) {
          return row.operation;
        }));
      }
    )
  })
};

function PostgresSnapshot(id, version, type, data, meta) {
  this.id = id;
  this.v = parseInt(version);
  this.type = type;
  this.data = data;
  this.m = meta;
}
