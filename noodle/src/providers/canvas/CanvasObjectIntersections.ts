import { RoomPositionState } from '@api/roomState/types/common';
import { EventEmitter } from 'events';
import throttle from 'lodash.throttle';
import QuadTree from 'simple-quadtree';

import { CanvasObjectKind } from './Canvas';

interface Boundary {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
  kind: CanvasObjectKind;
}

export interface IntersectionData {
  id: string;
  self: Boundary;
  intersections: Array<Boundary>;
}

export interface CanvasObjectIntersectionEvents {
  intersectionsChanged: (data: IntersectionData) => void;
}

export declare interface CanvasObjectIntersections {
  on<Event extends keyof CanvasObjectIntersectionEvents>(ev: Event, cb: CanvasObjectIntersectionEvents[Event]): this;
  off<Event extends keyof CanvasObjectIntersectionEvents>(ev: Event, cb: CanvasObjectIntersectionEvents[Event]): this;
  emit<Event extends keyof CanvasObjectIntersectionEvents>(
    ev: Event,
    ...args: Parameters<CanvasObjectIntersectionEvents[Event]>
  ): boolean;
}

export class CanvasObjectIntersections extends EventEmitter {
  private quadTree: QuadTree<Boundary>;

  constructor(bounds: { x: number; y: number; width: number; height: number }) {
    super();
    this.quadTree = new QuadTree(bounds.x, bounds.y, bounds.width, bounds.height);
    // @ts-ignore debug only
    window.quadTree = this.quadTree;
  }

  rebuild = throttle(
    (positions: Array<RoomPositionState & { kind: CanvasObjectKind; id: string }>) => {
      // combine spatial data into single datastructures
      const bounds: Boundary[] = [];
      for (const position of positions) {
        if (!position) continue;

        bounds.push({
          id: position.id,
          kind: position.kind,
          x: position.position.x,
          y: position.position.y,
          w: position.size.width,
          h: position.size.height,
        });
      }

      this.quadTree.clear();
      for (const bound of bounds) {
        this.quadTree.put(bound);
      }
      // update all intersection groups and emit events for new or expired intersections
      for (const bound of bounds) {
        // filter out self-intersection
        const intersections = this.quadTree.get(bound).filter((i) => !(i.id === bound.id && i.kind === bound.kind));
        this.emit('intersectionsChanged', {
          id: bound.id,
          self: bound,
          intersections,
        });
      }
    },
    500,
    { trailing: true }
  );
}
