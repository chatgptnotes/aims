import React from 'react';
import { 
  Users, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OverviewTab = ({ clinic, patients = [], reports = [], usage = {}, onRefresh }) => {
  const usagePercentage = clinic?.reportsUsed && clinic?.reportsAllowed 
    ? (clinic.reportsUsed / clinic.reportsAllowed) * 100 
    : 0;

  const stats = [
    {
      name: 'Total Patients',
      value: patients.length,
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      name: 'Reports Generated',
      value: reports.length,
      change: '+8%',
      changeType: 'increase',
      icon: FileText,
      color: 'green'
    },
    {
      name: 'Reports Used',
      value: clinic?.reportsUsed || 0,
      total: clinic?.reportsAllowed || 10,
      icon: Activity,
      color: 'purple'
    },
    {
      name: 'System Status',
      value: 'Operational',
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'patient',
      message: 'New patient John Doe registered',
      time: '2 hours ago',
      icon: Users,
      color: 'blue'
    },
    {
      id: 2,
      type: 'report',
      message: 'EEG report generated for Sarah Smith',
      time: '4 hours ago',
      icon: FileText,
      color: 'green'
    },
    {
      id: 3,
      type: 'upload',
      message: 'EDF file uploaded for patient Mike Johnson',
      time: '6 hours ago',
      icon: Activity,
      color: 'purple'
    },
    {
      id: 4,
      type: 'alert',
      message: 'Approaching report usage limit',
      time: '1 day ago',
      icon: AlertTriangle,
      color: 'yellow'
    }
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {clinic?.name || 'Clinic'}</h1>
            <p className="text-blue-100 mt-2">
              Manage your patients and EEG reports efficiently
            </p>
          </div>
          <div className="hidden md:block">
            <Activity className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.total ? `${stat.value}/${stat.total}` : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getIconColor(stat.color)}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              {stat.change && (
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Report Usage</span>
              <span>{clinic?.reportsUsed || 0} / {clinic?.reportsAllowed || 10}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  usagePercentage >= 90 ? 'bg-red-500' : 
                  usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {usagePercentage >= 90 ? 'Critical: Approaching limit' :
               usagePercentage >= 70 ? 'Warning: Usage high' :
               'Good: Within normal range'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Remaining Reports</span>
              <span className="text-sm text-gray-600">
                {Math.max(0, (clinic?.reportsAllowed || 10) - (clinic?.reportsUsed || 0))}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Subscription Status</span>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              to="/clinic/subscription"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center block"
            >
              Manage Subscription
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button 
              onClick={onRefresh}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getIconColor(activity.color)}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/clinic?tab=patients"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Patient</span>
          </Link>
          
          <Link
            to="/clinic?tab=reports"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Reports</span>
          </Link>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Export Data</span>
          </button>
          
          <Link
            to="/clinic?tab=settings"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-8 w-8 text-yellow-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </Link>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
          <Link
            to="/clinic?tab=patients"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View All
          </Link>
        </div>
        
        {patients.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{patient.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{patient.age}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{patient.gender}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No patients added yet</p>
            <Link
              to="/clinic?tab=patients"
              className="mt-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Add your first patient
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;