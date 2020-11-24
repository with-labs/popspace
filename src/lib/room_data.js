const Aws = require("aws-sdk");

class RoomData {
  constructor() {

  }

  async init() {
    this.dynamo = new Aws.DynamoDB({
      accessKeyId: process.env.WITH_DYNAMO_DB_ACCESS_KEY,
      secretAccessKey: process.env.WITH_DYNAMO_DB_SECRET_KEY,
      region: process.env.WITH_DYNAMO_DB_REGION
    });
    this.documentClient = new Aws.DynamoDB.DocumentClient({service: this.dynamo});
  }

  async createRoomStatesTable() {
    return this.createTable({
      TableName: "room_states",
      KeySchema: [
        { AttributeName: "room_id", KeyType: "HASH"},
      ],
      AttributeDefinitions: [
        // e.g. wallpaperUrl, displayName
        { AttributeName: "state", AttributeType: "S" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    })
  }

  async createWidgetStatesTable() {
    return this.createTable({
      TableName: "widget_data",
      KeySchema: [
        { AttributeName: "widget_id", KeyType: "HASH"},
      ],
      AttributeDefinitions: [
        // structureless blob for now
        { AttributeName: "data", AttributeType: "S" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    })
  }

  async createWidgetRoomStatesTable() {
    return this.createTable({
      TableName: "room_widget_states",
      KeySchema: [
        { AttributeName: "room_id", KeyType: "HASH"},
        { AttributeName: "widget_id", KeyType: "RANGE"},
      ],
      AttributeDefinitions: [
        // structureless blob for now
        { AttributeName: "state", AttributeType: "S" }
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
          log.app.warn("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
          reject(err)
        } else {
          log.app.info("Created table. Table description JSON:", JSON.stringify(data, null, 2));
          resolve(data)
        }
      });
    })
  }

  async deleteEntry(params) {
    return new Promise((resolve, reject) => {
      this.documentClient.delete(params, (err, data) => {
        if (err) {
          console.error("Unable to delete entry. Error JSON:", JSON.stringify(err, null, 2));
          reject(err)
        } else {
          console.log("Deleted entry. Response:", JSON.stringify(data, null, 2));
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
      TableName: 'room_states',
      Key: {
        room_id: roomId
      }
    })
  }

  // private
  async addWidget(widgetId, roomId, data, state) {
    const dataItem = {
      widget_id: {S: widget_id},
      data: {  S: data },
    }
    const stateItem = {
      widget_id: widgetId,
      room_id: roomId,
      state: state
    }
    const putParams = {
      Item: item,
      TableName: "sendable_emails"
    }
    return Promise.all([
      new Promise((resolve, reject) => {
        this.dynamo.putItem(putParams, (err, data) => {
          if(err) {
            return reject(data)
          } else {
            return resolve(data)
          }
        })
      }),
      new Promise((resolve, reject) => {
        this.dynamo.putItem(putParams, (err, data) => {
          if(err) {
            return reject(data)
          } else {
            return resolve(data)
          }
        })
      })
    ])
  }

}

module.exports = new RoomData()
