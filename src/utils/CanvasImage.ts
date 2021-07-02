/**
 * Creates a new HTML Image element from a source URL
 * string. This utility encapsulates some repetitive
 * or tricky aspects of CORS handling and loading state.
 */
export class CanvasImage {
  private img: HTMLImageElement;
  private loaded = false;

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
    if (baseSrcUrl.includes('amazonaws.com')) {
      return `${baseSrcUrl}?pip=true`;
    } else {
      return baseSrcUrl;
    }
  }

  setSrc = (src: string) => {
    const normalized = this.normalizeSrc(src);
    if (this.img.src === normalized) {
      return;
    }
    this.loaded = false;
    return new Promise<void>((resolve, reject) => {
      const handleError = () => {
        this.img.removeEventListener('error', handleError);
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

  private handleLoad = () => {
    this.loaded = true;
  };
}
