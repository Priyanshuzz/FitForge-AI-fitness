'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { reportError, logger } from '@/lib/utils/error-handling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    const errorId = this.state.errorId || 'unknown';

    reportError(error, {
      ...errorInfo,
      errorId,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    logger.error('React Error Boundary caught an error', error, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;

    // Create a bug report
    const bugReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // You could send this to your bug tracking system
    console.log('Bug Report:', bugReport);

    // For now, copy to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(bugReport, null, 2))
      .then(() => {
        alert(
          'Bug report copied to clipboard! Please paste it in your bug report.'
        );
      });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-800">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">
                  We're sorry, but something unexpected happened. Our team has
                  been notified and is working on a fix.
                </p>
                <p className="text-sm">
                  Error ID:{' '}
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {this.state.errorId}
                  </code>
                </p>
              </div>

              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-50 border border-red-200 rounded p-4">
                  <summary className="font-medium text-red-800 cursor-pointer">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/')}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReportBug}
                  className="flex-1"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please contact our support team at{' '}
                  <a
                    href="mailto:support@fitforge.ai"
                    className="text-primary hover:underline"
                  >
                    support@fitforge.ai
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified error boundary for specific components
export function SimpleErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Something went wrong</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please try refreshing the page or contact support if the issue
              persists.
            </p>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
