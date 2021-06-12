const ROOM_STATES_TABLE = 'noodle_room_states'
const WIDGET_STATES_TABLE = 'noodle_widget_states'
const PARTICIPANT_STATES_TABLE = 'noodle_participant_states'
const ROOM_WIDGET_STATES_TABLE = 'noodle_widget_states'
const ROOM_PARTICIPANT_STATES_TABLE = 'noodle_room_participant_states'

class RoomDynamo {
  constructor(dynamo, documentClient) {
    this.dynamo = dynamo
    this.documentClient = documentClient
  }

  async createTables() {
    // TODO: we may want to structure this a bit more similarly to postgres:
    // have migrations live separately from the access logic
    // perhaps it's best to move out table create logic to with-database
    await this.createRoomStatesTable()
    await this.createWidgetStatesTable()
    await this.createWidgetRoomStatesTable()
    await this.createRoomParticipantStatesTable()
    await this.createParticipantStatesTable()
  }

  tableName(tableNickname) {
    return `${process.env.NODE_ENV}_${tableNickname}`
  }

  async getRoomWidgets(roomId, widgets) {
    // dynamo only allows querying 1 primary key at a time
    // we could batch the request as an optimization,
    // but batching has limits we'd need to respect
    // https://www.dynamodbguide.com/working-with-multiple-items/
    // An alternative could be to use range keys,
    // but it seems weird to arbitrarily introduce a static hash key.
    return Promise.all(widgets.map(async (widget) => {
      return this.getRoomWidget(roomId, widget)
    }))
  }

  async getRoomWidget(roomId, widget) {
    const widgetState = await this.getWidgetState(widget.id)
    const roomState = await this.getRoomWidgetState(roomId, widget.id)
    const roomWidget = new shared.models.RoomWidget(roomId, widget, widgetState, roomState, widget.creator_display_name)
    return roomWidget
  }

  async getRoomState(roomId) {
    const entry = await this.getByHash(ROOM_STATES_TABLE, 'room_id', parseInt(roomId))
    if(entry.length > 0) {
      return JSON.parse(entry[0].state)
    }
  }

  async getWidgetState(widgetId) {
    const entry = await this.getByHash(WIDGET_STATES_TABLE, 'widget_id', parseInt(widgetId))
    if(entry.length > 0) {
      return JSON.parse(entry[0].state)
    }
  }

  async getParticipantState(userId) {
    const entry = await this.getByHash(PARTICIPANT_STATES_TABLE, 'user_id', parseInt(userId))
    if(entry.length > 0) {
      return JSON.parse(entry[0].state)
    }
  }

  async getRoomParticipantState(roomId, userId) {
    const entry = await this.getByHashAndRange(
      ROOM_PARTICIPANT_STATES_TABLE,
      'room_id',
      parseInt(roomId),
      'user_id',
      parseInt(userId)
    )
    if(entry.length > 0) {
      return JSON.parse(entry[0].state)
    }
  }

  async getRoomWidgetState(roomId, widgetId) {
    const entry = await this.getByHashAndRange(
      'room_widget_states',
      'room_id',
      parseInt(roomId),
      'widget_id',
      parseInt(widgetId)
    )
    if(entry.length > 0) {
      return JSON.parse(entry[0].state)
    }
  }

