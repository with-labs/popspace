/**
 * Creates a new HTML Image element from a source URL
 * string. This utility encapsulates some repetitive
 * or tricky aspects of CORS handling and loading state.
 */
export class CanvasImage {
  private img: HTMLImageElement;
  private _loaded = false;
  private _broken = false;

  constructor({ width, height }: { width?: number; height?: number } = {}, src?: string) {
    this.img = new Image(width, height);
    this.img.crossOrigin = 'anonymous';
    this.img.style.objectFit = 'contain';

    this.img.addEventListener('load', this.handleLoad);

    if (src) {
      this.setSrc(src);
    }
  }

  /**
   * Appends a query string to an image URL to
   * prevent bad cache behaviors with CORS with S3
   */
  private normalizeSrc(baseSrcUrl: string | null) {
    if (!baseSrcUrl) return '';
    return `${baseSrcUrl}?cacheBust=true`;
  }

  setSrc = (src: string) => {
    const normalized = this.normalizeSrc(src);
    if (this.img.src === normalized) {
      return;
    }
    this._loaded = false;
    return new Promise<void>((resolve, reject) => {
      const handleError = () => {
        this.img.removeEventListener('error', handleError);
        this._broken = true;
        reject();
      };
      const handleLoad = () => {
        this.img.removeEventListener('load', handleLoad);
        resolve();
      };
      this.img.addEventListener('error', handleError);
      this.img.addEventListener('load', handleLoad);

      this.img.src = normalized;
    });
  };

  get image() {
    return this.img;
  }

  get broken() {
    return this._broken;
  }

  get loaded() {
    return this._loaded;
  }

  private handleLoad = () => {
    this._loaded = true;
  };
}
