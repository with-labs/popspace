import { EventEmitter } from 'events';
import { Bounds, Vector2, RectLimits } from '../../types/spatials';
import { addVectors, clamp, clampVector, subtractVectors } from '@utils/math';
import { ResizeObserver } from 'resize-observer';
import { ResizeObserverEntry } from 'resize-observer/lib/ResizeObserverEntry';

// for some calculations we need to assume a real size for an infinite
// canvas... we use this value for infinite extents. FIXME: can we
// change the logic to not require this assumption?
const INFINITE_LOGICAL_SIZE = 1_000_000;

export interface ViewportConfig {
  /** Supply a starting zoom value. Default 1 */
  defaultZoom?: number;
  /** Supply a starting center position. Default 0,0 */
  defaultCenter?: Vector2;
  /** Restrict world positions to certain boundaries. Default unlimited. */
  canvasLimits?: RectLimits;
  /** Restrict pan movement to certain boundaries. Default is canvasLimits if those exist,
   * otherwise unbounded.
   */
  panLimits?: RectLimits;
  /**
   * There are two ways to limit pan position:
   * "center" simply clamps the center of the screen to the provided panLimits boundary
   * "viewport" enforces that the closest edge of the viewport must not exceed the boundary
   * Default is "center"
   */
  panLimitMode?: 'center' | 'viewport';
  /** Restrict zooming to certain boundaries. Default min 0.25, max 2 */
  zoomLimits?: {
    min: number;
    max: number;
  };
  /**
   * Start the Viewport already bound to an existing DOM element. This
   * can be set later using bindElement. Defaults to window.
   */
  boundElement?: HTMLElement;
}

// removes some optional annotations as they are filled by defaults.
type InternalViewportConfig = Omit<ViewportConfig, 'zoomLimits' | 'boundElement'> & {
  zoomLimits: { min: number; max: number };
};

/**
 * Event origins are included in change events to indicate what
 * kind of operation caused the change. This helps animation code
 * determine what kind of easing to apply to the movement -
 *  - direct movement is usually very tight or not eased at all
 *  - control movement is triggered indirectly by control interaction
 *    (like zoom buttons) and usually has tighter easing
 *  - animation movement comes from app events and may have long easing
 *    curves to help the user interpret the change since they didn't
 *    originate it
 */
export type ViewportEventOrigin = 'direct' | 'control' | 'animation';

export interface ViewportEvents {
  zoomChanged(zoom: number, origin: ViewportEventOrigin): void;
  centerChanged(center: Readonly<Vector2>, origin: ViewportEventOrigin): void;
  /** Fired when the size of the bound element changes */
  sizeChanged(size: Bounds): void;
}

export declare interface Viewport {
  on<U extends keyof ViewportEvents>(event: U, listener: ViewportEvents[U]): this;
  once<U extends keyof ViewportEvents>(event: U, listener: ViewportEvents[U]): this;
  off<U extends keyof ViewportEvents>(event: U, listener: ViewportEvents[U]): this;
  emit<U extends keyof ViewportEvents>(event: U, ...args: Parameters<ViewportEvents[U]>): boolean;
}

/**
 * Viewport handles all the logic of managing a 2d viewport with pan & zoom which
 * renders spatial content on a larger plane. Viewport handles the math required
 * to determine boundaries on panning, converts screen coordinates to "world" coordinates,
 * and holds the state for the target values of both the zoom and camera center position.
 *
 * Viewport does NOT do any easing of values, it just computes the target values.
 * Easing is left up to the actual view code (in our case React). Rendering code
 * should set up easing between target values as those values change in Viewport.
 *
 * To that end Viewport implements a few events which can be listened to for
 * when the camera properties change.
 */
export class Viewport extends EventEmitter {
  private _center: Vector2 = { x: 0, y: 0 };
  private _zoom = 1;
  _config: InternalViewportConfig;
  // these two are initialized in a helper method, bypassing
  // strict initialization checking...
  private _boundElement: HTMLElement = null as any;
  private _boundElementSize: Bounds = { width: 0, height: 0 };
  private handleBoundElementResize = ([entry]: ResizeObserverEntry[]) => {
    this.setBoundElementSize(entry.contentRect);
  };
  private _boundElementResizeObserver = new ResizeObserver(this.handleBoundElementResize);

