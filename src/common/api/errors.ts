/**
 * Mirrors the backend's ErrorResponse shape.
 */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Extracts a user-facing error message from a React Query mutation/query error.
 * Returns the API's message when available, the fallback when the request
 * failed without an ApiError, and null when there's no error.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string | null {
  if (error instanceof ApiError) return error.message;
  if (error) return fallback;
  return null;
}