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
        // { id: 'settings', label: 'Settings', icon: Cog, path: '/clinic?tab=settings' }
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
      case 'clinic_admin': return 'bg-gradient-to-r from-[#E4EFFF] to-indigo-50 text-blue-700 border-blue-200 shadow-sm';
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
        bg-[#323956] border-r border-[#232D3C] shadow-2xl
        transition-all duration-500 ease-in-out
        ${collapsed ? 'w-16 sm:w-20' : 'w-72 sm:w-80'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full relative overflow-hidden
      `}>
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#323956] via-[#232D3C] to-[#323956]"></div>
        
        {/* Modern Header */}
        <div className="relative p-4 sm:p-6 border-b border-white/10">

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
               className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 shadow-sm hover:bg-white/10 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group"
             >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#F5D05D] to-[#d9b84a] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#323956] font-bold text-xl sm:text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                      />
                    ) : (
                      getProfileInitial()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-[#323956] animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#F5D05D] transition-colors">
                    {getDisplayName()}
                  </p>
                  <span className={`inline-block px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg sm:rounded-xl border shadow-sm ${getRoleColor()} group-hover:shadow-md transition-all duration-300`}>
                    {getRoleLabel()}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-[#F5D05D] rounded-full"></div>
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#F5D05D] to-[#d9b84a] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#323956] font-bold text-lg sm:text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover"
                    />
                  ) : (
                    getProfileInitial()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-[#323956] animate-pulse"></div>
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
                      ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                      : 'text-[#CAE0FF] hover:bg-white/5 hover:text-white hover:shadow-md border border-transparent hover:border-white/10'
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
                      ? 'bg-gradient-to-r from-[#F5D05D] to-[#d9b84a] text-[#323956] shadow-lg'
                      : 'bg-white/5 group-hover:bg-[#F5D05D] text-[#CAE0FF] group-hover:text-[#323956]'
                  }`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0`} />
                  </div>
                  {!collapsed && (
                    <span className={`ml-3 transition-all duration-300 ${
                      active ? 'text-white font-bold' : 'text-[#CAE0FF] group-hover:text-white'
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
        <div className="relative p-4 sm:p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center ${collapsed ? 'justify-center' : 'px-3 sm:px-4'} py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#CAE0FF] hover:bg-white/5 hover:text-red-400 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/10 shadow-sm hover:shadow-md`}
            title={collapsed ? 'Logout' : ''}
          >
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/5 group-hover:bg-red-500/20 text-[#CAE0FF] group-hover:text-red-400 transition-all duration-300">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            </div>
            {!collapsed && (
              <span className="ml-3 transition-all duration-300">Logout</span>
            )}
          </button>

          {!collapsed && (
            <div className="mt-3 sm:mt-4 text-center">
              <div className="inline-flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-[#F5D05D] to-[#d9b84a] rounded-full animate-pulse"></div>
                <p className="text-xs text-[#CAE0FF] font-medium">Version 1.0.0</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mt-3 sm:mt-4 flex justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-[#F5D05D] to-[#d9b84a] rounded-full animate-pulse"></div>
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