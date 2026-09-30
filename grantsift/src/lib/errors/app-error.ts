export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "YOUTUBE_ERROR"
  | "GEMINI_ERROR"
  | "DATABASE_ERROR"
  | "EXPORT_ERROR"
  | "RATE_LIMIT_ERROR"
  | "NETWORK_ERROR"
  | "PROCESSING_ERROR"
  | "CONFIGURATION_ERROR";

/** Thrown by services; caught at the API boundary and turned into ApiResponse. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly userMessage: string;

  constructor(code: ErrorCode, userMessage: string, cause?: unknown) {
    super(userMessage);
    this.code = code;
    this.userMessage = userMessage;
    this.cause = cause;
  }
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string } };

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function fail(error: unknown): ApiResponse<never> {
  if (error instanceof AppError) {
    return { success: false, error: { code: error.code, message: error.userMessage } };
  }
  // Never leak stack traces or raw error strings to the client.
  console.error("Unhandled error:", error);
  return {
    success: false,
    error: { code: "PROCESSING_ERROR", message: "Something went wrong. Please try again." },
  };
}
