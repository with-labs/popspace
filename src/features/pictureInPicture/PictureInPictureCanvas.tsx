import { EventEmitter } from 'events';
import { RoomStateShape, useRoomStore } from '@api/useRoomStore';
import { logger } from '@utils/logger';
import { PictureInPictureMuteIcon } from './PictureInPictureMuteIcon';
import { PictureInPictureSettingsState, usePictureInPictureSettings } from './usePictureInPictureSettings';
import { PictureInPictureUser } from './PictureInPictureUser';
import { PictureInPictureWallpaper } from './PictureInPictureWallpaper';
import { PictureInPictureVideoIcon } from './PictureInPictureVideoIcon';

const VIEW_SIZE = 600;

const selectOwnPosition = (room: RoomStateShape) =>
  room.userPositions[room.sessionLookup[room.sessionId || '']]?.position;
const selectUserIds = (room: RoomStateShape) => Object.keys(room.users);
const selectAutoPIPEnabled = (settings: PictureInPictureSettingsState) => settings.autoPIPEnabled;
export interface PictureInPictureCanvasEvents {
  stateChange(active: boolean): void;
}

export declare interface PictureInPictureCanvas {
  on<U extends keyof PictureInPictureCanvasEvents>(ev: U, cb: PictureInPictureCanvasEvents[U]): this;
  off<U extends keyof PictureInPictureCanvasEvents>(ev: U, cb: PictureInPictureCanvasEvents[U]): this;
  emit<U extends keyof PictureInPictureCanvasEvents>(
    ev: U,
    ...args: Parameters<PictureInPictureCanvasEvents[U]>
  ): boolean;
}

export class PictureInPictureCanvas extends EventEmitter {
  readonly canvas: HTMLCanvasElement;
  readonly video: HTMLVideoElement;
  private wallpaper: PictureInPictureWallpaper;
  private users: Record<string, PictureInPictureUser> = {};
  private muteIcon: PictureInPictureMuteIcon;
  private cameraIcon: PictureInPictureVideoIcon;
  private frame: number | NodeJS.Timeout = 0;
  private stopped = true;
  private muted = false;
  private cameraOn = false;
  private readyPromise: Promise<void> = Promise.resolve();
  private unsubscribe: () => void;

  private get ctx() {
    return this.canvas.getContext('2d')!;
  }

  constructor() {
    super();

    this.canvas = document.createElement('canvas');
    this.canvas.width = VIEW_SIZE;
    this.canvas.height = VIEW_SIZE;

    this.video = document.createElement('video');
    this.video.muted = true;

    // @ts-ignore
    window.pipVideo = this.video;

    /**
     * Auto Picture-in-Picture works in Chrome PWAs and provides
     * a seamless PIP transition when the window is blurred
     */
    try {
      if (!('autoPictureInPicture' in HTMLVideoElement.prototype)) {
        logger.debug(`Cannot enable autoPictureInPicture - not supported or not running in installed PWA`);
      } else {
        // @ts-ignore
        this.video.autoPictureInPicture = selectAutoPIPEnabled(usePictureInPictureSettings.getState());
        logger.debug('Auto picture-in-picture enabled');
      }
    } catch (err) {
      logger.debug(`Cannot enable autoPictureInPicture`, err);
    }

    // setup various other video settings
    this.video.width = VIEW_SIZE;
    this.video.height = VIEW_SIZE;
    this.video.addEventListener('error', logger.error);
    this.video.addEventListener('enterpictureinpicture', this.start);
    this.video.addEventListener('leavepictureinpicture', this.stop);
    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.video.addEventListener('loadedmetadata', () => resolve());
      this.video.addEventListener('error', reject);
    });

    // @ts-ignore until this is officially typed
    const stream = this.canvas.captureStream();
    this.video.srcObject = stream;
    this.video.play();

    this.wallpaper = new PictureInPictureWallpaper(this.canvas);
    selectUserIds(useRoomStore.getState()).forEach((userId) => {
      this.users[userId] = new PictureInPictureUser(userId, this.canvas);
    });
    this.muteIcon = new PictureInPictureMuteIcon(this.canvas);
    this.cameraIcon = new PictureInPictureVideoIcon(this.canvas);

    // subscribe to changes in the user list
    const unsubUsers = useRoomStore.subscribe<string[]>(this.updateUsers, selectUserIds);
    const unsubAutoPIP = usePictureInPictureSettings.subscribe<boolean>((enabled) => {
      // @ts-ignore
      this.video.autoPictureInPicture = enabled;
    }, selectAutoPIPEnabled);
    this.unsubscribe = () => {
      unsubUsers();
      unsubAutoPIP();
    };

    // go ahead and render one frame - this ensures the video has some canvas
    // source to show as soon as it's ready.
    this.render();
  }

  /**
   * Keeps renderable users in sync with user list in room
   */
  private updateUsers = (newIds: string[]) => {
    for (const id of newIds) {
      this.users[id] = this.users[id] || new PictureInPictureUser(id, this.canvas);
    }
    for (const id of Object.keys(this.users)) {
      if (!newIds.includes(id)) {
        this.users[id].dispose();
        delete this.users[id];
      }
    }
  };

  private start = () => {
    this.stopped = false;
    // starts a render loop
    this.render();
    this.emit('stateChange', true);
  };

  private stop = () => {
    this.stopped = true;
    if (this.frame) {
      // FIXME: Chrome is disabling requestAnimationFrame when the window
      // is backgrounded. Using timeouts instead...
      clearTimeout(this.frame as NodeJS.Timeout);
    }
    this.emit('stateChange', false);
  };

  get isActive() {
    // @ts-ignore until this is officially typed
    return !!document.pictureInPictureElement;
  }

  activate = async () => {
    this.start();

    if (this.video.readyState === 0) {
      await this.readyPromise;
    }

    try {
      // PIP can be rejected if the browser doesn't like it -
      // Safari seems to not reliably allow it even if it originates
      // from a user click like it's required to.

      // @ts-ignore until this is officially typed
      this.video.requestPictureInPicture();
    } catch (err) {
      logger.error(err);
      this.stop();
    }
  };

  deactivate = async () => {
    this.stop();

    // @ts-ignore until this is officially typed
    if (document.pictureInPictureElement) {
      // @ts-ignore until this is officially typed
      await document.exitPictureInPicture();
    }
  };

  dispose = () => {
    this.deactivate();
    this.unsubscribe();
    for (const user of Object.values(this.users)) {
      user.dispose();
    }
    this.wallpaper.dispose();
  };

  setMuted = (value: boolean) => {
    this.muted = value;
  };

  setCameraOn = (value: boolean) => {
    this.cameraOn = value;
  };

  private render = async () => {
    if (!this.stopped) {
      // FIXME: Chrome is disabling requestAnimationFrame when the window
      // is backgrounded. Using timeouts instead...
      this.frame = setTimeout(this.render, 1000 / 30);
    }
    try {
      // clear the screen
      this.ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);

      const ownPosition = selectOwnPosition(useRoomStore.getState());

      this.wallpaper.render(ownPosition);

      if (!ownPosition) return;

      Object.values(this.users).forEach((user) => user.render(ownPosition));

      if (this.muted) {
        this.muteIcon.render({ x: 20, y: 20 });
      }
      if (this.cameraOn) {
        this.cameraIcon.render({
          x: this.muted ? 120 : 20,
          y: 20,
        });
      }
    } catch (err) {
      logger.critical('Could not draw PIP canvas', err);
    }
  };
}
