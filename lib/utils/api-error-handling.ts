import { NextRequest, NextResponse } from 'next/server';
import { AppError, logger, handleError, ErrorType } from '@/lib/utils/error-handling';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API response helpers
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId
  };
}

export function createErrorResponse(
  error: string | AppError,
  requestId?: string
): ApiResponse {
  return {
    success: false,
    error: typeof error === 'string' ? error : error.message,
    timestamp: new Date().toISOString(),
    requestId
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  message?: string,
  requestId?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString(),
    requestId
  };
}

// Request validation helper
export function validateRequest(
  request: NextRequest,
  requiredFields: string[] = [],
  allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE']
): void {
  // Validate HTTP method
  if (!allowedMethods.includes(request.method)) {
    throw new AppError(
      `Method ${request.method} not allowed`,
      ErrorType.VALIDATION,
      405
    );
  }

  // For non-GET requests, validate required fields
  if (request.method !== 'GET' && requiredFields.length > 0) {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new AppError(
        'Content-Type must be application/json',
        ErrorType.VALIDATION,
        400
      );
    }
  }
}

// Rate limiting helper (simple in-memory implementation)
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isRateLimited(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
  ): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const requestTimes = this.requests.get(identifier) || [];
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return true;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return false;
  }

  getRemainingRequests(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const requestTimes = this.requests.get(identifier) || [];
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    return Math.max(0, maxRequests - validRequests.length);
  }
}

const rateLimiter = new RateLimiter();

// API route wrapper with error handling
export function withApiErrorHandling<T = any>(
  handler: (
    request: NextRequest,
    context: { params?: any }
  ) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (
    request: NextRequest,
    context: { params?: any } = {}
  ): Promise<NextResponse<ApiResponse<T>>> => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      // Log incoming request
      logger.info('API request received', {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        requestId
      });

      // Check rate limiting
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      
      if (rateLimiter.isRateLimited(clientIP)) {
        const remaining = rateLimiter.getRemainingRequests(clientIP);
        logger.warn('Rate limit exceeded', { clientIP, requestId });
        
        return NextResponse.json(
          createErrorResponse('Rate limit exceeded. Please try again later.', requestId),
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': (Date.now() + 60000).toString()
            }
          }
        );
      }

      // Execute the handler
      const response = await handler(request, context);
      
      // Log successful response
      const duration = Date.now() - startTime;
      logger.info('API request completed', {
        method: request.method,
        url: request.url,
        statusCode: response.status,
        duration: `${duration}ms`,
        requestId
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      
      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      const appError = handleError(error, {
        method: request.method,
        url: request.url,
        duration: `${duration}ms`
      });

      logger.error('API request failed', appError, {
        method: request.method,
        url: request.url,
        duration: `${duration}ms`,
        requestId
      });

      // Return appropriate error response
      const errorResponse = createErrorResponse(
        appError.isOperational ? appError.message : 'Internal server error',
        requestId
      );

      return NextResponse.json(errorResponse, {
        status: appError.statusCode,
        headers: {
          'X-Request-ID': requestId
        }
      });
    }
  };
}

// Server action wrapper with error handling
export function withServerActionErrorHandling<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<{ success: boolean; data?: R; error?: string }> => {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      logger.info('Server action started', {
        actionName: action.name,
        actionId
      });

      const result = await action(...args);
      
      const duration = Date.now() - startTime;
      logger.info('Server action completed', {
        actionName: action.name,
        duration: `${duration}ms`,
        actionId
      });

      return { success: true, data: result };

    } catch (error) {
      const duration = Date.now() - startTime;
      const appError = handleError(error, {
        actionName: action.name,
        duration: `${duration}ms`
      });

      logger.error('Server action failed', appError, {
        actionName: action.name,
        duration: `${duration}ms`,
        actionId
      });

      return {
        success: false,
        error: appError.isOperational ? appError.message : 'An unexpected error occurred'
      };
    }
  };
}

// Database operation wrapper
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  userId?: string
): Promise<T> {
  try {
    logger.debug(`Database operation started: ${operationName}`, {}, userId);
    
    const result = await operation();
    
    logger.debug(`Database operation completed: ${operationName}`, {}, userId);
    return result;

  } catch (error) {
    const dbError = new AppError(
      `Database operation failed: ${operationName}`,
      ErrorType.DATABASE,
      500,
      true,
      userId,
      { operationName, originalError: error instanceof Error ? error.message : String(error) }
    );

    logger.error(`Database operation failed: ${operationName}`, dbError, {}, userId);
    throw dbError;
  }
}

// External API call wrapper
export async function withExternalApiErrorHandling<T>(
  apiCall: () => Promise<T>,
  serviceName: string,
  userId?: string
): Promise<T> {
  try {
    logger.debug(`External API call started: ${serviceName}`, {}, userId);
    
    const result = await apiCall();
    
    logger.debug(`External API call completed: ${serviceName}`, {}, userId);
    return result;

  } catch (error) {
    let errorType = ErrorType.NETWORK;
    let statusCode = 503;

    // Check if it's a specific AI service error
    if (serviceName.toLowerCase().includes('openai') || serviceName.toLowerCase().includes('ai')) {
      errorType = ErrorType.AI_SERVICE;
      statusCode = 502;
    }

    const apiError = new AppError(
      `External API call failed: ${serviceName}`,
      errorType,
      statusCode,
      true,
      userId,
      { serviceName, originalError: error instanceof Error ? error.message : String(error) }
    );

    logger.error(`External API call failed: ${serviceName}`, apiError, {}, userId);
    throw apiError;
  }
}