import { snow } from '../../theme/theme';
import { Vector2 } from '../../types/spatials';
import { PictureInPictureRenderable } from './PictureInPictureRenderable';

const VIDEO_PATH = new Path2D(
  'M5 6C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H13C14.1046 18 15 17.1046 15 16V13.8857L19.4345 16.9265C20.0981 17.3815 21 16.9064 21 16.1018V7.89823C21 7.09361 20.0981 6.61847 19.4345 7.0735L15 10.1143V8C15 6.89543 14.1046 6 13 6H5Z'
);

const SCALE = 4;

export class PictureInPictureVideoIcon extends PictureInPictureRenderable {
  render = (position: Vector2) => {
    this.ctx.fillStyle = snow.palette.brandColors.snow.regular;
    this.ctx.strokeStyle = snow.palette.brandColors.ink.regular;
    this.ctx.lineWidth = 1;
    // offset drawing position
    this.ctx.setTransform(SCALE, 0, 0, SCALE, position.x, position.y);
    this.ctx.fill(VIDEO_PATH);
    this.ctx.stroke(VIDEO_PATH);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  };
}
