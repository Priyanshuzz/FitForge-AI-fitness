/**
 * Comprehensive error handling and logging utilities for FitForge AI
 */

// Error types for better categorization
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AI_SERVICE = 'AI_SERVICE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  PAYMENT = 'PAYMENT',
  UNKNOWN = 'UNKNOWN',
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// Custom error classes
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly userId?: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode: number = 500,
    isOperational: boolean = true,
    userId?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.userId = userId;
    this.context = context;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, userId?: string) {
    super(message, ErrorType.VALIDATION, 400, true, userId, { field });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', userId?: string) {
    super(message, ErrorType.AUTHENTICATION, 401, true, userId);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', userId?: string) {
    super(message, ErrorType.AUTHORIZATION, 403, true, userId);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error, userId?: string) {
    super(message, ErrorType.NETWORK, 503, true, userId, {
      originalError: originalError?.message,
    });
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, query?: string, userId?: string) {
    super(message, ErrorType.DATABASE, 500, true, userId, { query });
    this.name = 'DatabaseError';
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, service?: string, userId?: string) {
    super(message, ErrorType.AI_SERVICE, 502, true, userId, { service });
    this.name = 'AIServiceError';
  }
}

// Logger interface
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  error?: Error;
  context?: Record<string, any>;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private serviceName = 'fitforge-ai';

  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, userId, error, context, requestId } =
      entry;

    const logObject = {
      service: this.serviceName,
      level,
      message,
      timestamp,
      ...(userId && { userId }),
      ...(requestId && { requestId }),
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...(error instanceof AppError && {
            type: error.type,
            statusCode: error.statusCode,
            isOperational: error.isOperational,
          }),
        },
      }),
    };

    return JSON.stringify(logObject);
  }

  private writeLog(entry: LogEntry): void {
    const formattedLog = this.formatLogEntry(entry);

    if (this.isDevelopment) {
      // Pretty print for development
      console.log(`[${entry.level}] ${entry.message}`, entry.context || '');
      if (entry.error) {
        console.error(entry.error);
      }
    } else {
      // Structured logging for production
      console.log(formattedLog);
    }

    // In production, you might want to send logs to external services
    // like Winston, Pino, or cloud logging services
    if (!this.isDevelopment && entry.level === LogLevel.ERROR) {
      this.sendToExternalLogger(formattedLog);
    }
  }

  private sendToExternalLogger(logEntry: string): void {
    // External logging service integration (Sentry, LogRocket, etc.)
    try {
      const parsed = JSON.parse(logEntry);

      // Sentry integration
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(parsed.message), {
          extra: parsed.context,
          user: parsed.userId ? { id: parsed.userId } : undefined,
          level: 'error',
          tags: {
            service: this.serviceName,
            errorType: parsed.context?.type || 'unknown',
          },
        });
      }

      // For server-side logging, you can integrate with services like:
      // - Winston with external transports
      // - DataDog logs
      // - CloudWatch
      // - LogRocket
      // - Splunk

      // Example for server-side Sentry (Node.js)
      if (typeof window === 'undefined' && process.env.SENTRY_DSN) {
        // This would require @sentry/node package
        // Sentry.captureException(new Error(parsed.message), { ... });
      }

      // Console fallback for development
      if (this.isDevelopment) {
        console.group('🔍 External Logger');
        console.log('Log Entry:', parsed);
        console.groupEnd();
      }
    } catch (e) {
      console.error('Failed to send to external logger:', e);
    }
  }

  debug(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.writeLog({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId,
    });
  }

  info(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.writeLog({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId,
    });
  }

  warn(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.writeLog({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId,
    });
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.writeLog({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      error,
      context,
      userId,
      requestId,
    });
  }

  fatal(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.writeLog({
      level: LogLevel.FATAL,
      message,
      timestamp: new Date().toISOString(),
      error,
      context,
      userId,
      requestId,
    });
  }
}

// Singleton logger instance
export const logger = new Logger();

// Error handling utilities
export const handleError = (
  error: unknown,
  context?: Record<string, any>,
  userId?: string
): AppError => {
  if (error instanceof AppError) {
    logger.error(
      error.message,
      error,
      { ...context, ...error.context },
      userId
    );
    return error;
  }

  if (error instanceof Error) {
    const appError = new AppError(
      error.message,
      ErrorType.UNKNOWN,
      500,
      false,
      userId,
      context
    );
    logger.error('Unexpected error occurred', appError, context, userId);
    return appError;
  }

  const unknownError = new AppError(
    'An unknown error occurred',
    ErrorType.UNKNOWN,
    500,
    false,
    userId,
    { originalError: String(error), ...context }
  );
  logger.error('Unknown error type', unknownError, context, userId);
  return unknownError;
};

// Async error wrapper for API routes and server actions
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (
    ...args: T
  ): Promise<{ success: boolean; data?: R; error?: string }> => {
    try {
      const result = await fn(...args);
      return { success: true, data: result };
    } catch (error) {
      const appError = handleError(error);
      return {
        success: false,
        error: appError.isOperational
          ? appError.message
          : 'An unexpected error occurred',
      };
    }
  };
};

// Client-side error boundary helper
export const reportError = (
  error: Error,
  errorInfo?: any,
  userId?: string
): void => {
  const appError = handleError(error, errorInfo, userId);

  // Report to external error tracking service
  if (typeof window !== 'undefined') {
    // Send to error tracking service
    logger.error('Client-side error', appError, errorInfo, userId);
  }
};

// Performance monitoring
export const measurePerformance = <T>(
  fn: () => T,
  operationName: string,
  userId?: string
): T => {
  const start = performance.now();
  const startTime = new Date().toISOString();

  try {
    const result = fn();
    const duration = performance.now() - start;

    logger.info(
      `Operation completed: ${operationName}`,
      {
        duration: `${duration.toFixed(2)}ms`,
        startTime,
      },
      userId
    );

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(
      `Operation failed: ${operationName}`,
      error instanceof Error ? error : new Error(String(error)),
      {
        duration: `${duration.toFixed(2)}ms`,
        startTime,
      },
      userId
    );
    throw error;
  }
};

// Async performance monitoring
export const measureAsyncPerformance = async <T>(
  fn: () => Promise<T>,
  operationName: string,
  userId?: string
): Promise<T> => {
  const start = performance.now();
  const startTime = new Date().toISOString();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    logger.info(
      `Async operation completed: ${operationName}`,
      {
        duration: `${duration.toFixed(2)}ms`,
        startTime,
      },
      userId
    );

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(
      `Async operation failed: ${operationName}`,
      error instanceof Error ? error : new Error(String(error)),
      {
        duration: `${duration.toFixed(2)}ms`,
        startTime,
      },
      userId
    );
    throw error;
  }
};
