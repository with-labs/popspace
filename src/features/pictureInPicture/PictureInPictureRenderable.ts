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

  /**
   * Appends a query string to an image URL to
   * prevent bad cache behaviors with CORS with S3
   */
  protected getImgSrc(baseSrcUrl: string | null) {
    if (!baseSrcUrl) return '';
    if (baseSrcUrl.includes('amazonaws.com')) {
      return `${baseSrcUrl}?pip=true`;
    } else {
      return baseSrcUrl;
    }
  }

  protected enableShadow() {
    this.ctx.shadowBlur = 24;
    this.ctx.shadowOffsetY = 8;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  }

  protected disableShadow() {
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.shadowColor = 'none';
  }
}
