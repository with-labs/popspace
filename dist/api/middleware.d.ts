import { NextFunction, Request, Response } from 'express';
declare module 'express' {
    interface Request {
        actor: any;
        session: any;
    }
}
declare const middleware: {
    getActor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getIp: (req: any, res: any, next: any) => Promise<void>;
    requireActor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    roomFromRoute: (req: any, res: any, next: any) => Promise<any>;
    requireRoom: (req: any, res: any, next: any) => Promise<any>;
    requireRoomCreator: (req: any, res: any, next: any) => Promise<any>;
    requireRoomMember: (req: any, res: any, next: any) => Promise<any>;
    requireRoomMemberOrCreator: (req: any, res: any, next: any) => Promise<any>;
    requireAdmin: (req: any, res: any, next: any) => Promise<any>;
};
export default middleware;
