export const MIN_WIDGET_WIDTH = 160;
export const MIN_WIDGET_HEIGHT = 98;
export const MAX_ROOM_NAME_LENGTH = 60;

// TODO: figure out a better way of getting this from the backend
// will have to figure this out to dynamically set these for paid or free accounts
export const MAX_FREE_ROOMS = 20;

// in world space coordinates - this is the farthest possible distance
// you can hear someone / something from - even if very faintly.
// To allow people to find quiet spaces, we probably want this to be
// no larger than 3/4 the room size, maybe smaller
export const MAX_AUDIO_RANGE = 1200;

// "infinite"
export const DEFAULT_ROOM_SIZE = 2400;
