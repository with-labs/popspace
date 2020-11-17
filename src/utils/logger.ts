import * as Sentry from '@sentry/react';

const doLog = (level: 'info' | 'warn' | 'error' | 'debug' | 'log', ...messages: any[]) => {
  // always log in dev, and allow setting a flag to log in prod
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('DEBUG') === 'true') {
    console[level](...messages);
  }
  if (process.env.NODE_ENV === 'production' && level === 'error') {
    // for errors, send Error objects as exceptions to Sentry
    const firstError = messages.find((m) => m instanceof Error);
    if (firstError) {
      Sentry.captureException(firstError, { level: Sentry.Severity.Error });
    }
    // capture any other string logs, stringify others
    const strings = messages.map((m) => (typeof m === 'string' ? m : m.toString?.() ?? '...'));
    if (strings) {
      Sentry.captureMessage(strings.join(' '), { level: Sentry.Severity.Error });
    }
  }
};

export const logger = {
  info: doLog.bind(null, 'info'),
  warn: doLog.bind(null, 'warn'),
  error: doLog.bind(null, 'error'),
  debug: doLog.bind(null, 'debug'),
  log: doLog.bind(null, 'log'),
};
