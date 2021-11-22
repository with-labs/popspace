import moment from 'moment';

export class Time {
  now() {
    // We prefer to use timestamptz and keep everything in utc
    return moment.utc().format();
  }

  timestamptzPlusMillis(timestamptz: string | Date, millis: number | string) {
    const startMoment = moment(timestamptz).utc();
    millis = typeof millis === 'number' ? millis : parseInt(millis);
    return moment(startMoment.valueOf() + millis)
      .utc()
      .format();
  }

  timestamptzStillCurrent(timestamptz: Date | string) {
    // timestamptz = A moment in the future that should
    // be ahead of the present => greater comparison
    return (
      !timestamptz || moment(timestamptz).valueOf() > moment.utc().valueOf()
    );
  }

  timestamptzHasPassed(timestamptz: Date | string) {
    // timestamptz = A moment in time in the past that is
    // before now => less comparison
    return (
      timestamptz && moment(timestamptz).valueOf() < moment.utc().valueOf()
    );
  }

  isTimestamptzAfter(timestamptz1: Date | string, timestamptz2: Date | string) {
    return moment(timestamptz1).valueOf() > moment(timestamptz2).valueOf();
  }
}

export default new Time();
