import * as Sentry from '@sentry/react';
import { Breadcrumb } from '@sentry/react';

const sentryLevelMap = {
  info: Sentry.Severity.Info,
  warn: Sentry.Severity.Warning,
  error: Sentry.Severity.Error,
  debug: Sentry.Severity.Debug,
  log: Sentry.Severity.Log,
  critical: Sentry.Severity.Critical,
};

const doLog = (level: 'info' | 'warn' | 'error' | 'debug' | 'log' | 'critical', ...messages: any[]) => {
  const consoleLevel = level === 'critical' ? 'error' : level;
  // always log in dev, and allow setting a flag to log in prod
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('DEBUG') === 'true') {
    console[consoleLevel](...messages);
  }
  // for now we filter out debug messages from Sentry - but perhaps it's good to include
  // them for additional context
  if (process.env.NODE_ENV === 'production' && level !== 'debug') {
    // for errors, send Error objects as exceptions to Sentry
    const firstError = messages.find((m) => m instanceof Error);
    if (firstError) {
      Sentry.captureException(firstError, { level: sentryLevelMap[level] });
    }
    // capture any other string logs, stringify others
    const strings = messages.map((m) => (typeof m === 'string' ? m : m.toString?.() ?? '...'));
    if (strings) {
      Sentry.captureMessage(strings.join(' '), { level: sentryLevelMap[level] });
    }
  }
};

export const logger = {
  info: doLog.bind(null, 'info'),
  warn: doLog.bind(null, 'warn'),
  error: doLog.bind(null, 'error'),
  debug: doLog.bind(null, 'debug'),
  log: doLog.bind(null, 'log'),
  critical: doLog.bind(null, 'critical'),
  breadcrumb: (breadcrumb: Breadcrumb) => {
    if (process.env.NODE_ENV === 'production' || localStorage.getItem('DEBUG') === 'true') {
      Sentry.addBreadcrumb(breadcrumb);
    }
    if (localStorage.getItem('DEBUG') === 'true') {
      console.debug(`[breadcrumb] (${breadcrumb.category || 'uncategorized'}) ${breadcrumb.message}`);
    }
  },
};
