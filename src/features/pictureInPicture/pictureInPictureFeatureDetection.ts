export const isPIPAvailable =
  // @ts-ignore no types for PIP properties are official yet
  typeof window !== 'undefined' && 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;

// note: for now, it seems autoPIP only works in a PWA
const isPWA = window.matchMedia('(display-mode: standalone)').matches;
export const isAutoPIPAvailable = isPWA && 'autoPictureInPicture' in HTMLVideoElement.prototype;
