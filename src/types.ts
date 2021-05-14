/**
 * Data for a file upload
 */
export interface WithFile {
  name: string;
  mimetype: string;
  url: string;
}

/**
 * Additional data processed for image file uploads
 */
export interface WithImageData {
  fileId: number;
  thumbnailUrl: string;
  dominantColor: string;
}
