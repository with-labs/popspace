const Aws = require("aws-sdk");

const tableName = (tableNickname) => {
  return `${process.env.NODE_ENV}_${tableNickname}`
}

class RoomData {
  constructor() {
    // TODO: extract shared dynamo logic
    // Separate create/delete table logic from queries
    // this should be the bridge between dynamo/postgres, not a dynamo access helper
  }

  async init() {
    this.dynamo = new Aws.DynamoDB({
      accessKeyId: process.env.WITH_DYNAMO_DB_ACCESS_KEY,
      secretAccessKey: process.env.WITH_DYNAMO_DB_SECRET_KEY,
      region: process.env.WITH_DYNAMO_DB_REGION
    });
    this.documentClient = new Aws.DynamoDB.DocumentClient({service: this.dynamo});
  }

  async getWidgetsInRoom(roomId) {
    const widgets = await shared.db.pg.massive.query(`
      SELECT
        widgets.id AS id, widgets._type as type
      FROM
        widgets JOIN room_widgets ON widgets.id = room_widgets.widget_id
      WHERE
        room_widgets.room_id = $1
        AND
        widgets.deleted_at IS NULL
        AND
        widgets.archived_at IS NULL
    `, [roomId])
    const widgetsById = {}
    const widgetIds = widgets.map((w) => {
      widgetsById[w.id] = w
      return w.id
    })
    const widgetStates = await this.getWidgetStates(widgetIds)
    const roomStates = await this.getWidgetRoomStates(widgetIds, roomId)
    for(const widgetState of widgetStates) {
      const widget = widgetsById[data.widget_id]
      widget.widgetState = widgetState
    }
    for(const roomState of roomStates) {
      let widget = widgetsById[roomState.widget_id]
      widget.roomState = roomState
    }
    return widgets
  }

  async getWidgetStates(widgetIds) {
    const requestParams = {
      TableName: tableName('widget_data'),
      KeyConditionExpression: "#widget_id = :widget_id",
      ExpressionAttributeNames:{
          "#widget_id": "widget_id"
      },
      ExpressionAttributeValues: {
          ":widget_id": widgetIds
      },
      ScanIndexForward: false
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

  async getWidgetRoomStates(widgetIds, roomId) {
    const requestParams = {
      TableName: tableName('widget_data'),
      KeyConditionExpression: "#widget_id = :widget_id AND #room_id = :room_id",
      ExpressionAttributeNames:{
        "#widget_id": "widget_id",
        "#room_id": "room_id"
      },
      ExpressionAttributeValues: {
        ":widget_id": widgetIds,
        ":room_id": roomId
      },
      ScanIndexForward: false
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

  async createRoomStatesTable() {
    return this.createTable({
      TableName: tableName("room_states"),
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
      TableName: tableName("widget_data"),
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
      TableName: tableName("room_widget_states"),
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
      TableName: tableName('room_states'),
      Key: {
        room_id: roomId
      }
    })
  }

  async addWidget(widgetId, roomId, data, state) {
    const dataItem = {
      widget_id: { S: widgetId },
      data: { S: data },
    }
    const stateItem = {
      widget_id: { S: widgetId },
      room_id: {S: roomId},
      state: {S: state}
    }
    return Promise.all([
      new Promise((resolve, reject) => {
        this.dynamo.putItem({item: dataItem, TableName: tableName('widget_data')}, (err, data) => {
          if(err) {
            return reject(data)
          } else {
            return resolve(data)
          }
        })
      }),
      new Promise((resolve, reject) => {
        this.dynamo.putItem({item: stateItem, TableName: tableName('room_widget_states')}, (err, data) => {
          if(err) {
            return reject(data)
          } else {
            return resolve(data)
          }
        })
      })
    ])
  }

  async updateWidgetData(widgetId, data) {

  }

  async updateWidgetState(widgetId, state) {

  }

}

module.exports = RoomData
