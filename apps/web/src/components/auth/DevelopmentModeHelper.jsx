import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Shield, Building, Heart } from 'lucide-react';

const DevelopmentModeHelper = () => {
  const { user, login, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const predefinedUsers = [
    {
      email: 'superadmin@neurosense360.com',
      label: 'Super Admin',
      icon: Shield,
      description: 'Full system access'
    },
    {
      email: 'clinic@hospital.com',
      label: 'Clinic Admin',
      icon: Building,
      description: 'Clinic management'
    },
    {
      email: 'doctor@clinic.com',
      label: 'Doctor',
      icon: User,
      description: 'Clinical access'
    },
    {
      email: 'patient@neurosense.com',
      label: 'Patient',
      icon: Heart,
      description: 'Brain health portal'
    }
  ];

  const switchUser = async (email) => {
    await login({ email }, 'email');
  };

  const handleLogout = async () => {
    await logout();
  };

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-gray-900 text-white rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Dev Mode</span>
          </div>
          {user && (
            <div className="text-xs text-gray-300 truncate max-w-32">
              {user.role}
            </div>
          )}
        </button>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="border-t border-gray-700 p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Current User</h3>
              {user ? (
                <div className="bg-gray-800 rounded p-3 mb-3">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                  <div className="text-xs text-blue-400 mt-1">{user.role}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">No user logged in</div>
              )}

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Quick Login As</h3>
              <div className="space-y-2">
                {predefinedUsers.map((userData, index) => {
                  const IconComponent = userData.icon;
                  const isCurrentUser = user?.email === userData.email;

                  return (
                    <button
                      key={index}
                      onClick={() => switchUser(userData.email)}
                      disabled={isCurrentUser}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white cursor-not-allowed'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{userData.label}</div>
                          <div className="text-xs opacity-75">{userData.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                💡 Login with different emails to test different roles
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentModeHelper;