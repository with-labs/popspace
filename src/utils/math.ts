import { Vector2 } from '../types/spatials';

/**
 * Constrains a number to be between a min and max value
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function addVectors(v1: Vector2, v2: Vector2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

export function subtractVectors(v1: Vector2, v2: Vector2) {
  return addVectors(v1, {
    x: -v2.x,
    y: -v2.y,
  });
}

export function roundVector(vector: Vector2) {
  return {
    x: Math.round(vector.x),
    y: Math.round(vector.y),
  };
}

export function vectorDistance(v1: Vector2, v2: Vector2) {
  return Math.sqrt(Math.pow(Math.abs(v1.x - v1.y), 2) + Math.pow(Math.abs(v1.y - v2.y), 2));
}
