import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Responsive Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Healthcare-Themed Top Header */}
        <header className="bg-gradient-to-r from-white/90 via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border-b border-white/40 shadow-xl px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              {/* Mobile menu button - Hidden since it's now in Sidebar */}
              <div className="lg:hidden w-12"></div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">{title}</h1>
                  <p className="text-sm text-slate-600 font-medium">Welcome back, {user?.name || 'User'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clinics, patients, reports..."
                  className="block w-80 pl-12 pr-4 py-3 border-2 border-slate-200 rounded-2xl leading-5 bg-white/80 backdrop-blur-sm placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-lg"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2 block h-3 w-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <button className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-slate-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-white/20">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-10 h-10 object-cover"
                      />
                    ) : (
                      (() => {
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
                          console.error('Error getting user initial in DashboardLayout:', error, user);
                          return 'U';
                        }
                      })()
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-slate-800">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-600 font-medium">{user?.email}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;