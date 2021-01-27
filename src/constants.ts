export const DEFAULT_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  // fix for Chromium bug #1084702: video size must be a
  // multiple of 16 to avoid corruption on Pixel 3(a)
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1084702
  width: 1024,
  // our videos are square, so the capture dimensions are also square
  height: 1024,
  frameRate: 24,
};
