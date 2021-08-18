import { Room } from '@prisma/client';
export declare class Memberships {
    isMember(actorId: bigint, roomId: bigint): Promise<boolean>;
    getMembership(actorId: bigint, roomId: bigint): import(".prisma/client").Prisma.Prisma__RoomMembershipClient<import(".prisma/client").RoomMembership>;
    getRoomMembers(roomId: bigint): any;
    revokeMembership(roomId: bigint, actorId: bigint): Promise<import(".prisma/client").Prisma.BatchPayload>;
    forceMembership: (room: Room, actor: any) => Promise<import(".prisma/client").RoomMembership | {
        membership: import(".prisma/client").RoomMembership;
        error?: undefined;
    } | {
        error: string;
        membership?: undefined;
    }>;
}
declare const _default: Memberships;
export default _default;
