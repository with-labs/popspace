export function randomString(prefix: string = '') {
  return `${prefix}${Math.random().toString(36).slice(2)}`;
}
