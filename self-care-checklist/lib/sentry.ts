// Sentry is configured via @sentry/nextjs
// This file provides helper functions for error tracking

/**
 * Capture an exception with optional context
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[Sentry] Exception:', error, context);
    return;
  }

  // In production, Sentry SDK captures automatically via @sentry/nextjs
  // This is just a helper for explicit capture with context
  if (typeof window !== 'undefined') {
    import('@sentry/nextjs').then(({ captureException: sentryCapture, setContext }) => {
      if (context) {
        setContext('additional', context);
      }
      sentryCapture(error);
    });
  }
}

/**
 * Capture a message (non-error) with severity level
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Sentry] ${level.toUpperCase()}:`, message);
    return;
  }

  if (typeof window !== 'undefined') {
    import('@sentry/nextjs').then(({ captureMessage: sentryMessage }) => {
      sentryMessage(message, level);
    });
  }
}
