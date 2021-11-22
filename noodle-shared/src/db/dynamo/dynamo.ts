import * as Aws from 'aws-sdk';

import EmailDynamo from './email_dynamo';

export class Dynamo {
  documentClient: any;
  dynamo: any;
  email: any;
  constructor() {}

  async init() {
    if (this.dynamo) {
      return;
    }
    this.dynamo = new Aws.DynamoDB({
      accessKeyId: process.env.WITH_DYNAMO_DB_ACCESS_KEY,
      secretAccessKey: process.env.WITH_DYNAMO_DB_SECRET_KEY,
      region: process.env.WITH_DYNAMO_DB_REGION,
    });
    this.documentClient = new Aws.DynamoDB.DocumentClient({
      service: this.dynamo,
    });
    this.email = new EmailDynamo(this.dynamo, this.documentClient);
  }
}

export default new Dynamo();
