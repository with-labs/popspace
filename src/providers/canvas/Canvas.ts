import { EventEmitter } from 'events';
import throttle from 'lodash.throttle';
import create from 'zustand/vanilla';
import { Viewport } from '../viewport/Viewport';
import { RoomStateShape, useRoomStore } from '../../roomState/useRoomStore';
import { Bounds, Vector2 } from '../../types/spatials';
import { clampSizeMaintainingRatio } from '../../utils/clampSizeMaintainingRatio';
import { clamp, snap, snapWithoutZero } from '../../utils/math';

const MOVE_THROTTLE_PERIOD = 100;

type ActiveDragState = {
  objectId: string | null;
  objectType: CanvasObjectKind | null;
  position: Vector2 | null;
};

type ActiveResizeState = {
  objectId: string | null;
  objectType: CanvasObjectKind | null;
  size: Bounds | null;
  aspectRatio: number | null;
};

export interface CanvasOptions {
  /** Snaps items to a world-unit grid after dropping them - defaults to 1. */
  positionSnapIncrement?: number;
  sizeSnapIncrement?: number;
}

export interface CanvasEvents {
  gestureStart: () => void;
  gestureEnd: () => void;
}

/**
 * Different kinds of objects we use as content within any kind of Canvas.
 * 'other' is a special category, these items are usually ephemeral and their
 * position isn't stored or synced to peers but still requires positioning onscreen.
 */
export type CanvasObjectKind = 'person' | 'widget' | 'other';

export interface ResizeInfo {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  preserveAspect?: boolean;
}

/**
 * Returns a selector function to get the position vector of an object
 * in the Room Store.
 */
const objectPositionSelector = (objectId: string, objectType: CanvasObjectKind) => (roomState: RoomStateShape) => {
  if (objectType === 'person') {
    return roomState.userPositions[objectId]?.position ?? { x: 0, y: 0 };
  } else if (objectType === 'widget') {
    return roomState.widgetPositions[objectId]?.position ?? { x: 0, y: 0 };
  }
  return { x: 0, y: 0 };
};
const objectSizeSelector = (objectId: string, objectType: CanvasObjectKind) => (roomState: RoomStateShape) => {
  if (objectType === 'person') {
    return roomState.userPositions[objectId]?.size ?? null;
  } else if (objectType === 'widget') {
    return roomState.widgetPositions[objectId]?.size ?? null;
  }
  return null;
};

export declare interface Canvas {
  on<Event extends keyof CanvasEvents>(ev: Event, cb: CanvasEvents[Event]): this;
  off<Event extends keyof CanvasEvents>(ev: Event, cb: CanvasEvents[Event]): this;
  emit<Event extends keyof CanvasEvents>(ev: Event, ...args: Parameters<CanvasEvents[Event]>): boolean;
}

/**
 * This class encapsulates the logic which powers the movement and
 * sizing of objects within a Room Canvas - the 2d space that makes
 * up the standard With Room. It implements the required functionality
 * for both CanvasContext and SizingContext
 */
export class Canvas extends EventEmitter {
  private activeDragStore = create(
    () =>
      ({
        objectId: null,
        objectType: null,
        position: null,
      } as ActiveDragState)
  );

  private activeResizeStore = create(
    () =>
      ({
        objectId: null,
        objectType: null,
        size: null,
        aspectRatio: null,
      } as ActiveResizeState)
  );

  private measurementsStore = create(() => ({} as Record<string, Bounds>));

  private positionObservers: Record<string, Set<(position: Vector2) => void>> = {};
  private sizeObservers: Record<string, Set<(size: Bounds) => void>> = {};

  private unsubscribeActiveDrag: () => void;
  private unsubscribeActiveResize: () => void;

  private _positionSnapIncrement = 1;
  private _sizeSnapIncrement = 1;

  readonly name = 'roomCanvas';