  async setWidgetData(widgetId, data) {
    const dataItem = {
      /*
        Dynamo passes numbers as strings through the network
        https://stackoverflow.com/questions/41968654/amazon-dynamodb-storing-integers-as-numbers-vs-strings#:~:text=A%20Number%20can%20have%20up,data%20in%20requests%20and%20replies.
      */
      widget_id: { N: `${widgetId}` },
      state: { S: JSON.stringify(data) },
    }
    return new Promise((resolve, reject) => {
      this.dynamo.putItem({Item: dataItem, TableName: this.tableName(WIDGET_STATES_TABLE)}, (err, data) => {
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }

  async setRoomWidgetState(roomId, widgetId, state) {
    const stateItem = {
      widget_id: { N: `${widgetId}` },
      room_id: {N: `${roomId}`},
      state: {S: JSON.stringify(state)}
    }
    return new Promise((resolve, reject) => {
      this.dynamo.putItem({Item: stateItem, TableName: this.tableName(ROOM_STATES_TABLE)}, (err, data) => {
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }

  async setParticipantState(userId, state) {
    const dataItem = {
      user_id: { N: `${userId}` },
      state: { S: JSON.stringify(state) },
    }
    return new Promise((resolve, reject) => {
      this.dynamo.putItem({Item: dataItem, TableName: this.tableName(PARTICIPANT_STATES_TABLE)}, (err, data) => {
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }

  async setRoomParticipantState(roomId, userId, state) {
    const stateItem = {
      user_id: { N: `${userId}` },
      room_id: {N: `${roomId}`},
      state: {S: JSON.stringify(state)}
    }
    return new Promise((resolve, reject) => {
      this.dynamo.putItem({Item: stateItem, TableName: this.tableName(ROOM_PARTICIPANT_STATES_TABLE)}, (err, data) => {
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }

  async setRoomState(roomId, state) {
    const stateItem = {
      room_id: {N: `${roomId}`},
      state: {S: JSON.stringify(state)}
    }
    return new Promise((resolve, reject) => {
      this.dynamo.putItem({Item: stateItem, TableName: this.tableName(ROOM_STATES_TABLE)}, (err, data) => {
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }

  async updateRoomState(roomId, keyValues) {
    const currentRoomState = await this.getRoomState(roomId)
    const newRoomState = Object.assign(currentRoomState || {}, keyValues)
    return await this.setRoomState(roomId, newRoomState)
  }

  // private
  async createRoomStatesTable() {
    return this.createTable({
      TableName: this.tableName(ROOM_STATES_TABLE),
      KeySchema: [
        { AttributeName: "room_id", KeyType: "HASH"},
      ],
      AttributeDefinitions: [
        { AttributeName: "room_id", AttributeType: "N" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    })
  }

  async createWidgetStatesTable() {
    return this.createTable({
      TableName: this.tableName(WIDGET_STATES_TABLE),
      KeySchema: [
        { AttributeName: "widget_id", KeyType: "HASH"},
      ],
      AttributeDefinitions: [
        { AttributeName: "widget_id", AttributeType: "N"},
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    })
  }

  async createWidgetRoomStatesTable() {
    return this.createTable({
      TableName: this.tableName(ROOM_WIDGET_STATES_TABLE),
      KeySchema: [
        { AttributeName: "room_id", KeyType: "HASH"},
        { AttributeName: "widget_id", KeyType: "RANGE"},
      ],
      AttributeDefinitions: [
        { AttributeName: "room_id", AttributeType: "N" },
        { AttributeName: "widget_id", AttributeType: "N"},
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    })
  }

  async createRoomParticipantStatesTable() {
    return this.createTable({
      TableName: this.tableName(ROOM_PARTICIPANT_STATES_TABLE),
      KeySchema: [
        { AttributeName: "room_id", KeyType: "HASH"},
        { AttributeName: "user_id", KeyType: "RANGE"},
      ],
      AttributeDefinitions: [
        { AttributeName: "room_id", AttributeType: "N" },
        { AttributeName: "user_id", AttributeType: "N"},
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    })
  }

  async createParticipantStatesTable() {
    return this.createTable({
      TableName: this.tableName(ROOM_PARTICIPANT_STATES_TABLE),
      KeySchema: [
        { AttributeName: "user_id", KeyType: "HASH"}
      ],
      AttributeDefinitions: [
        { AttributeName: "user_id", AttributeType: "N"},
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    })
  }


  async createTable(params) {
    return new Promise((resolve, reject) => {
      this.dynamo.createTable(params, (err, data) => {
        if (err) {
          log.database.warn("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
          reject(err)
        } else {
          log.database.info("Created table. Table description JSON:", JSON.stringify(data, null, 2));
          resolve(data)
        }
      });
    })
  }

  async deleteEntry(params) {
    return new Promise((resolve, reject) => {
      this.documentClient.delete(params, (err, data) => {
        if (err) {
          log.database.error("Unable to delete entry. Error JSON:", JSON.stringify(err, null, 2));
          reject(err)
        } else {
          log.database.info("Deleted entry. Response:", JSON.stringify(data, null, 2));
          resolve(data)
        }
      })
    })
  }

  async listTables(limit=256) {
    return new Promise((resolve, reject) => {
      this.dynamo.listTables({}, (err, data) => {
        if(err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  async deleteRoomState(roomId) {
    await this.deleteEntry({
      TableName: this.tableName(ROOM_STATES_TABLE),
      Key: {
        room_id: roomId
      }
    })
  }

  async deleteWidget(roomIds, widgetId) {
    const promises = roomIds.map((rid) => {
      return this.deleteEntry({
        TableName: this.tableName(ROOM_WIDGET_STATES_TABLE),
        Key: {
          room_id: roomId,
          widget_id: widgetId
        }
      })
    })

    promises.push(this.deleteEntry({
      TableName: this.tableName(WIDGET_STATES_TABLE),
      Key: {
        widget_id: widgetId
      }
    }))

    return await Promise.all(promises)
  }

  async deleteParticipant(roomId, userId) {
    return this.deleteEntry({
      TableName: this.tableName(ROOM_PARTICIPANT_STATES_TABLE),
      Key: {
        room_id: roomId,
        user_id: userId
      }
    })
  }

  async getByHash(tableNickname, hashKey, hashValue) {
    const requestParams = {
      TableName: this.tableName(tableNickname),
      KeyConditionExpression: "#attribute = :value",
      ExpressionAttributeNames:{
          "#attribute": hashKey
      },
      ExpressionAttributeValues: {
          ":value": hashValue
      }
    }
    return new Promise((resolve, reject) => {
      this.documentClient.query(requestParams, (err, data) => {
        if(err) {
          reject(err)
        } else {
          resolve(data.Items)
        }
      })
    })
  }

  async getByHashAndRange(tableNickname, hashKey, hashValue, rangeKey, rangeValue) {
    const requestParams = {
      TableName: this.tableName(tableNickname),
      KeyConditionExpression: "#hkey = :hvalue AND #rkey = :rvalue",
      ExpressionAttributeNames:{
        "#hkey": hashKey,
        "#rkey": rangeKey
      },
      ExpressionAttributeValues: {
        ":hvalue": hashValue,
        ":rvalue": rangeValue
      }
    }
    return new Promise((resolve, reject) => {
      this.documentClient.query(requestParams, (err, data) => {
        if(err) {
          reject(err)
        } else {
          resolve(data.Items)
        }
      })
    })
  }




}

module.exports = RoomDynamo
