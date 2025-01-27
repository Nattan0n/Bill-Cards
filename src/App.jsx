// App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "./components/Nav/Nav";
import { useAuth } from './hook/useAuth';
import "./style/App.css";

// Lazy load components
const BillCard = lazy(() => import("./components/BillCard/BillCard"));

// Optimized loading screen with skeleton
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white z-50">
    <div className="animate-pulse">
      {/* Navigation skeleton */}
      <div className="h-16 bg-gray-100"></div>
      
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        {/* Search bar skeleton */}
        <div className="h-12 bg-gray-100 rounded-lg mb-6"></div>
        
        {/* Table skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Optimized error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const { user, roles, loading: authLoading, error: authError, logout } = useAuth();

  // Show minimal loading state during authentication
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-100">
          <Navigation user={user} roles={roles} onLogout={logout} />
          
          {/* {authError && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{authError}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route 
                path="/iplan/billcard" 
                element={<BillCard />}
              />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

// Enable React Fast Refresh
if (import.meta.hot) {
  import.meta.hot.accept();
}

export default App;