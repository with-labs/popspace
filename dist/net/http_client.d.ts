declare class HttpClient {
    actor: any;
    certificate: any;
    host: any;
    port: any;
    session: any;
    token: any;
    constructor(host: any, certificate: any, port: any);
    post(endpoint: any, data: any): Promise<unknown>;
    forceLogIn(actor: any): Promise<{
        session: any;
        token: any;
    }>;
    setSession(session: any): Promise<{
        session: any;
        token: any;
    }>;
}
export default HttpClient;
