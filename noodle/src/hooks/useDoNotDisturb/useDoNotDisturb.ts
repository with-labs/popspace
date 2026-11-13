import { RoomStateShape, useRoomStore } from '@api/useRoomStore';

const selectIsDoNotDisturb = (userId?: string) => (room: RoomStateShape) => {
  const id = userId ?? (room.sessionId ? room.sessionLookup[room.sessionId] : undefined);
  return !!(id && room.users[id]?.participantState?.doNotDisturb);
};

/** Whether a user (the current user if none is given) is in do not disturb mode */
export function useIsDoNotDisturb(userId?: string) {
  return useRoomStore(selectIsDoNotDisturb(userId));
}

/** Non-hook version for the current user, for use outside React */
export function isDoNotDisturb() {
  return selectIsDoNotDisturb()(useRoomStore.getState());
}
