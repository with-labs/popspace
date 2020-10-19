import { Vector2 } from '../types/spatials';

/**
 * Constrains a number to be between a min and max value
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min?: number, max?: number) {
  return Math.max(min ?? -Infinity, Math.min(max ?? Infinity, value));
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

export function multiplyVector(vec: Vector2, mult: number) {
  return {
    x: vec.x * mult,
    y: vec.y * mult,
  };
}

export function roundVector(vector: Vector2) {
  return {
    x: Math.round(vector.x),
    y: Math.round(vector.y),
  };
}

/** restricts a vector to the bounds of the rectangle defined by min and max */
export function clampVector(v: Vector2, min: Vector2, max: Vector2) {
  return {
    x: clamp(v.x, min.x, max.x),
    y: clamp(v.y, min.y, max.y),
  };
}

export function vectorDistance(v1: Vector2, v2: Vector2) {
  return Math.sqrt(Math.pow(Math.abs(v1.x - v2.x), 2) + Math.pow(Math.abs(v1.y - v2.y), 2));
}

/**
 * "Fuzzes" a vector by moving it a bit in a random direction
 * @param vec the original position
 * @param maxDistance maximum distance to fuzz
 */
export function fuzzVector(vec: Vector2, maxDistance: number = 10) {
  const randomAngle = Math.random() * Math.PI * 2;
  const directionNormal = {
    x: Math.cos(randomAngle),
    y: Math.sin(randomAngle),
  };
  return addVectors(vec, multiplyVector(directionNormal, Math.random() * maxDistance));
}
