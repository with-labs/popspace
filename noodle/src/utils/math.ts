import { Vector2 } from '../types/spatials';
import seedRandom from 'seed-random';

/**
 * Constrains a number to be between a min and max value
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number = -Infinity, max: number = Infinity) {
  // if min and max overlap, return the average (center)
  if (min > max) {
    return (min + max) / 2;
  }
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

export function multiplyVector(vec: Vector2, mult: number) {
  return {
    x: vec.x * mult,
    y: vec.y * mult,
  };
}

export function normalizeVector(vec: Vector2) {
  const len = vectorLength(vec);
  if (len === 0) {
    return { x: 0, y: 0 };
  }
  return multiplyVector(vec, 1 / len);
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

export function vectorLength(v: Vector2) {
  return vectorDistance(v, { x: 0, y: 0 });
}

/**
 * "Fuzzes" a vector by moving it a bit in a random direction
 * @param vec the original position
 * @param maxDistance maximum distance to fuzz
 */
export function fuzzVector(vec: Vector2, maxDistance: number = 10, seed?: string) {
  const rand = seedRandom(seed);
  const randomAngle = rand() * Math.PI * 2;
  const directionNormal = {
    x: Math.cos(randomAngle),
    y: Math.sin(randomAngle),
  };
  return addVectors(vec, multiplyVector(directionNormal, rand() * maxDistance));
}

/**
 * Rounds a value to the closest multiple of an increment
 */
export function snap(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}

/**
 * Rounds a value to the closest multiple of an increment,
 * defaulting to 1 x increment if the value is smaller than 1
 * increment instead of 0.
 */
export function snapWithoutZero(value: number, increment: number) {
  return Math.max(increment, snap(value, increment));
}

/**
 * Measures if a number is between a min and max, inclusive on both
 * ends. If either min or max is undefined, it passes that check.
 */
export function isInBounds(value: number, min?: number, max?: number) {
  return (!max || value <= max) && (!min || value >= min);
}

/**
 * Compares two numbers for equality, with a given tolerance
 */
export function compareEpsilon(value: number, target: number, epsilon = Number.EPSILON) {
  return Math.abs(value - target) <= epsilon;
}

/**
 * Compares two numbers for equality with a percentage-based tolerance. Default 1%.
 */
export function compareWithTolerance(value: number, target: number, tolerance = 0.01) {
  const ratio = value / target;
  const delta = Math.abs(ratio - 1);
  return delta < tolerance;
}

export function roundTenths(percentage: number) {
  return Math.round(percentage * 10) / 10;
}
