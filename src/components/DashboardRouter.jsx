import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuperAdminPanel from './admin/SuperAdminPanel';
import ClinicDashboard from './clinic/ClinicDashboard';
import PatientDashboard from './patient/PatientDashboard';

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role
  switch (user.role) {
    case 'super_admin':
      return <SuperAdminPanel />;

    case 'clinic_admin':
    case 'clinic':
      return <ClinicDashboard />;

    case 'patient':
      return <PatientDashboard />;

    default:
      // For unknown roles, show error and redirect to login
      console.error('Unknown user role:', user.role);
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter;