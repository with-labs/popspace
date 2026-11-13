// always log in dev, and allow setting a flag to log in prod
const showDebugLogs =
  process.env.NODE_ENV !== 'production' ||
  (typeof window !== 'undefined' && localStorage.getItem('DEBUG') === 'true') ||
  (typeof window === 'undefined' && process.env.DEBUG === 'true');

const doLog = (
  level: 'info' | 'warn' | 'error' | 'debug' | 'log' | 'critical',
  ...messages: any[]
) => {
  const consoleLevel = level === 'critical' ? 'error' : level;
  if (level !== 'debug' || showDebugLogs) {
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
