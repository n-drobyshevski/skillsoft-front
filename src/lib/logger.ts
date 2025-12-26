/**
 * Structured logging utility for SkillSoft frontend
 *
 * Provides consistent logging with log levels and context.
 * Development logs are suppressed in production.
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.debug('Processing items', { count: items.length });
 * logger.info('User logged in', { userId: user.id });
 * logger.warn('Rate limit approaching', { remaining: 10 });
 * logger.error('API request failed', error, { endpoint: '/api/data' });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Log level colors for development console
const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};
const RESET = '\x1b[0m';

// Format log prefix
const formatPrefix = (level: LogLevel, module?: string): string => {
  const timestamp = new Date().toISOString();
  const levelStr = level.toUpperCase().padEnd(5);
  const moduleStr = module ? `[${module}]` : '';

  if (typeof window === 'undefined') {
    // Server-side: use colors
    return `${LOG_COLORS[level]}${timestamp} ${levelStr}${RESET} ${moduleStr}`;
  }
  // Client-side: no ANSI colors
  return `${timestamp} ${levelStr} ${moduleStr}`;
};

// Format context object for logging
const formatContext = (context?: LogContext): string => {
  if (!context || Object.keys(context).length === 0) return '';

  try {
    return JSON.stringify(context);
  } catch {
    return '[Unable to serialize context]';
  }
};

// Core logging function
const log = (
  level: LogLevel,
  message: string,
  errorOrContext?: Error | LogContext,
  context?: LogContext
): void => {
  // Suppress debug logs in production
  if (level === 'debug' && !isDevelopment) return;

  // Suppress all logs in test environment unless explicitly enabled
  if (isTest && !process.env.ENABLE_TEST_LOGS) return;

  const prefix = formatPrefix(level);

  // Handle different argument patterns
  let error: Error | undefined;
  let ctx: LogContext | undefined;

  if (errorOrContext instanceof Error) {
    error = errorOrContext;
    ctx = context;
  } else {
    ctx = errorOrContext;
  }

  const contextStr = formatContext(ctx);
  const fullMessage = contextStr ? `${message} ${contextStr}` : message;

  switch (level) {
    case 'debug':
      console.debug(prefix, fullMessage);
      break;
    case 'info':
      console.info(prefix, fullMessage);
      break;
    case 'warn':
      console.warn(prefix, fullMessage);
      break;
    case 'error':
      if (error) {
        console.error(prefix, fullMessage, error);
      } else {
        console.error(prefix, fullMessage);
      }
      break;
  }
};

/**
 * Create a logger with a specific module name for context
 *
 * @example
 * ```typescript
 * const log = createLogger('PsychometricsCache');
 * log.debug('Fetching dashboard data');
 * log.error('Failed to fetch', error, { endpoint: '/dashboard' });
 * ```
 */
export const createLogger = (module: string) => {
  const logWithModule = (
    level: LogLevel,
    message: string,
    errorOrContext?: Error | LogContext,
    context?: LogContext
  ): void => {
    const prefix = formatPrefix(level, module);

    let error: Error | undefined;
    let ctx: LogContext | undefined;

    if (errorOrContext instanceof Error) {
      error = errorOrContext;
      ctx = context;
    } else {
      ctx = errorOrContext;
    }

    // Suppress debug logs in production
    if (level === 'debug' && !isDevelopment) return;
    if (isTest && !process.env.ENABLE_TEST_LOGS) return;

    const contextStr = formatContext(ctx);
    const fullMessage = contextStr ? `${message} ${contextStr}` : message;

    switch (level) {
      case 'debug':
        console.debug(prefix, fullMessage);
        break;
      case 'info':
        console.info(prefix, fullMessage);
        break;
      case 'warn':
        console.warn(prefix, fullMessage);
        break;
      case 'error':
        if (error) {
          console.error(prefix, fullMessage, error);
        } else {
          console.error(prefix, fullMessage);
        }
        break;
    }
  };

  return {
    debug: (message: string, context?: LogContext) =>
      logWithModule('debug', message, context),
    info: (message: string, context?: LogContext) =>
      logWithModule('info', message, context),
    warn: (message: string, context?: LogContext) =>
      logWithModule('warn', message, context),
    error: (message: string, errorOrContext?: Error | LogContext, context?: LogContext) =>
      logWithModule('error', message, errorOrContext, context),
  };
};

/**
 * Default logger instance for general use
 */
export const logger = {
  /**
   * Debug-level logging (suppressed in production)
   * Use for detailed debugging information
   */
  debug: (message: string, context?: LogContext): void =>
    log('debug', message, context),

  /**
   * Info-level logging
   * Use for general operational information
   */
  info: (message: string, context?: LogContext): void =>
    log('info', message, context),

  /**
   * Warning-level logging
   * Use for potentially harmful situations
   */
  warn: (message: string, context?: LogContext): void =>
    log('warn', message, context),

  /**
   * Error-level logging
   * Use for error events that might still allow the application to continue
   */
  error: (message: string, errorOrContext?: Error | LogContext, context?: LogContext): void =>
    log('error', message, errorOrContext, context),
};

/**
 * Pre-configured loggers for common modules
 *
 * @example
 * ```typescript
 * import { loggers } from '@/lib/logger';
 *
 * const log = loggers.api.withContext('Competencies');
 * log.debug('Fetching competencies');
 * ```
 */
const createModuleLoggers = (moduleName: string) => {
  const baseLogger = createLogger(moduleName);
  return {
    ...baseLogger,
    /**
     * Create a sub-logger with additional context
     */
    withContext: (context: string) => createLogger(`${moduleName}:${context}`),
  };
};

export const loggers = {
  api: createModuleLoggers('API'),
  psychometrics: createModuleLoggers('Psychometrics'),
  auth: createModuleLoggers('Auth'),
  cache: createModuleLoggers('Cache'),
  store: createModuleLoggers('Store'),
  ui: createModuleLoggers('UI'),
  test: createModuleLoggers('Test'),
};

export default logger;
