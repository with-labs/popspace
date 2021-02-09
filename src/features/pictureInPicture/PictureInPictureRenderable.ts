export class PictureInPictureRenderable {
  constructor(protected canvas: HTMLCanvasElement) {}

  protected get ctx() {
    return this.canvas.getContext('2d')!;
  }

  protected get width() {
    return this.canvas.width;
  }

  protected get height() {
    return this.canvas.height;
  }

  protected get halfWidth() {
    return this.canvas.width / 2;
  }

  protected get halfHeight() {
    return this.canvas.height / 2;
  }
}
