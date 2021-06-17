class MassiveJsAdapter {
  constructor() {
    if(process.env.NODE_ENV != 'test') {
      throw "Refusing to connect to non-test database"
    }
  }
  build(tableName, props) {
    return props
  }
  async save(props, tableName) {
    const existing = await shared.db.pg.massive[tableName].findOne(props)
    if(existing) {
      return existing
    }
    // https://massivejs.org/docs/options-objects#onconflict
    return shared.db.pg.massive[tableName].insert(props, {
      onConflict: {
        target: "id",
        action: "update"
      }
    })
  }
  async destroy(model, tableName) {
    return shared.db.pg.massive[tableName].destroy(model)
  }
  get(model, attr, tableName) {
    return model[attr]
  }
  set(props, model, tableName) {
    return Object.assign(model, props)
  }
}

const init = () => {
  /*
    TODO: I think it's best to get rid of factory girl and just
    directly write to the test database.

    factory-girl has caused some inconsistencies between runs
    (
      sequences not properly resetting, for example,
      or race conditions for IDs.
      https://withlabs.slack.com/archives/C017M659MKP/p1623878527448500?thread_ts=1623877108.445300&cid=C017M659MKP
    )
  */
  shared.test.factory.setAdapter(new MassiveJsAdapter());

  require("./factory_actor")
  require("./factory_session")
  require("./factory_room")
  require("./factory_room_membership")
}

module.exports = init;
