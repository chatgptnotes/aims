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

import SuperAdminPanel from './components/admin/SuperAdminPanel';
import ClinicDashboard from './components/clinic/ClinicDashboard';
import SubscriptionManager from './components/clinic/SubscriptionManager';
import ErrorBoundary from './utils/errorBoundary.jsx';
import TestPage from './TestPage';

function App() {
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
                  <SubscriptionManager clinicId="demo-clinic-id" />
                </ProtectedRoute>
              } 
            />
            
            {/* Test page - temporary for debugging */}
            <Route path="/test" element={<TestPage />} />
            
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