  constructor({ boundElement, ...config }: ViewportConfig) {
    super();

    if (config.defaultCenter) {
      this._center = config.defaultCenter;
    }
    // intentionally not !== undefined - we ignore 0 too.
    if (config.defaultZoom) {
      this._zoom = config.defaultZoom;
    }

    this._config = {
      zoomLimits: { min: 0.25, max: 2 },
      panLimits: config.canvasLimits,
      ...config,
    };

    this.bindOrDefault(boundElement ?? null);

    // @ts-ignore for debugging
    window.viewport = this;
  }

  private setBoundElementSize = (size: Bounds) => {
    this._boundElementSize.width = size.width;
    this._boundElementSize.height = size.height;
    this.emit('sizeChanged', size);
  };

  private bindOrDefault = (element: HTMLElement | null) => {
    if (this._boundElement && this._boundElement !== element) {
      this._boundElementResizeObserver.unobserve(this._boundElement);
    }
    if (typeof window === 'undefined') {
      // SSR context - simulate an element client rect and ignore
      // the element size monitoring. Size is arbitrary.
      this.setBoundElementSize({
        width: 2400,
        height: 2400,
      });
    } else {
      this._boundElement = element ?? document.documentElement;
      this._boundElementResizeObserver.observe(this._boundElement);
      if (element) {
        this.setBoundElementSize({
          width: element.clientWidth,
          height: element.clientHeight,
        });
      } else {
        this.setBoundElementSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }
  };

  /** Public getters for core values */

  /**
   * The zoom value of the camera - higher means things look bigger.
   */
  get zoom() {
    return this._zoom;
  }

  /**
   * The center coordinate of the camera's focus, in "world" space.
   */
  get center() {
    return this._center as Readonly<Vector2>;
  }

  get config() {
    return this._config;
  }

  /**
   * The size, in pixels, of the viewport element.
   */
  get size() {
    return this._boundElementSize as Readonly<Bounds>;
  }

  /**
   * The rectangle bounds describing the total world canvas area.
   * For infinite canvases this will be a large but finite space.
   */
  get canvasRect() {
    const canvasMin = this.config.canvasLimits?.min ?? { x: -INFINITE_LOGICAL_SIZE / 2, y: -INFINITE_LOGICAL_SIZE / 2 };
    const canvasMax = this.config.canvasLimits?.max ?? { x: INFINITE_LOGICAL_SIZE / 2, y: INFINITE_LOGICAL_SIZE / 2 };
    return {
      x: canvasMin.x,
      y: canvasMin.y,
      width: canvasMax.x - canvasMin.x,
      height: canvasMax.y - canvasMin.y,
    };
  }

  get worldCenter() {
    const rect = this.canvasRect;
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  /** Convenience getters for internal calculation */

  private get halfViewportWidth() {
    return this._boundElementSize.width / 2;
  }

  private get halfViewportHeight() {
    return this._boundElementSize.height / 2;
  }

  /**
   * This should be called any time the screen viewport size changes
   * (like window size change, DOM layout change, etc)
   */
  bindElement = (element: HTMLElement | null) => {
    this.bindOrDefault(element);
  };

  /**
   * Transforms a pixel position into world coordinates. Optionally
   * you can clamp the coordinate to the canvas bounds, if they exist.
   */
  viewportToWorld = (screenPoint: Vector2, clamp = false) => {
    // This was a bit trial-and-error, but:
    // 1. subtract half of the window size
    //      Imagine the viewport was centered at 0,0 in world space (the center of the window
    //      is exactly at the center of the room). if the user
    //      moved an object toward the upper left corner of their screen,
    //      that would logically be in negative world coordinate space -
    //      however, screen coordinates are only positive from the top left corner.
    //      this is basically the part that converts from a top-left to a center-based
    //      positioning system.
    // 2. scale based on inverse zoom (divide by zoom)
    //      scaling for zoom is necessary - imagine if you are at 0.5x zoom and you move
    //      the object 10 pixels to the left - you are actually moving 20 pixels of world
    //      space because the world is half-size.
    // 3. subtract the pan of the canvas
    //      subtracting the pan value accommodates for the fact that pan moves the world
    //      independently of the visible screen space, so we need to add that offset in.
    //      this is done OUTSIDE of the zoom scaling because the pan coordinate is already
    //      in world space and doesn't need to be adjusted for zoom.
    const transformedPoint = {
      x: (screenPoint.x - this.halfViewportWidth) / this.zoom + this.center.x,
      y: (screenPoint.y - this.halfViewportHeight) / this.zoom + this.center.y,
    };

    if (clamp && !!this.config.canvasLimits) {
      return this.clampToWorld(transformedPoint);
    }

    return transformedPoint;
  };

  /**
   * Restricts a position to one inside the world canvas
   */
  clampToWorld = (worldPosition: Vector2) => {
    if (!this.config.canvasLimits) return worldPosition;
    return clampVector(worldPosition, this.config.canvasLimits.min, this.config.canvasLimits.max);
  };

  /**
   * Converts a world point to a viewport (screen, pixel) point. The point
   * will be relative to the viewport element.
   */
  worldToViewport = (worldPoint: Vector2) => {
    return {
      x: (worldPoint.x - this.center.x) * this.zoom + this.halfViewportWidth,
      y: (worldPoint.y - this.center.y) * this.zoom + this.halfViewportHeight,
    };
  };

  /**
   * Converts a delta vector (a distance representation) from
   * viewport (screen, pixel) space to world space
   */
  viewportDeltaToWorld = (screenDelta: Vector2) => {
    return {
      x: screenDelta.x / this.zoom,
      y: screenDelta.y / this.zoom,
    };
  };

  /**
   * Converts a delta vector (a distance representation) from
   * world space to viewport (screen, pixel) space
   */
  worldDeltaToViewport = (worldDelta: Vector2) => {
    return {
      x: worldDelta.x * this.zoom,
      y: worldDelta.y * this.zoom,
    };
  };

  /**
   * Clamps the pan position if limits are provided.
   * @param panPosition Proposed pan position, in world coordinates
   */
  private clampPanPosition = (panPosition: Vector2) => {
    if (this.config.panLimits) {
      if (this.config.panLimitMode === 'viewport') {
        const worldViewportHalfWidth = this.halfViewportWidth / this.zoom;
        const worldViewportHalfHeight = this.halfViewportHeight / this.zoom;
        const worldViewportWidth = this._boundElementSize.width / this.zoom;
        const worldViewportHeight = this._boundElementSize.height / this.zoom;
        const canvasRect = this.canvasRect;
        const worldCenter = this.worldCenter;

        // there are different rules depending on if the viewport is visually larger
        // than the canvas, or vice versa. when the viewport is larger than the canvas
        // we still let the user move around a little bit, until the edge of the
        // canvas touches the far edge of the screen.
        let minX = this.config.panLimits.min.x + worldViewportHalfWidth;
        let maxX = this.config.panLimits.max.x - worldViewportHalfWidth;
        if (worldViewportWidth > canvasRect.width) {
          minX = worldCenter.x - (worldViewportWidth - canvasRect.width) / 2;
          maxX = worldCenter.x + (worldViewportWidth - canvasRect.width) / 2;
        }
        let minY = this.config.panLimits.min.y + worldViewportHalfHeight;
        let maxY = this.config.panLimits.max.y - worldViewportHalfHeight;
        if (worldViewportHeight > canvasRect.height) {
          minY = worldCenter.y - (worldViewportHeight - canvasRect.height) / 2;
          maxY = worldCenter.y + (worldViewportHeight - canvasRect.height) / 2;
        }
        return clampVector(panPosition, { x: minX, y: minY }, { x: maxX, y: maxY });
      }
      // simpler center-based clamping
      return clampVector(panPosition, this.config.panLimits.min, this.config.panLimits.max);
    }
    return panPosition;
  };

  /**
   * Adjusts the zoom of the viewport camera. Optionally you can provide a
   * focal point (in screen coordinates) and it will keep that point at the same screen position while
   * zooming instead of zooming straight to the center of the viewport
   * @param zoomValue the new zoom factor
   * @param centroid a screen coordinate position which should remain visually stable during the zoom
   */
  doZoom = (
    zoomValue: number,
    { origin = 'direct', centroid }: { centroid?: Vector2; origin?: ViewportEventOrigin } = {}
  ) => {
    // the pan position is also updated to keep the focal point in the same screen position
    if (centroid) {
      // the objective is to keep the focal point at the same logical position onscreen -
      // i.e. if your mouse is the focal point and it's hovering over an avatar, that avatar
      // should remain under your mouse as you zoom in!

      // start out by recording the world position of the focal point before zoom
      const priorFocalWorldPoint = this.viewportToWorld(centroid);
      // then apply the zoom
      this._zoom = clamp(zoomValue, this.config.zoomLimits.min, this.config.zoomLimits.max);
      // now determine the difference, in screen pixels, between the old focal point
      // and the world point it used to be "over"
      const priorFocalScreenPoint = this.worldToViewport(priorFocalWorldPoint);
      const screenDifference = subtractVectors(priorFocalScreenPoint, centroid);
      // convert that difference to world units and apply it as a relative pan
      this.doRelativePan(this.viewportDeltaToWorld(screenDifference), { origin });
    } else {
      this._zoom = clamp(zoomValue, this.config.zoomLimits.min, this.config.zoomLimits.max);
      // apply a pan with the current pan position to recalculate pan
      // boundaries from the new zoom and enforce them
      this.doPan(this.center, { origin });
    }
    this.emit('zoomChanged', this.zoom, origin);
  };

  /**
   * Adjusts the zoom of the viewport camera relative to the current value. See doZoom
   * for details on parameters.
   */
  doRelativeZoom = (zoomDelta: number, details?: { origin?: ViewportEventOrigin; centroid?: Vector2 }) => {
    this.doZoom(this.zoom + zoomDelta, details);
  };

  /**
   * Pans the camera across the canvas to reach a target center point.
   * The coordinates accepted are in "world" units!
   * To convert from screen pixels (like mouse position), use .viewportToWorld before
   * passing in your position.
   *
   * @param {Vector2} worldPosition the position in world coordinates to pan to
   */
  doPan = (worldPosition: Vector2, { origin = 'direct' }: { origin?: ViewportEventOrigin } = {}) => {
    this._center = this.clampPanPosition(worldPosition);
    this.emit('centerChanged', this.center, origin);
  };

  /**
   * Pans the camera around the canvas using displacement relative to the current
   * center position, in "world" units. To convert a displacement from screen pixels
   * (like mouse position delta), use .viewportDeltaToWorld.
   *
   * See doPan for details on parameters.
   */
  doRelativePan = (worldDelta: Vector2, details?: { origin?: ViewportEventOrigin }) => {
    this.doPan(addVectors(this.center, worldDelta), details);
  };

  /**
   * Pans and zooms at the same time - a convenience shortcut to
   * zoom while moving the camera to a certain point. Both values
   * are absolute - see .doZoom and .doPan for more details on behavior
   * and parameters.
   */
  doMove = (
    worldPosition: Vector2,
    zoomValue: number,
    { origin = 'direct' }: { origin?: ViewportEventOrigin } = {}
  ) => {
    this._zoom = clamp(zoomValue, this.config.zoomLimits.min, this.config.zoomLimits.max);
    this._center = this.clampPanPosition(worldPosition);
    this.emit('centerChanged', this.center, origin);
    this.emit('zoomChanged', this.zoom, origin);
  };
}
