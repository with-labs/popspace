import { Vector2 } from '../../types/spatials';
import raf, { cancel } from 'raf';
import { vectorLength, multiplyVector } from '@utils/math';
import { EventEmitter } from 'events';
import { Viewport } from '../viewport/Viewport';

/**
 * A class which encapsulates a looping behavior for auto-panning the
 * viewport when the user drags an object near the edge of the window.
 * A discrete, stateful class is needed because there are no cursor events
 * which fire continually when a user's pointer is idling in the "hot zone" -
 * i.e. we have to use an animation frame loop to continually apply the pan
 * if the user moves their cursor near the edge and then stops moving, because
 * even though the cursor has stopped, it's still in the pan zone.
 */
export class AutoPan extends EventEmitter {
  private cursorPosition: Vector2 | null = null;
  // percentage of window dimensions which will trigger auto-pan behavior
  private threshold = 0.05;
  // slows down the pan speed
  private panSpeedMultiplier = 0.25;
  private rafHandle: number | undefined;

  constructor(private viewport: Viewport) {
    super();
  }

  /**
   * begin the auto-pan update loop with an initial cursor position -
   * should be called at the start of a drag
   */
  start = (cursorPosition: Vector2) => {
    this.cursorPosition = cursorPosition;
    this.rafHandle = raf(this.loop);
  };

  /**
   * sets a new cursor position to calculate from, use this whenever
   * the cursor moves.
   */
  update = (cursorPosition: Vector2) => {
    this.cursorPosition = cursorPosition;
  };

  /** cancels the update loop, should be called at the end of a drag */
  stop = () => {
    if (this.rafHandle) {
      cancel(this.rafHandle);
    }
  };

  private getAutoPan = () => {
    const cursorPosition = this.cursorPosition;
    if (!cursorPosition) {
      return { x: 0, y: 0 };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const autoPan = { x: 0, y: 0 };
    const horizontalThreshold = this.threshold * windowWidth;
    const verticalThreshold = this.threshold * windowHeight;
    if (cursorPosition.x < horizontalThreshold) {
      // autopan is adaptive to how far 'deep' in the threshold the cursor is
      autoPan.x = -(horizontalThreshold - cursorPosition.x);
    } else if (windowWidth - cursorPosition.x < horizontalThreshold) {
      autoPan.x = horizontalThreshold - (windowWidth - cursorPosition.x);
    }
    if (cursorPosition.y < verticalThreshold) {
      autoPan.y = -(verticalThreshold - cursorPosition.y);
    } else if (windowHeight - cursorPosition.y < verticalThreshold) {
      autoPan.y = verticalThreshold - (windowHeight - cursorPosition.y);
    }

    return multiplyVector(autoPan, this.panSpeedMultiplier);
  };

  private loop = () => {
    const autoPan = this.getAutoPan();

    if (vectorLength(autoPan)) {
      this.viewport.doRelativePan(autoPan, {
        origin: 'direct',
      });
      // emit an event to others
      this.emit('pan', { autoPan, cursorPosition: this.cursorPosition });
    }

    this.rafHandle = raf(this.loop);
  };
}