  constructor(private viewport: Viewport, options?: CanvasOptions) {
    super();
    this.unsubscribeActiveDrag = this.activeDragStore.subscribe(this.handleActivePositionChange);
    this.unsubscribeActiveResize = this.activeResizeStore.subscribe(this.handleActiveSizeChange);
    // @ts-ignore for debugging...
    window.roomCanvas = this;
    this._positionSnapIncrement = options?.positionSnapIncrement ?? 1;
    this._sizeSnapIncrement = options?.sizeSnapIncrement ?? 1;
  }

  private syncObjectPosition = (position: Vector2, objectId: string, objectType: CanvasObjectKind) => {
    if (objectType === 'person') {
      useRoomStore.getState().api.moveSelf({ position });
    } else if (objectType === 'widget') {
      useRoomStore.getState().api.moveWidget({ widgetId: objectId, position });
    }
  };
  private throttledSyncObjectPosition = throttle(this.syncObjectPosition, MOVE_THROTTLE_PERIOD, { trailing: false });

  // subscribe to changes in active object position and forward them to the
  // correct object
  private handleActivePositionChange = (state: ActiveDragState) => {
    if (state.objectId && state.position) {
      const position = state.position;
      this.positionObservers[state.objectId]?.forEach((cb) => cb(position));
    }
  };
  // subscribe to changes in active object size and forward them to the
  // correct object
  private handleActiveSizeChange = (state: ActiveResizeState) => {
    if (state.objectId && state.size) {
      const size = state.size;
      this.sizeObservers[state.objectId]?.forEach((cb) => cb(size));
    }
  };

  private snapPosition = (position: Vector2) => ({
    x: snap(position.x, this._positionSnapIncrement),
    y: snap(position.y, this._positionSnapIncrement),
  });

  onObjectDragStart = (screenPosition: Vector2, objectId: string, objectType: CanvasObjectKind) => {
    const worldPosition = this.viewport.viewportToWorld(screenPosition, true);
    this.activeDragStore.setState({
      objectId,
      objectType,
      position: worldPosition,
    });
    this.emit('gestureStart');
  };

  onObjectDrag = (screenPosition: Vector2, objectId: string, objectType: CanvasObjectKind) => {
    const worldPosition = this.viewport.viewportToWorld(screenPosition, true);
    this.activeDragStore.setState({
      objectId,
      objectType,
      position: worldPosition,
    });
    // also update backend with throttling, but snapped to the grid
    this.throttledSyncObjectPosition(this.snapPosition(worldPosition), objectId, objectType);
  };

  onObjectDragEnd = (screenPosition: Vector2, objectId: string, objectType: CanvasObjectKind) => {
    this.activeDragStore.setState({
      objectId: null,
      objectType: null,
      position: null,
    });
    const worldPosition = this.snapPosition(this.viewport.viewportToWorld(screenPosition, true));
    this.syncObjectPosition(worldPosition, objectId, objectType);
    this.emit('gestureEnd');
  };

  observePosition = (objectId: string, objectType: CanvasObjectKind, observer: (position: Vector2) => void) => {
    // store the observer
    this.positionObservers[objectId] = this.positionObservers[objectId] ?? new Set();
    this.positionObservers[objectId].add(observer);
    // subscribe to position
    const unsubscribe = useRoomStore.subscribe((position) => {
      // only notify observer of Room State position changes if the object
      // is not actively being moved, which should override Room State position.
      if (this.activeDragStore.getState().objectId !== objectId) {
        observer(position);
      }
    }, objectPositionSelector(objectId, objectType));

    return () => {
      unsubscribe();
      this.positionObservers[objectId]?.delete(observer);
    };
  };

  getPosition = (objectId: string, objectType: CanvasObjectKind) => {
    const activeDragState = this.activeDragStore.getState();
    if (activeDragState.objectId === objectId && activeDragState.position) {
      return activeDragState.position;
    }

    return objectPositionSelector(objectId, objectType)(useRoomStore.getState());
  };

