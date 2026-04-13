import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react";

interface RouteErrorBoundaryProps extends PropsWithChildren {
  resetKey?: string;
}

interface RouteErrorBoundaryState {
  error: Error | null;
  retryKey: number;
}

const ShellFrame = ({ children }: { children: ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center bg-background px-6 pb-[calc(3rem+var(--safe-area-bottom))] pt-[calc(3rem+var(--safe-area-top))]">
    <div className="w-full max-w-md text-center">
      <p className="mb-8 text-sm font-light uppercase tracking-[0.34em] text-foreground">
        GOOJ
      </p>
      {children}
    </div>
  </main>
);

export const RouteLoadingFallback = () => (
  <ShellFrame>
    <div role="status" aria-live="polite" aria-label="Loading GOOJ">
      <div className="mx-auto mb-6 h-8 w-8 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
      <p className="text-lg font-light text-foreground">Preparing your gift boxes</p>
      <p className="mt-3 text-sm font-light text-muted-foreground">
        The shop will be ready in a moment.
      </p>
    </div>
  </ShellFrame>
);

export const OfflineFallback = () => (
  <ShellFrame>
    <div role="status" aria-live="polite">
      <h1 className="text-2xl font-light text-foreground">You are offline</h1>
      <p className="mt-4 text-sm font-light leading-6 text-muted-foreground">
        Check your connection and the shop will return automatically.
      </p>
    </div>
  </ShellFrame>
);

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = {
    error: null,
    retryKey: 0,
  };

  static getDerivedStateFromError(error: Error) {
    return {
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Route render failed", error, errorInfo);
  }

  componentDidUpdate(previousProps: RouteErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({
        error: null,
      });
    }
  }

  retry = () => {
    this.setState((state) => ({
      error: null,
      retryKey: state.retryKey + 1,
    }));
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <ShellFrame>
          <h1 className="text-2xl font-light text-foreground">Something went wrong</h1>
          <p className="mt-4 text-sm font-light leading-6 text-muted-foreground">
            The shop hit a loading problem. Try again, or reload the app if it keeps
            happening.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-2 text-sm font-light text-background transition-colors hover:bg-foreground/85"
              onClick={this.retry}
            >
              Try again
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-2 text-sm font-light text-foreground transition-colors hover:border-foreground/40"
              onClick={this.reload}
            >
              Reload app
            </button>
          </div>
        </ShellFrame>
      );
    }

    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}
