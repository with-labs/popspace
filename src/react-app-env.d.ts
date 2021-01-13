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

declare const Canny: (
  command: 'identify',
  opts: {
    appID: string;
    user: {
      email: string;
      name: string;
      id: string;

      avatarURL?: string;
      created?: string;
    };
  }
) => void;

interface Fonts extends EventSource {
  check(fontString: string): boolean;
  ready: Promise<any>;
}

declare interface Document {
  fonts: Fonts;
}

declare module '*.mp4' {
  const path: string;
  export default path;
}
