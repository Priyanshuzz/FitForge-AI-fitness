import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ErrorBoundary,
  SimpleErrorBoundary,
} from '@/components/error-boundary';

// Component that throws an error
const ThrowingComponent = ({
  shouldThrow = false,
}: {
  shouldThrow?: boolean;
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock the logger
jest.mock('@/lib/utils/error-handling', () => ({
  ...jest.requireActual('@/lib/utils/error-handling'),
  reportError: jest.fn(),
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console errors for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry, but something unexpected happened/)
    ).toBeInTheDocument();
  });

  it('should display error ID when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
  });

  it('should provide retry functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error boundary should show error UI
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should show normal content again
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should call custom error handler when provided', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should handle navigation buttons', () => {
    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Go Home');
    fireEvent.click(homeButton);

    expect(window.location.href).toBe('/');
  });

  it('should handle bug report functionality', async () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    // Mock alert
    window.alert = jest.fn();

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const reportButton = screen.getByText('Report Bug');
    fireEvent.click(reportButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});

describe('SimpleErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <SimpleErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </SimpleErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render simple error UI when there is an error', () => {
    render(
      <SimpleErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </SimpleErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/Please try refreshing the page/)
    ).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Simple custom error</div>;

    render(
      <SimpleErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </SimpleErrorBoundary>
    );

    expect(screen.getByText('Simple custom error')).toBeInTheDocument();
  });
});
