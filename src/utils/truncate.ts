/** Truncates a string, adding an ending part (... by default) */
export function truncate(str: string, limit: number, ending: string = '...') {
  if (str.length <= limit) return str;
  return str.slice(0, limit - ending.length) + ending;
}
