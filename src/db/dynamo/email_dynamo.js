class EmailDynamo {
  constructor(dynamo, documentClient) {
    this.dynamo = dynamo
    this.documentClient = documentClient
  }

  async createEmailsTable() {
    const params = {
      TableName: "sendable_emails",
      KeySchema: [
        { AttributeName: "name", KeyType: "HASH"},  //Partition key
        { AttributeName: "version", KeyType: "RANGE" }  //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: "name", AttributeType: "S" },
        { AttributeName: "version", AttributeType: "N" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    };
    return new Promise((resolve, reject) => {
      this.dynamo.createTable(params, (err, data) => {
        if (err) {
          console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
          reject(err)
        } else {
          console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
          resolve(data)
        }
      });
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

  async deleteEmail(name, version) {
    const params = {
      TableName: 'sendable_emails',
      Key: {
        name: name,
        version: version
      }
    }
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

  async deleteEmailEntirely(name) {
    const emailHistory = await this.getEmailVersionHistory(name)
    for(const emailEntry of emailHistory) {
      await this.deleteEmail(name, emailEntry.version)
    }
  }

  async createOrUpdateEmail(name, subject, html, plaintext) {
    let version = 0
    try {
      const lastVersion = await this.getLatestEmail(name)
      if(lastVersion) {
        version = parseInt(lastVersion.version) + 1

      }
    } catch (e){
      // guess it's version 0
    }
    return await this.addEmail(name, version, subject, html, plaintext)
  }

  async getLatestEmail(name) {
    const sortedHistory = await this.getEmailVersionHistory(name)
    return sortedHistory[0]
  }

  async getEmailVersionHistory(name) {
    const requestParams = {
      TableName: 'sendable_emails',
      KeyConditionExpression: "#name_attribute = :name_value",
      ExpressionAttributeNames:{
          "#name_attribute": "name"
      },
      ExpressionAttributeValues: {
          ":name_value": name
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

  async emailList() {
    const params = {
      TableName : 'sendable_emails',
      AttributesToGet: ["name"]
    }
    return new Promise((resolve, reject) => {
      this.documentClient.scan(params, function(err, data) {
         if (err) reject(err)
         else {
          const names = new Set()
          data.Items.map((item) => (names.add(item.name)))
          resolve([...names])
        }
      });
    })
  }

  // private
  async addEmail(name, version, subject, html, plaintext) {
    const item = {
      name: {S: name},
      version: {  N: `${version}` },
      subject: {S: subject},
      html: {S: html},
      plaintext: {S: plaintext}
    }
    const putParams = {
      Item: item,
      TableName: "sendable_emails"
    }
    return new Promise((resolve, reject) => {
      this.dynamo.putItem(putParams, (err, data) => {
        if(err) {
          return reject(data)
        } else {
          return resolve(data)
        }
      })
    })
  }

}

module.exports = EmailDynamo
