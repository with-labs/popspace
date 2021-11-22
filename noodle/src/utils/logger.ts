/* eslint-disable no-console */

const doLog = (level: 'info' | 'warn' | 'error' | 'debug' | 'log' | 'critical', ...messages: any[]) => {
  const consoleLevel = level === 'critical' ? 'error' : level;
  // always log in dev, and allow setting a flag to log in prod
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('DEBUG') === 'true') {
    console[consoleLevel](...messages);
  }
};

export const logger = {
  info: doLog.bind(null, 'info'),
  warn: doLog.bind(null, 'warn'),
  error: doLog.bind(null, 'error'),
  debug: doLog.bind(null, 'debug'),
  log: doLog.bind(null, 'log'),
  critical: doLog.bind(null, 'critical'),
};
