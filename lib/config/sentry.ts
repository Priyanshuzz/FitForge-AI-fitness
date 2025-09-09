/**
 * Sentry configuration for FitForge AI
 *
 * This file sets up error monitoring and performance tracking
 * for production environments.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session tracking
    autoSessionTracking: true,

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (ENVIRONMENT === 'development') {
        console.group('🐛 Sentry Error');
        console.error(hint.originalException || hint.syntheticException);
        console.log('Event:', event);
        console.groupEnd();
      }

      // Don't send certain errors to production
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (
          error?.type === 'ChunkLoadError' ||
          error?.value?.includes('Loading chunk') ||
          error?.value?.includes('Network Error')
        ) {
          return null; // Don't send chunk load errors
        }
      }

      return event;
    },

    // Performance filtering
    beforeSendTransaction(event) {
      // Don't track certain transactions in production
      if (event.transaction?.includes('_next/static/')) {
        return null;
      }
      return event;
    },

    // Additional configuration for Next.js
    integrations: [
      new Sentry.BrowserTracing({
        // Set sample rate for performance monitoring
        tracingOrigins: [
          'localhost',
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          /^\/api\//,
        ],
      }),
    ],

    // User context
    initialScope: {
      tags: {
        component: 'fitforge-ai',
        platform: typeof window !== 'undefined' ? 'browser' : 'server',
      },
    },
  });

  // Set up global error handlers
  if (typeof window !== 'undefined') {
    // Browser-specific setup
    window.addEventListener('unhandledrejection', event => {
      Sentry.captureException(event.reason);
    });

    // Track user interactions
    Sentry.addGlobalEventProcessor(event => {
      if (event.user && !event.user.id) {
        // Add anonymous user tracking
        event.user.id = 'anonymous';
      }
      return event;
    });
  }
}

// Helper functions for manual error reporting
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      source: 'manual-capture',
    },
  });
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: {
  id: string;
  email?: string;
  [key: string]: any;
}) {
  Sentry.setUser(user);
}

export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
