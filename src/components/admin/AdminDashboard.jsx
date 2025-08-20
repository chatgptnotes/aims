import React, { useState, useEffect } from 'react';
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
  const [realTimeData, setRealTimeData] = useState({});
  const [allClinics, setAllClinics] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  useEffect(() => {
    loadRealTimeData();
  }, []);

  const loadRealTimeData = async () => {
    try {
      console.log('👑 SuperAdmin loading all system data...');
      
      // Get all data from DatabaseService - SuperAdmin can see everything
      const clinics = await DatabaseService.get('clinics');
      const patients = await DatabaseService.get('patients');
      const reports = await DatabaseService.get('reports');
      const payments = await DatabaseService.get('payments');
      const superAdmins = await DatabaseService.get('superAdmins');

      console.log('📊 SuperAdmin system overview:', {
        clinics: clinics.length,
        patients: patients.length,
        reports: reports.length,
        payments: payments.length,
        superAdmins: superAdmins.length
      });

      setAllClinics(clinics);
      setAllReports(reports);
      setAllPayments(payments);

      // Calculate real-time analytics
      const activeClinicCount = clinics.filter(c => c.isActive).length;
      const totalPatientsCount = patients.length;
      const totalReportsCount = reports.length;
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      setRealTimeData({
        totalClinics: activeClinicCount,
        totalPatients: totalPatientsCount,
        totalReports: totalReportsCount,
        monthlyRevenue: totalRevenue,
        pendingActivations: superAdmins.filter(sa => !sa.isActivated).length
      });

    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  const stats = [
    {
      name: 'Active Clinics',
      value: realTimeData.totalClinics || 0,
      change: '+4.75%',
      changeType: 'increase',
      icon: Building2,
      color: 'blue',
      subtitle: `${allClinics.length} total registered`
    },
    {
      name: 'Total Patients',
      value: realTimeData.totalPatients || 0,
      change: '+54.02%',
      changeType: 'increase',
      icon: Users,
      color: 'green',
      subtitle: 'Across all clinics'
    },
    {
      name: 'Reports Generated',
      value: realTimeData.totalReports || 0,
      change: '+12.35%',
      changeType: 'increase',
      icon: FileText,
      color: 'purple',
      subtitle: 'Total system reports'
    },
    {
      name: 'Total Revenue',
      value: `₹${realTimeData.monthlyRevenue || 0}`,
      change: '+8.12%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'yellow',
      subtitle: 'All time earnings'
    }
  ];

  // Add pending activations if any
  if (realTimeData.pendingActivations > 0) {
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
    const activities = [];
    
    // Recent clinics
    const recentClinics = allClinics
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    recentClinics.forEach((clinic, index) => {
      activities.push({
        id: `clinic-${clinic.id}`,
        type: 'clinic',
        message: `New clinic "${clinic.name}" registered`,
        time: `${index + 1} ${index === 0 ? 'hour' : 'hours'} ago`,
        icon: Building2,
        color: 'blue'
      });
    });

    // Recent reports
    const recentReports = allReports
      .sort((a, b) => new Date(b.createdAt || b.uploadedAt) - new Date(a.createdAt || a.uploadedAt))
      .slice(0, 2);
    
    recentReports.forEach((report, index) => {
      const clinic = allClinics.find(c => c.id === report.clinicId);
      activities.push({
        id: `report-${report.id}`,
        type: 'report',
        message: `New report uploaded by ${clinic ? clinic.name : 'Unknown Clinic'}`,
        time: `${index + 2} hours ago`,
        icon: FileText,
        color: 'green'
      });
    });

    // Recent payments
    const recentPayments = allPayments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);
    
    recentPayments.forEach((payment, index) => {
      const clinic = allClinics.find(c => c.id === payment.clinicId);
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Payment of ₹${payment.amount} received from ${clinic ? clinic.name : 'Unknown Clinic'}`,
        time: `${index + 3} hours ago`,
        icon: DollarSign,
        color: 'purple'
      });
    });

    return activities.slice(0, 6); // Show only last 6 activities
  };

  const recentActivities = generateRecentActivities();

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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to Super Admin Panel</h1>
            <p className="text-blue-100 mt-2">Manage your entire NeuroSense360 platform from here</p>
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
            <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${getIconColor(stat.color)}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'warning' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stat.change}
                </span>
                {stat.changeType !== 'warning' && (
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">System Status</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Active Users</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">127 online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Pending Alerts</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">3 alerts</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-900">Reports Today</span>
              </div>
              <span className="text-sm text-purple-600 font-medium">47 reports</span>
            </div>
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
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Building2 className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Clinic</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Upload Report</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Analytics</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
            <span className="text-sm font-medium text-gray-900">Check Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;