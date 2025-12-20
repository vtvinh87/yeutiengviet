
import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Explicitly define interfaces for Props and State to ensure class members are correctly recognized by TypeScript
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Fix: Changed inheritance to use 'Component' directly from 'react' and added explicit property declarations.
 * This resolves the TypeScript errors where 'state' and 'props' were not recognized as members of the class.
 * Using the generic 'Component<P, S>' with direct import often improves type resolution in strict environments.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare the state property to satisfy the TypeScript compiler's inheritance checks
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: Initializing the explicitly declared state property within the constructor
    this.state = {
      hasError: false
    };
  }

  // Fix: Static method for error boundary state updates
  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  // Fix: Correctly typed lifecycle method for catching errors in child components
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Fix: Accessing state via 'this.state' which is now explicitly recognized by the compiler
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
          <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-6">
            <span className="material-symbols-outlined text-5xl">warning</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Ối! Có lỗi nhỏ rồi</h1>
          <p className="text-gray-400 max-w-md mb-8">Ứng dụng gặp sự cố không mong muốn. Bé hãy thử tải lại trang hoặc quay lại sau nhé!</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary text-text-main font-bold rounded-full shadow-lg"
          >
            Tải lại trang ngay
          </button>
        </div>
      );
    }
    
    // Fix: Accessing children via 'this.props' which is inherited from the generic Component class
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Wrap the root application in ErrorBoundary and StrictMode for safety and best practices
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
