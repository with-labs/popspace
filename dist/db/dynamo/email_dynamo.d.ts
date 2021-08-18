export declare class EmailDynamo {
    documentClient: any;
    dynamo: any;
    constructor(dynamo: any, documentClient: any);
    createEmailsTable(): Promise<unknown>;
    listTables(limit?: number): Promise<unknown>;
    deleteEmail(name: any, version: any): Promise<unknown>;
    deleteEmailEntirely(name: any): Promise<void>;
    createOrUpdateEmail(name: any, subject: any, html: any, plaintext: any): Promise<unknown>;
    getLatestEmail(name: any): Promise<any>;
    getEmailVersionHistory(name: any): Promise<unknown>;
    emailList(): Promise<unknown>;
    addEmail(name: any, version: any, subject: any, html: any, plaintext: any): Promise<unknown>;
}
export default EmailDynamo;
