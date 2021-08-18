import { Actor, Room, Session } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
declare module 'express' {
    interface Request {
        actor?: Actor;
        session?: Session;
        room?: Room;
        realIp?: string;
    }
}
declare const middleware: {
    getActor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getIp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requireActor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    roomFromRoute: (req: Request, res: Response, next: any) => Promise<any>;
    requireRoom: (req: Request, res: Response, next: any) => Promise<any>;
    requireRoomCreator: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requireRoomMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requireRoomMemberOrCreator: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requireAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default middleware;
