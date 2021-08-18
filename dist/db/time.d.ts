export declare class Time {
    now(): string;
    timestamptzPlusMillis(timestamptz: string | Date, millis: number | string): string;
    timestamptzStillCurrent(timestamptz: Date | string): boolean;
    timestamptzHasPassed(timestamptz: Date | string): boolean;
    isTimestamptzAfter(timestamptz1: Date | string, timestamptz2: Date | string): boolean;
}
declare const _default: Time;
export default _default;