  private clampAndEnforceMode = ({
    width,
    height,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    preserveAspect,
    aspectRatio,
    snap: doSnap,
  }: {
    width: number;
    height: number;
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
    preserveAspect?: boolean;
    aspectRatio: number;
    snap: boolean;
  }) => {
    let clamped;
    if (preserveAspect) {
      clamped = clampSizeMaintainingRatio({
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        aspectRatio: aspectRatio,
      });
    } else {
      clamped = {
        width: clamp(width, minWidth, maxWidth),
        height: clamp(height, minHeight, maxHeight),
      };
    }
    if (doSnap) {
      clamped.width = snapWithoutZero(clamped.width, this._sizeSnapIncrement);
      clamped.height = snapWithoutZero(clamped.height, this._sizeSnapIncrement);
    }
    return clamped;
  };

  onResizeStart = (initialSize: Bounds, objectId: string, objectKind: CanvasObjectKind) => {
    this.activeResizeStore.setState({
      objectId,
      objectType: objectKind,
      aspectRatio: initialSize.width / initialSize.height,
      size: initialSize,
    });
  };

  onResize = (size: Bounds, objectId: string, objectKind: CanvasObjectKind, info: ResizeInfo) => {
    const clampedSize = this.clampAndEnforceMode({
      ...size,
      ...info,
      aspectRatio: this.activeResizeStore.getState().aspectRatio || 1,
      snap: false,
    });

    this.activeResizeStore.setState({
      size: clampedSize,
      objectId,
      objectType: objectKind,
    });
  };

  onResizeEnd = (size: Bounds, objectId: string, objectKind: CanvasObjectKind, info: ResizeInfo) => {
    const clampedSize = this.clampAndEnforceMode({
      ...size,
      ...info,
      aspectRatio: this.activeResizeStore.getState().aspectRatio || 1,
      snap: true,
    });
    this.activeResizeStore.setState({
      objectId: null,
      objectType: null,
      size: null,
      aspectRatio: null,
    });
    // only widget resizes are supported
    if (objectKind === 'widget') {
      useRoomStore.getState().api.resizeWidget({
        widgetId: objectId,
        size: clampedSize,
      });
    }
  };

  observeSize = (objectId: string, objectKind: CanvasObjectKind, observer: (size: Bounds | null) => void) => {
    // store the observer
    this.sizeObservers[objectId] = this.sizeObservers[objectId] ?? new Set();
    this.sizeObservers[objectId].add(observer);
    // subscribe to position
    const unsubscribe = useRoomStore.subscribe((position) => {
      // only notify observer of Room State position changes if the object
      // is not actively being moved, which should override Room State position.
      if (this.activeResizeStore.getState().objectId !== objectId) {
        observer(position);
      }
    }, objectSizeSelector(objectId, objectKind));

    return () => {
      unsubscribe();
      this.sizeObservers[objectId]?.delete(observer);
    };
  };

  getSize = (objectId: string, objectKind: CanvasObjectKind) => {
    const activeResizeState = this.activeResizeStore.getState();
    if (activeResizeState.objectId === objectId && activeResizeState.size) {
      return activeResizeState.size;
    }

    return objectSizeSelector(objectId, objectKind)(useRoomStore.getState());
  };

  onMeasure = (size: Bounds, objectId: string) => {
    this.measurementsStore.setState({
      [objectId]: size,
    });
  };

  observeMeasurements = (objectId: string, objectKind: CanvasObjectKind, observer: (size: Bounds) => void) => {
    return this.measurementsStore.subscribe<Bounds | undefined>(
      (size) => observer(size ?? { width: 0, height: 0 }),
      (sizes) => sizes[objectId]
    );
  };

  getMeasurements = (objectId: string) => this.measurementsStore.getState()[objectId] ?? { width: 0, height: 0 };

  onGestureStart = () => {
    this.emit('gestureStart');
  };

  onGestureEnd = () => {
    this.emit('gestureEnd');
  };

  dispose = () => {
    this.unsubscribeActiveDrag();
    this.unsubscribeActiveResize();
  };
}
