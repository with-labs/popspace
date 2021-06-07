import { EventEmitter } from 'events';
import throttle from 'lodash.throttle';
import QuadTree from 'simple-quadtree';
import { Bounds, Vector2 } from '../../types/spatials';

interface Boundary {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
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
  private quadTree: QuadTree<{ x: number; y: number; w: number; h: number; id: string }>;

  constructor(bounds: { x: number; y: number; width: number; height: number }) {
    super();
    this.quadTree = new QuadTree(bounds.x, bounds.y, bounds.width, bounds.height);
    // @ts-ignore debug only
    window.quadTree = this.quadTree;
  }

  rebuild = throttle(
    (positions: Record<string, Vector2>, measurements: Record<string, Bounds>) => {
      // combine spatial data into single datastructures
      const bounds = Object.keys(positions).map((id) => ({
        id,
        x: positions[id].x,
        y: positions[id].y,
        w: measurements[id]?.width ?? 0,
        h: measurements[id]?.height ?? 0,
      }));

      this.quadTree.clear();
      for (const bound of bounds) {
        this.quadTree.put(bound);
      }
      // update all intersection groups and emit events for new or expired intersections
      for (const bound of bounds) {
        const intersections = this.quadTree.get(bound);
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
