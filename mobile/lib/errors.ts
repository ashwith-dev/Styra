/** Application error with user-facing and debug information. */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly serverDetail?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  get isAuthError(): boolean {
    return this.statusCode === 401;
  }

  get isNetworkError(): boolean {
    return this.statusCode === undefined || this.statusCode === 0;
  }
}

/**
 * Map an arbitrary caught value to an AppError with a user-friendly message.
 */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof Error) {
    return new AppError(err.message);
  }

  if (typeof err === "string") return new AppError(err);

  return new AppError("Something went wrong");
}

/**
 * Extract a user-facing message from a network/server error.
 * Tries to unwrap Axios-style error shapes and Supabase error messages.
 */
export function getUserFacingMessage(err: unknown): string {
  const error = toAppError(err);

  if (error.isNetworkError) {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  if (error.isAuthError) {
    return "Your session has expired. Please sign in again.";
  }

  // Try to pull a detail from a nested response
  const detail =
    (error.serverDetail as any)?.detail?.error ??
    (error.serverDetail as any)?.detail?.message ??
    (error.serverDetail as any)?.detail;

  if (typeof detail === "string") return detail;

  return error.message;
}
