import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Home,
  Copy,
  CheckCircle2
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = async () => {
    const errorDetails = `
Error: ${this.state.error?.message || 'Unknown error'}
Stack: ${this.state.error?.stack || 'No stack trace available'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack available'}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, level = 'component' } = this.props;
      
      // If a custom fallback is provided, use it
      if (Fallback) {
        return (
          <Fallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            retry={this.handleRetry}
          />
        );
      }

      // Different UI based on error level
      if (level === 'page') {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
                <CardDescription>
                  We're sorry, but something unexpected happened. The page has encountered an error.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {process.env.NODE_ENV === 'development' && (
                  <Alert variant="destructive">
                    <Bug className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold">Development Error Details:</p>
                        <p className="text-sm font-mono bg-muted p-2 rounded">
                          {this.state.error?.message}
                        </p>
                        {this.state.error?.stack && (
                          <details className="text-xs">
                            <summary className="cursor-pointer hover:text-foreground">
                              Stack Trace
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                              {this.state.error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={this.handleCopyError}
                    className="flex items-center gap-2"
                  >
                    {this.state.copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Error
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>If this problem persists, please contact support with the error details.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Component-level error UI
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-destructive">Component Error</h3>
                  <p className="text-sm text-muted-foreground">
                    This component encountered an error and couldn't render properly.
                  </p>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="text-xs font-mono bg-muted p-2 rounded border">
                    {this.state.error.message}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={this.handleRetry}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </Button>
                  {process.env.NODE_ENV === 'development' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={this.handleCopyError}
                      className="flex items-center gap-1"
                    >
                      {this.state.copied ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, clearError };
};

// Async error boundary for handling promise rejections
export const AsyncErrorBoundary = ({ children, onError, ...props }) => {
  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      if (onError) {
        onError(event.reason);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
};

// Error fallback components for different scenarios
export const DatabaseErrorFallback = ({ error, retry }) => (
  <Card className="border-destructive/50">
    <CardContent className="p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="font-semibold mb-2">Database Connection Error</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Unable to connect to the database. Please check your connection settings.
      </p>
      <Button onClick={retry} className="flex items-center gap-2 mx-auto">
        <RefreshCw className="h-4 w-4" />
        Retry Connection
      </Button>
    </CardContent>
  </Card>
);

export const ChatErrorFallback = ({ error, retry }) => (
  <div className="flex items-center justify-center p-8">
    <Card className="w-full max-w-md">
      <CardContent className="p-6 text-center">
        <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Chat Interface Error</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The chat interface encountered an error. Your conversation history is safe.
        </p>
        <Button onClick={retry} variant="outline" className="flex items-center gap-2 mx-auto">
          <RefreshCw className="h-4 w-4" />
          Reload Chat
        </Button>
      </CardContent>
    </Card>
  </div>
);

export const SidebarErrorFallback = ({ error, retry }) => (
  <div className="p-4">
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-semibold">Sidebar Error</p>
          <p className="text-sm">The sidebar couldn't load properly.</p>
          <Button size="sm" variant="outline" onClick={retry}>
            Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  </div>
);

export default ErrorBoundary;
