import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import ActivationPending from './components/auth/ActivationPending';

import SuperAdminPanel from './components/admin/SuperAdminPanel';
import ClinicDashboard from './components/clinic/ClinicDashboard';
import SubscriptionManager from './components/clinic/SubscriptionManager';
import DashboardRouter from './components/DashboardRouter';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
  console.log('🚀 App component loading...');
  
  // Add global error handler
  React.useEffect(() => {
    const handleError = (event) => {
      console.error('🚨 Global error caught:', event.error);
      
      // Check if it's a navigation/routing error
      if (event.error && (
        event.error.message.includes('Loading chunk') ||
        event.error.message.includes('Failed to fetch') ||
        event.error.message.includes('Cannot read properties') ||
        event.error.name === 'ChunkLoadError'
      )) {
        console.error('🚨 Navigation/Chunk loading error detected');
        // Force reload to clear any stale state
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    const handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      
      // Check for common navigation errors
      if (event.reason && (
        String(event.reason).includes('Loading chunk') ||
        String(event.reason).includes('Failed to fetch') ||
        String(event.reason).includes('Cannot read properties')
      )) {
        console.error('🚨 Navigation promise rejection detected');
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/activation-pending" element={<ActivationPending />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            
            {/* Protected Routes */}
            
            {/* Super Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <SuperAdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Clinic Routes */}
            <Route 
              path="/clinic" 
              element={
                <ProtectedRoute requiredRole="clinic_admin">
                  <ClinicDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/clinic/subscription" 
              element={
                <ProtectedRoute requiredRole="clinic_admin">
                  <SubscriptionManager />
                </ProtectedRoute>
              } 
            />
            
            {/* Smart Dashboard Route - redirects based on user role */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            

            
            {/* Catch all route - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
