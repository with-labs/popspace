import { Room } from '@prisma/client';
export declare class Permissions {
    canEnter(actor: any, room: Room): Promise<boolean>;
    isMemberOrCreator(actor: any, room: Room): Promise<boolean>;
    isMember(actor: any, room: Room): Promise<boolean>;
    isCreator(actor: any, room: any): Promise<boolean>;
}
declare const _default: Permissions;
export default _default;
