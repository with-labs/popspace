/// <reference types="react-scripts" />

declare const VERSION: string;

declare module 'volume-meter' {
  const volumeMeter: (
    ctx: AudioContext,
    tweenOpts?: { tweenIn?: number; tweenOut?: number },
    cb?: (volume: number) => any
  ) => AudioNode;

  export default volumeMeter;
}
