import { RoomPositionState } from './types/common';

export const areTransformsEqual = (t1: RoomPositionState, t2: RoomPositionState) => {
  return (
    t1.position?.x === t2.position?.x &&
    t1.position?.y === t2.position?.y &&
    t1.size?.width === t2.size?.width &&
    t1.size?.height === t2.size?.height
  );
};
