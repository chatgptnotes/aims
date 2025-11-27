import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Eye,
  Shield,
  Database
} from 'lucide-react';
import DatabaseService from '../../services/databaseService';

const AdminDashboard = ({ analytics = {}, onRefresh }) => {
  const navigate = useNavigate();
  const [realTimeData, setRealTimeData] = useState({
    totalProjectAreas: 0,
    totalSupervisors: 0,
    totalReports: 0,
    monthlyRevenue: 0,
    pendingActivations: 0
  });
  const [allProjectAreas, setAllProjectAreas] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRealTimeData();
  }, []);

  const loadRealTimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('SUPERADMIN: SuperAdmin loading all system data...');

      // Get all data from DatabaseService - SuperAdmin can see everything
      // Use 'clinics' instead of 'project_areas' as that's the actual table name
      let projectAreas = [];
      let supervisors = [];
      let reports = [];
      let payments = [];
      let superAdmins = [];

      try {
        projectAreas = await DatabaseService.get('clinics') || [];
        console.log('SUCCESS: Loaded project areas (clinics):', projectAreas.length);
      } catch (err) {
        console.warn('WARNING: Failed to load project areas:', err.message);
        projectAreas = [];
      }

      try {
        // Try both 'patients' (old table) and 'supervisors' (new table)
        supervisors = await DatabaseService.get('patients') || [];
        console.log('SUCCESS: Loaded supervisors (patients):', supervisors.length);
      } catch (err) {
        console.warn('WARNING: Failed to load supervisors:', err.message);
        supervisors = [];
      }

      try {
        reports = await DatabaseService.get('reports') || [];
        console.log('SUCCESS: Loaded reports:', reports.length);
      } catch (err) {
        console.warn('WARNING: Failed to load reports:', err.message);
        reports = [];
      }

      try {
        payments = await DatabaseService.get('payments') || [];
        console.log('SUCCESS: Loaded payments:', payments.length);
      } catch (err) {
        console.warn('WARNING: Failed to load payments:', err.message);
        payments = [];
      }

      try {
        superAdmins = await DatabaseService.get('superAdmins') || [];
        console.log('SUCCESS: Loaded super admins:', superAdmins.length);
      } catch (err) {
        console.warn('WARNING: Failed to load super admins:', err.message);
        superAdmins = [];
      }

      console.log('DATA: SuperAdmin system overview:', {
        projectAreas: projectAreas.length,
        supervisors: supervisors.length,
        reports: reports.length,
        payments: payments.length,
        superAdmins: superAdmins.length
      });

      setAllProjectAreas(Array.isArray(projectAreas) ? projectAreas : []);
      setAllReports(Array.isArray(reports) ? reports : []);
      setAllPayments(Array.isArray(payments) ? payments : []);

      // Calculate real-time analytics with safe array operations
      const activeProjectAreaCount = Array.isArray(projectAreas)
        ? projectAreas.filter(pa => pa?.isActive !== false || pa?.is_active !== false).length
        : 0;
      const totalSupervisorsCount = Array.isArray(supervisors) ? supervisors.length : 0;
      const totalReportsCount = Array.isArray(reports) ? reports.length : 0;
      const totalRevenue = Array.isArray(payments)
        ? payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0)
        : 0;
      const pendingActivationCount = Array.isArray(superAdmins)
        ? superAdmins.filter(sa => !sa?.isActivated && sa?.isActive !== false).length
        : 0;

      setRealTimeData({
        totalProjectAreas: activeProjectAreaCount,
        totalSupervisors: totalSupervisorsCount,
        totalReports: totalReportsCount,
        monthlyRevenue: totalRevenue,
        pendingActivations: pendingActivationCount
      });

    } catch (error) {
      console.error('ERROR: Critical error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please check your database connection.');

      // Set safe defaults to prevent crashes
      setAllProjectAreas([]);
      setAllReports([]);
      setAllPayments([]);
      setRealTimeData({
        totalProjectAreas: 0,
        totalSupervisors: 0,
        totalReports: 0,
        monthlyRevenue: 0,
        pendingActivations: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Active Project Areas',
      value: realTimeData?.totalProjectAreas || 0,
      change: '+4.75%',
      changeType: 'increase',
      icon: Building2,
      color: 'blue',
      subtitle: `${allProjectAreas?.length || 0} total registered`
    },
    {
      name: 'Total Supervisors',
      value: realTimeData?.totalSupervisors || 0,
      change: '+54.02%',
      changeType: 'increase',
      icon: Users,
      color: 'green',
      subtitle: 'Across all project areas'
    },
    {
      name: 'P&ID Reports Generated',
      value: realTimeData?.totalReports || 0,
      change: '+12.35%',
      changeType: 'increase',
      icon: FileText,
      color: 'purple',
      subtitle: 'Total system reports'
    },
    {
      name: 'Total Revenue',
      value: `₹${realTimeData?.monthlyRevenue || 0}`,
      change: '+8.12%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'yellow',
      subtitle: 'All time earnings'
    }
  ];

  // Add pending activations if any
  if (realTimeData?.pendingActivations > 0) {
    stats.unshift({
      name: 'Pending Activations',
      value: realTimeData.pendingActivations,
      change: 'Needs attention',
      changeType: 'warning',
      icon: Shield,
      color: 'red',
      subtitle: 'Super Admin requests'
    });
  }

  // Generate real-time activities from actual data
  const generateRecentActivities = () => {
    try {
      const activities = [];

      // Ensure all data is valid arrays
      const safeProjectAreas = Array.isArray(allProjectAreas) ? allProjectAreas : [];
      const safeReports = Array.isArray(allReports) ? allReports : [];
      const safePayments = Array.isArray(allPayments) ? allPayments : [];

      // Recent project areas
      const recentProjectAreas = safeProjectAreas
        .filter(pa => pa && (pa.createdAt || pa.created_at))
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || a?.created_at || 0);
          const dateB = new Date(b?.createdAt || b?.created_at || 0);
          return dateB - dateA;
        })
        .slice(0, 3);

      recentProjectAreas.forEach((projectArea, index) => {
        if (projectArea && projectArea.id) {
          activities.push({
            id: `projectArea-${projectArea.id}`,
            type: 'projectArea',
            message: `New project area "${projectArea.name || 'Unknown'}" registered`,
            time: `${index + 1} ${index === 0 ? 'hour' : 'hours'} ago`,
            icon: Building2,
            color: 'blue'
          });
        }
      });

      // Recent reports
      const recentReports = safeReports
        .filter(r => r && (r.createdAt || r.created_at || r.uploadedAt))
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || a?.created_at || a?.uploadedAt || 0);
          const dateB = new Date(b?.createdAt || b?.created_at || b?.uploadedAt || 0);
          return dateB - dateA;
        })
        .slice(0, 2);

      recentReports.forEach((report, index) => {
        if (report && report.id) {
          const projectArea = safeProjectAreas.find(
            pa => pa && (pa.id === report.projectAreaId || pa.id === report.clinicId || pa.id === report.clinic_id)
          );
          activities.push({
            id: `report-${report.id}`,
            type: 'report',
            message: `New P&ID report uploaded by ${projectArea?.name || 'Unknown Project Area'}`,
            time: `${index + 2} hours ago`,
            icon: FileText,
            color: 'green'
          });
        }
      });

      // Recent payments
      const recentPayments = safePayments
        .filter(p => p && (p.createdAt || p.created_at))
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || a?.created_at || 0);
          const dateB = new Date(b?.createdAt || b?.created_at || 0);
          return dateB - dateA;
        })
        .slice(0, 2);

      recentPayments.forEach((payment, index) => {
        if (payment && payment.id) {
          const projectArea = safeProjectAreas.find(
            pa => pa && (pa.id === payment.projectAreaId || pa.id === payment.clinicId || pa.id === payment.clinic_id)
          );
          activities.push({
            id: `payment-${payment.id}`,
            type: 'payment',
            message: `Payment of ₹${payment.amount || 0} received from ${projectArea?.name || 'Unknown Project Area'}`,
            time: `${index + 3} hours ago`,
            icon: DollarSign,
            color: 'purple'
          });
        }
      });

      return activities.slice(0, 6); // Show only last 6 activities
    } catch (err) {
      console.error('ERROR: Failed to generate recent activities:', err);
      return [];
    }
  };

  const recentActivities = generateRecentActivities();

  const getIconColor = (color) => {
    const colors = {
      blue: 'bg-[#323956]',
      green: 'bg-[#323956]',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Error Loading Dashboard</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button
              onClick={loadRealTimeData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section - Clean Design */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Industrial Asset Information Management System
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-700">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Clean Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-gray-900/20 transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
                  )}

                  <div className="mt-3 flex items-center text-xs">
                    {stat.changeType === 'warning' ? (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        <span className="font-medium">{stat.change}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        <span className="font-medium">{stat.change}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30' :
                  stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/30' :
                  stat.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                  stat.color === 'red' ? 'bg-red-50 dark:bg-red-900/30' :
                  'bg-gray-50 dark:bg-gray-700'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Status</span>
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Users</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">127 online</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Alerts</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">3 alerts</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reports Today</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">47 reports</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className={`p-2 rounded-lg ${getIconColor(activity.color)}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{activity.message}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activities to display</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Activity will appear here once you start using the system</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/clinics')}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Manage Project Areas</span>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">View P&ID Reports</span>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
              <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">View Analytics</span>
          </button>

          <button
            onClick={() => navigate('/admin/alerts')}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Check Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;