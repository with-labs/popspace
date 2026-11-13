/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare const VERSION: string;

declare module 'volume-meter' {
  const volumeMeter: (
    ctx: AudioContext,
    tweenOpts?: { tweenIn?: number; tweenOut?: number },
    cb?: (volume: number) => any
  ) => AudioNode;

  export default volumeMeter;
}

type CannyOptions = {
  identify: {
    appID: string;
    user: {
      email: string;
      name: string;
      id: string;
      avatarURL?: string;
      created?: string;
    };
  };
  initChangelog: {
    appID: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    align: 'top' | 'bottom' | 'left' | 'right';
  };
  closeChangelog: Record<string, never>;
};
declare const Canny: <Command extends 'identify' | 'initChangelog' | 'closeChangelog'>(
  command: Command,
  opts: CannyOptions[Command] = {}
) => void;

interface Fonts extends EventSource {
  check(fontString: string): boolean;
  ready: Promise<any>;
}

declare interface Document {
  fonts: Fonts;
}

declare interface Window {
  $crisp: any;
  CRISP_WEBSITE_ID: string;
}

declare module 'simple-quadtree' {
  class QuadTree<T extends { x: number; y: number; w: number; h: number }> {
    constructor(x: number, y: number, width: number, height: number, opts?: { maxChildren: number }): this;
    put(obj: T): void;
    get(view: T): T[];
    clear(): void;
  }
  export default QuadTree;
}

declare module '@typeform/embed-react';

declare namespace NodeJS {
  interface ProcessEnv {
    // set by the `define` in vite.config.mts
    PUBLIC_URL: string;
  }
}
