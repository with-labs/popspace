declare module 'async-exit-hook' {
  const hook: (hook: (cb: () => void) => void | Promise<void>) => void;
  export default hook;
}
