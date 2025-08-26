interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

interface ErrorContext {
  functionName: string;
  userId?: string;
  requestBody?: any;
  headers?: Record<string, string>;
}

export enum ErrorCodes {
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  AI_PROCESSING_ERROR = 'AI_PROCESSING_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class EdgeFunctionError extends Error {
  public readonly code: ErrorCodes;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: ErrorCodes,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ErrorHandler {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  static createErrorResponse(
    error: Error | EdgeFunctionError,
    context: ErrorContext
  ): Response {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    // Log error for monitoring
    this.logError(error, context, requestId);

    if (error instanceof EdgeFunctionError) {
      const errorResponse: ErrorResponse = {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp,
        requestId
      };

      return new Response(JSON.stringify(errorResponse), {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Request-ID': requestId
        }
      });
    }

    // Handle unknown errors
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      code: ErrorCodes.INTERNAL_ERROR,
      timestamp,
      requestId
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Request-ID': requestId
      }
    });
  }

  private static logError(
    error: Error,
    context: ErrorContext,
    requestId: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      functionName: context.functionName,
      userId: context.userId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error instanceof EdgeFunctionError ? error.code : 'UNKNOWN'
      },
      context: {
        requestBody: this.sanitizeRequestBody(context.requestBody),
        userAgent: context.headers?.['user-agent'],
        origin: context.headers?.['origin']
      }
    };

    console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
  }

  private static sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'api_key', 'secret'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  static validateRequest(
    body: any,
    requiredFields: string[],
    functionName: string
  ): void {
    if (!body || typeof body !== 'object') {
      throw new EdgeFunctionError(
        'Request body is required',
        ErrorCodes.INVALID_REQUEST,
        400
      );
    }

    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      throw new EdgeFunctionError(
        `Missing required fields: ${missingFields.join(', ')}`,
        ErrorCodes.VALIDATION_ERROR,
        400,
        { missingFields }
      );
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }

    throw lastError!;
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};