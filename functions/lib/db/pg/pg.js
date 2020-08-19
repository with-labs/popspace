/*
Massive.js is a lightweight query builder for Node.js

Why didn't we choose a heavy-duty ORM (Sequelize) or something even lighter (node-postgres)?

Argument against heavy-duty ORM:
ORMs take over and offer opinionated frameworks: migrations, models, query DSL.
I've had lots of experience with ORMs, and most of the time they don't get in the way.
However, when they do, it's pretty bad; they can also obscure the power of SQL,
and encourage less efficient styles than what you can get with raw SQL.
Models can be limiting and encourage bad data hygene; eager loading can
be rather complex and limited, e.g. selecting subsets of columns is very tricky
and rarely supported by ORM frameworks, though often highly necessary (e.g.
in the case of caching, where you want to minimize the memory footprint).
ORM models are often used sporadically, and the same queries are built over and over,
since the DSL encourages ad-hoc queries, vs building methods on models -
which can make optimiziating harder (arguably, it's a matter of culture).

On the other hand, ORMs don't offer much more developer efficiency than
a basic query builder that parses into data structures, rather than models.

Argument against ultra-lightweight frameworks:
The bare minimum I want to work with data is parsing the results from SQL into
something that can be used in the language. In js, that means getting an Object back.
That's just about all that massivejs does on top of a basic connection framework to
postgres. It also takes care of managing connection pools, which is not that much
extra weight for a framework to pull
*/
const massive = require('massive');
const monitor = require('pg-monitor');
const moment = require("moment")

const overridePgTimestampConversion = () => {
  // node-postgres, which is what massivejs is based on,
  // performs time zone conversion.
  // this screws everything up if you store dates in UTC
  // what we want is to return the raw date.
  const types = require('pg').types;
  const timestampOID = 1114;
  types.setTypeParser(1114, function(stringValue) {
    return stringValue;
  })
}

let db = null

class Pg {
  async init() {
    if(db) {
      return db
    }
    overridePgTimestampConversion()
    // Require it here to make sure environment is set up with Netlify.
    // We inject env vars manually after the function starts,
    // but after module dependencies are loaded
    // so unless we access process.env after dependencies are loaded,
    // we won't have the credentials.
    const config = require('./config.js')
    db = await massive(config)
    monitor.attach(db.driverConfig);
    return db
  }

  async tearDown() {
    if(db) {
      monitor.detach()
      await db.pgp.end()
      db = null
    }
  }
}


module.exports = new Pg()
