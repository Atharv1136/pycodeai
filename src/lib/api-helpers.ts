import { NextResponse } from 'next/server';

/**
 * Standardized API error response helper
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: string | object
) {
  const response: any = {
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Standardized success response helper
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  status: number = 200
) {
  const response: any = {
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * Log API error with context
 */
export function logApiError(
  context: string,
  error: any,
  additionalInfo?: Record<string, any>
) {
  console.error(`[API] ${context}:`, error);
  if (error?.stack) {
    console.error(`[API] ${context} stack:`, error.stack);
  }
  if (additionalInfo) {
    console.error(`[API] ${context} additional info:`, additionalInfo);
  }
}

