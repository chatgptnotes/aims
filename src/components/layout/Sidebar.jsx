import React, { useState } from 'react';
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
  Brain,
  Home,
  Database,
  PieChart,
  ShieldCheck,
  Monitor,
  Cog,
  UserCheck,
  FileSpreadsheet,
  TrendingUp,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from './ProfileModal';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'super_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
        { id: 'clinics', label: 'Clinic Management', icon: Building2, path: '/admin?tab=clinics' },
        { id: 'reports', label: 'Patient Reports', icon: FileSpreadsheet, path: '/admin?tab=reports' },
        { id: 'payments', label: 'Payment History', icon: CreditCard, path: '/admin?tab=payments' },
        { id: 'analytics', label: 'Analytics', icon: PieChart, path: '/admin?tab=analytics' },
        { id: 'alerts', label: 'Alerts & Monitoring', icon: Monitor, path: '/admin?tab=alerts' },
        { id: 'settings', label: 'System Settings', icon: Cog, path: '/admin?tab=settings' }
      ];
    } else if (user?.role === 'clinic_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/clinic' },
        { id: 'patients', label: 'Patient Management', icon: UserCheck, path: '/clinic?tab=patients' },
        { id: 'reports', label: 'Reports & Files', icon: FileSpreadsheet, path: '/clinic?tab=reports' },
        { id: 'subscription', label: 'Subscription', icon: CreditCard, path: '/clinic?tab=subscription' },
        { id: 'usage', label: 'Usage Tracking', icon: TrendingUp, path: '/clinic?tab=usage' },
        { id: 'settings', label: 'Settings', icon: Cog, path: '/clinic?tab=settings' }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'profile', label: 'Profile', icon: UserCheck, path: '/dashboard?tab=profile' },
        { id: 'activity', label: 'Activity', icon: Activity, path: '/dashboard?tab=activity' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard?tab=notifications' },
        { id: 'settings', label: 'Settings', icon: Cog, path: '/dashboard?tab=settings' }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    try {
      if (path.includes('?tab=')) {
        const [basePath, tab] = path.split('?tab=');
        return location.pathname === basePath && location.search.includes(tab);
      }
      return location.pathname === path;
    } catch (error) {
      console.warn('Error checking active path:', error);
      return false;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'super_admin': return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200 shadow-sm';
      case 'clinic_admin': return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-sm';
      default: return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-sm';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'super_admin': return 'Super Admin';
      case 'clinic_admin': return 'Clinic Admin';
      default: return 'User';
    }
  };

  const getDisplayName = () => {
    try {
      // For super admin with clinic name, show clinic name
      if (user?.role === 'super_admin' && user?.clinicName) {
        return user.clinicName;
      }
      // For clinic admin, show clinic name
      if (user?.role === 'clinic_admin' && user?.clinicName) {
        return user.clinicName;
      }
      // For super admin, show name (which might be clinic name)
      if (user?.role === 'super_admin' && user?.name) {
        return user.name;
      }
      // For others, show user name
      return user?.name || 'User';
    } catch (error) {
      console.error('Error getting display name:', error, user);
      return 'User';
    }
  };

  const getProfileInitial = () => {
    try {
      // For super admin with clinic name, show clinic name initial
      if (user?.role === 'super_admin' && user?.clinicName) {
        return user.clinicName.charAt(0).toUpperCase();
      }
      // For clinic admin, show clinic name initial
      if (user?.role === 'clinic_admin' && user?.clinicName) {
        return user.clinicName.charAt(0).toUpperCase();
      }
      // For super admin, show name initial (which might be clinic name)
      if (user?.role === 'super_admin' && user?.name) {
        return user.name.charAt(0).toUpperCase();
      }
      // For regular users, show name initial
      if (user?.name && typeof user.name === 'string' && user.name.length > 0) {
        return user.name.charAt(0).toUpperCase();
      }
      return 'U';
    } catch (error) {
      console.error('Error getting profile initial:', error, user);
      return 'U';
    }
  };

  // Mobile overlay
  const MobileOverlay = () => (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
        mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile Overlay */}
      <MobileOverlay />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-white/30 lg:hidden transition-all duration-300 hover:scale-105"
      >
        {mobileOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
        ) : (
          <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        bg-white/95 backdrop-blur-xl border-r border-white/30 shadow-2xl 
        transition-all duration-500 ease-in-out
        ${collapsed ? 'w-16 sm:w-20' : 'w-72 sm:w-80'} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full relative overflow-hidden
      `}>
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-purple-50/20 to-indigo-50/30"></div>
        
        {/* Modern Header */}
        <div className="relative p-4 sm:p-6 border-b border-white/30">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl">
                    <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    NeuroSense360
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">EEG Management Platform</p>
                </div>
              </div>
            )}
            
            {/* Collapse Toggle Button - Hidden on mobile */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`group p-2 sm:p-3 hover:bg-white/60 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 border border-white/20 shadow-sm hidden lg:block ${collapsed ? 'mx-auto' : ''}`}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
              ) : (
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 sm:p-3 hover:bg-white/60 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 border border-white/20 shadow-sm lg:hidden"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </button>
          </div>
          
                     {/* User Info */}
           {!collapsed && user && (
             <button 
               onClick={() => {
                 try {
                   console.log('👤 Profile clicked:', user);
                   setIsProfileModalOpen(true);
                 } catch (error) {
                   console.error('Error handling profile click:', error);
                 }
               }}
               className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-sm hover:bg-white/80 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group"
             >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover"
                      />
                    ) : (
                      getProfileInitial()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                    {getDisplayName()}
                  </p>
                  <span className={`inline-block px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg sm:rounded-xl border shadow-sm ${getRoleColor()} group-hover:shadow-md transition-all duration-300`}>
                    {getRoleLabel()}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            </button>
          )}
          
                     {/* Collapsed User Avatar */}
           {collapsed && user && (
             <div className="mt-4 flex justify-center">
               <button
                 onClick={() => {
                   try {
                     console.log('👤 Profile clicked (collapsed):', user);
                     setIsProfileModalOpen(true);
                   } catch (error) {
                     console.error('Error handling profile click:', error);
                   }
                 }}
                 className="relative group cursor-pointer hover:scale-110 transition-all duration-300"
                 title={`${getDisplayName()} - ${getRoleLabel()}`}
               >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover"
                    />
                  ) : (
                    getProfileInitial()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-4 sm:p-6 space-y-1.5 sm:space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            try {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group flex items-center ${collapsed ? 'justify-center' : 'px-3 sm:px-4'} py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                    active
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border border-blue-200/50 shadow-lg shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-800 hover:shadow-md border border-transparent hover:border-white/30'
                  }`}
                  title={collapsed ? item.label : ''}
                  onClick={() => {
                    try {
                      // Close mobile menu on navigation
                      setMobileOpen(false);
                      console.log('🚀 Navigating to:', item.path);
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                    active 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-white/50 group-hover:bg-white/80 text-slate-600 group-hover:text-blue-600'
                  }`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0`} />
                  </div>
                  {!collapsed && (
                    <span className={`ml-3 transition-all duration-300 ${
                      active ? 'text-blue-700 font-bold' : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            } catch (error) {
              console.error('Error rendering navigation item:', error);
              return null;
            }
          })}
        </nav>

        {/* Footer */}
        <div className="relative p-4 sm:p-6 border-t border-white/30">
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center ${collapsed ? 'justify-center' : 'px-3 sm:px-4'} py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-red-200/50 shadow-sm hover:shadow-md`}
            title={collapsed ? 'Logout' : ''}
          >
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/50 group-hover:bg-red-100 text-slate-600 group-hover:text-red-600 transition-all duration-300">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            </div>
            {!collapsed && (
              <span className="ml-3 transition-all duration-300">Logout</span>
            )}
          </button>
          
          {!collapsed && (
            <div className="mt-3 sm:mt-4 text-center">
              <div className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/30">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                <p className="text-xs text-slate-500 font-medium">Version 1.0.0</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="mt-3 sm:mt-4 flex justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          )}
                 </div>
       </div>

       {/* Profile Modal */}
       <ProfileModal 
         isOpen={isProfileModalOpen} 
         onClose={() => setIsProfileModalOpen(false)} 
       />
     </>
   );
 };
 
 export default Sidebar;