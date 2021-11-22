import { get } from 'lodash';

/** Converts a list of objects with IDs to a Record, keying by ID. */
export function mapById<T extends {} = any>(array: T[], idPath: string = 'id'): Record<string, T> {
  return array.reduce<Record<string, T>>((map, item) => {
    map[get(item, idPath)] = item;
    return map;
  }, {});
}
