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

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Initialize state as a class property to ensure TypeScript correctly types 'this.state'
  public state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
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