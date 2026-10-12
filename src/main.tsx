import { StrictMode, Component, ReactNode, ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import App from "./App";

window.addEventListener('error', (e) => {
  console.error("WINDOW ERROR CAPTURED:", e.message, e.filename, e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error("UNHANDLED PROMISE REJECTION:", e.reason);
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Root uncaught React error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#071309', color: '#FAF8F5', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>Application Render Error</h2>
          <pre style={{ background: '#0D2012', padding: '16px', borderRadius: '8px', border: '1px solid rgba(197,160,70,0.3)', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#C5A046', color: '#071309', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0D2012',
                  color: '#FAF8F5',
                  border: '1px solid rgba(197,160,70,0.35)',
                  borderRadius: '12px',
                  fontSize: '13px',
                },
                success: { iconTheme: { primary: '#C5A046', secondary: '#071309' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </RootErrorBoundary>
  </StrictMode>
);
