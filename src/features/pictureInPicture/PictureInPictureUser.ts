import client from '@api/client';
import { ActorShape } from '@api/roomState/types/participants';
import { RoomStateShape } from '@api/useRoomStore';
import { avatarOptions, getAvatarFromUserId } from '@constants/AvatarMetadata';
import { MAX_AUDIO_RANGE } from '@constants/room';
import { multiplyVector, normalizeVector, subtractVectors, vectorLength } from '@utils/math';

import { snow } from '../../theme/theme';
import { Vector2 } from '../../types/spatials';
import { PictureInPictureRenderable } from './PictureInPictureRenderable';

const SIZE = 60;
const PROXIMITY_RANGE = 400;
const FONT_SIZE = 24;
const NEARBY_BUFFER = 80;

export class PictureInPictureUser extends PictureInPictureRenderable {
  private avatarImage: HTMLImageElement;
  private color: string = '#ffffff';
  private name: string = '';
  private position: Vector2 | null;

  private unsubscribe: () => void;

  constructor(private id: string, canvas: HTMLCanvasElement) {
    super(canvas);

    this.avatarImage = new Image(SIZE, SIZE);
    this.avatarImage.crossOrigin = 'anonymous';
    this.avatarImage.style.objectFit = 'cover';

    const roomState = client.roomStateStore.getState();

    // bootstrap initial user data
    this.setData(this.selectUserData(roomState));

    this.position = this.selectPosition(roomState);

    // subscribe to data and position changes
    const unsubData = client.roomStateStore.subscribe<ActorShape>(this.setData, this.selectUserData);
    const unsubPosition = client.roomStateStore.subscribe<Vector2 | null>((pos) => {
      this.position = pos;
    }, this.selectPosition);

    this.unsubscribe = () => {
      unsubData();
      unsubPosition();
    };
  }

  private setData = (state: Pick<ActorShape, 'displayName' | 'avatarName'> | null) => {
    state = state || {
      displayName: '',
      avatarName: getAvatarFromUserId('brandedPatterns', this.id),
    };
    const avatarName = state?.avatarName;

    // avoid repeated sets of src as it loads the image from network
    if (this.avatarImage.src !== this.getImgSrc(avatarOptions[avatarName].image)) {
      this.avatarImage.src = this.getImgSrc(avatarOptions[avatarName].image);
    }
    this.color = avatarOptions[avatarName].backgroundColor;
    this.name = state.displayName ?? '';
  };

  /**
   * Renders the user's bubble (or dot) relative to a central
   * point on the canvas (this would generally be the position of the
   * active user).
   */
  render = (relativeTo: Vector2) => {
    if (!this.position) return;

    const toUser = subtractVectors(this.position, relativeTo);
    // distance in With world units
    const nativeDistance = vectorLength(toUser);

    // skip users too far away
    if (nativeDistance > MAX_AUDIO_RANGE) {
      return;
    }

    // distance to draw user from the active user, in the PIP frame
    // special case for 0, which means this IS the active user and they should
    // stay in the middle.
    const pipDistance = nativeDistance === 0 ? 0 : (nativeDistance / MAX_AUDIO_RANGE) * PROXIMITY_RANGE + NEARBY_BUFFER;
    // scale up a unit vector in the direction of the rendered user
    // by the PIP distance
    const drawPosition = multiplyVector(normalizeVector(toUser), pipDistance);

    // scale is proportional to position in the PIP window
    const scale = Math.max(0, pipDistance === 0 ? 1 : (PROXIMITY_RANGE - pipDistance) / PROXIMITY_RANGE);

    if (scale > 0.5) {
      this.drawAvatar(drawPosition, scale);
    } else {
      this.drawDot(drawPosition, scale);
    }
  };

  dispose = () => {
    this.unsubscribe();
  };

  private drawAvatar = async (position: Vector2, scale: number) => {
    this.ctx.fillStyle = snow.palette.common.white;
    this.enableShadow();
    this.ctx.beginPath();
    this.ctx.arc(this.halfWidth + position.x, this.halfHeight + position.y, SIZE * scale, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.closePath();
    this.disableShadow();

    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.halfWidth + position.x, this.halfHeight + position.y, (SIZE - 4) * scale, -Math.PI, 0);
    this.ctx.fill();
    this.ctx.closePath();

    const avatarWidth = (SIZE * 2 - 10) * scale;
    const avatarHeight = avatarWidth * 0.83333333333;
    const avatarVerticalOffset = -avatarHeight / 2;

    if (this.avatarImage.complete && this.avatarImage.naturalHeight !== 0) {
      this.ctx.drawImage(
        this.avatarImage,
        this.halfWidth + position.x - avatarWidth / 2,
        this.halfHeight + position.y - avatarHeight / 2 + avatarVerticalOffset,
        avatarWidth,
        avatarHeight
      );
    }

    const nameVerticalOffset = avatarHeight / 4;

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = snow.palette.common.black;
    this.ctx.font = (`${FONT_SIZE * scale}px ` + snow.typography.fontFamily) as string;
    this.ctx.fillText(this.name, this.halfWidth + position.x, this.halfHeight + position.y + nameVerticalOffset);
  };

  private drawDot = async (position: Vector2, scale: number) => {
    this.ctx.fillStyle = this.color;
    this.enableShadow();
    this.ctx.beginPath();
    this.ctx.arc(this.halfWidth + position.x, this.halfHeight + position.y, SIZE * scale, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.closePath();
    this.disableShadow();
  };

  // some selectors for fetching and subscribing to data
  private selectUserData = (room: RoomStateShape) => room.users[this.id]?.actor ?? null;
  private selectPosition = (room: RoomStateShape) => room.userPositions[this.id]?.position ?? null;
}
