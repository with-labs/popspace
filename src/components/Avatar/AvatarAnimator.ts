import { CanvasImage } from '@utils/CanvasImage';

export enum AvatarAnimationState {
  Idle = 'idle',
  Talking = 'talking',
}

export interface SpriteSheetFrameData {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  sourceSize: {
    w: number;
    h: number;
  };
}

export interface SpriteSheetData {
  frames: Record<string, SpriteSheetFrameData>;
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: {
      w: number;
      h: number;
    };
    scale: number;
  };
}

export interface AvatarAnimationSet {
  spritesheetSrc: string;
  spritesheetData: SpriteSheetData;
  animations: Record<AvatarAnimationState, AvatarAnimation>;
}

export interface AvatarAnimation {
  frames: string[];
  timings: ([number, number] | number)[];
}

export class AvatarAnimator {
  private ctx: CanvasRenderingContext2D;
  private spritesheet: CanvasImage;
  private rafHandle = 0;

  // animation state management
  private elapsedFrameTime = 0;
  private activeState: AvatarAnimationState = AvatarAnimationState.Idle;
  private nextFrameDuration = 0;
  private frameNumber = 0;
  private lastFrameTime = performance.now();
  // dirty state tells us we need to clear and redraw the sprite next
  // animation frame.
  private dirty = true;

  constructor(private canvas: HTMLCanvasElement, private data: AvatarAnimationSet) {
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) {
      throw new Error('Could not get 2d rendering context for canvas element');
    }
    this.spritesheet = new CanvasImage({}, data.spritesheetSrc);
  }

  get state() {
    return this.activeState;
  }

  setState = (newState: AvatarAnimationState) => {
    if (newState === this.activeState) return;
    this.activeState = newState;
    this.frameNumber = -1;
    this.advanceFrame();
  };

  private get activeAnimation() {
    return this.data.animations[this.activeState];
  }

  private get activeFrame() {
    return this.data.spritesheetData.frames[this.activeAnimation.frames[this.frameNumber]];
  }

  private get activeFrameTiming() {
    return this.activeAnimation.timings[this.frameNumber];
  }

  private advanceFrame = () => {
    // advance frame number, wrapping to total frame count
    this.frameNumber = (this.frameNumber + 1) % this.activeAnimation.frames.length;
    // compute next frame time
    if (Array.isArray(this.activeFrameTiming)) {
      this.nextFrameDuration =
        Math.random() * (this.activeFrameTiming[1] - this.activeFrameTiming[0]) + this.activeFrameTiming[0];
    } else {
      this.nextFrameDuration = this.activeFrameTiming;
    }
    this.dirty = true;
    this.elapsedFrameTime = 0;
  };

  start = () => {
    this.rafHandle = requestAnimationFrame(this.runFrame);
  };

  runFrame = (time: number) => {
    this.rafHandle = requestAnimationFrame(this.runFrame);

    const deltaTime = time - this.lastFrameTime;
    this.elapsedFrameTime += deltaTime;
    if (this.elapsedFrameTime >= this.nextFrameDuration) {
      this.advanceFrame();
    }

    if (this.dirty) {
      // draw the sprite for the current frame
      const frame = this.activeFrame;
      this.ctx.drawImage(
        this.spritesheet.image,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.dirty = false;
    }

    this.lastFrameTime = time;
  };

  stop = () => {
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
  };
}
