const Aws = require("aws-sdk");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'EmailDynam... Remove this comment to see the full error message
const EmailDynamo = require("./email_dynamo")

class Dynamo {
  documentClient: any;
  dynamo: any;
  email: any;
  constructor() {
  }

  async init() {
    if(this.dynamo) {
      return
    }
    this.dynamo = new Aws.DynamoDB({
      accessKeyId: process.env.WITH_DYNAMO_DB_ACCESS_KEY,
      secretAccessKey: process.env.WITH_DYNAMO_DB_SECRET_KEY,
      region: process.env.WITH_DYNAMO_DB_REGION
    })
    this.documentClient = new Aws.DynamoDB.DocumentClient({service: this.dynamo})
    this.email = new EmailDynamo(this.dynamo, this.documentClient)
  }
}

module.exports = new Dynamo()
