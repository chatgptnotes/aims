import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Bell,
  BarChart3,
  Shield,
  Building2,
  UserPlus,
  Upload,
  Download,
  CreditCard,
  Activity,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'super_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'clinics', label: 'Clinic Management', icon: Building2, path: '/admin?tab=clinics' },
        { id: 'reports', label: 'Patient Reports', icon: FileText, path: '/admin?tab=reports' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin?tab=analytics' },
        { id: 'alerts', label: 'Alerts & Monitoring', icon: Bell, path: '/admin?tab=alerts' },
        { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin?tab=settings' }
      ];
    } else if (user?.role === 'clinic_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/clinic' },
        { id: 'patients', label: 'Patient Management', icon: Users, path: '/clinic?tab=patients' },
        { id: 'reports', label: 'Reports & Files', icon: FileText, path: '/clinic?tab=reports' },
        { id: 'subscription', label: 'Subscription', icon: CreditCard, path: '/clinic?tab=subscription' },
        { id: 'usage', label: 'Usage Tracking', icon: Activity, path: '/clinic?tab=usage' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/clinic?tab=settings' }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'profile', label: 'Profile', icon: Users, path: '/dashboard?tab=profile' },
        { id: 'activity', label: 'Activity', icon: Activity, path: '/dashboard?tab=activity' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard?tab=notifications' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard?tab=settings' }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    if (path.includes('?tab=')) {
      const [basePath, tab] = path.split('?tab=');
      return location.pathname === basePath && location.search.includes(tab);
    }
    return location.pathname === path;
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'clinic_admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'super_admin': return 'Super Admin';
      case 'clinic_admin': return 'Clinic Admin';
      default: return 'User';
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">NeuroSense360</h1>
                <p className="text-xs text-gray-500">EEG Management Platform</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* User Info */}
        {!collapsed && user && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor()}`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
          {!collapsed && <span>Logout</span>}
        </button>
        
        {!collapsed && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-400">Version 1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;