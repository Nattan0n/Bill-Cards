// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-red-400">error</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    An error occurred
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Please try refreshing the page</p>
                    {this.state.error && (
                      <p className="text-xs mt-1 text-red-600">
                        // components/ErrorBoundary.jsx (ต่อ)
                        {this.state.error.toString()}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                    >
                      <span className="material-symbols-outlined mr-2">refresh</span>
                      Refresh Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;