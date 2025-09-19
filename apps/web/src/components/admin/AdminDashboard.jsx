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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-8">
      {/* Hospital-Themed Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl">
        {/* Medical Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    NeuroSense360
                  </h1>
                  <p className="text-lg text-slate-600 font-medium">
                    Healthcare Management Platform
                  </p>
                </div>
              </div>
              <p className="text-xl text-slate-700 font-medium max-w-2xl">
                Welcome to your comprehensive healthcare management dashboard. Monitor clinics, track patient reports, and manage your medical network efficiently.
              </p>
              <div className="flex items-center space-x-6 text-sm text-slate-600 mt-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">System Online</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">Last refresh: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200">
                  <Database className="h-3 w-3 text-purple-600" />
                  <span className="font-medium">Real-time Data</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Activity className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Healthcare Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white hover:via-blue-50/50 hover:to-indigo-50/30"
            >
              {/* Animated Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                stat.color === 'blue' ? 'from-blue-500 via-indigo-500 to-blue-600' :
                stat.color === 'green' ? 'from-green-500 via-emerald-500 to-green-600' :
                stat.color === 'yellow' ? 'from-yellow-500 via-orange-500 to-yellow-600' :
                stat.color === 'red' ? 'from-red-500 via-pink-500 to-red-600' :
                'from-purple-500 via-pink-500 to-purple-600'
              }`}></div>
              <div className="absolute inset-[2px] bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-[22px]"></div>
              
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        stat.color === 'blue' ? 'bg-blue-500' :
                        stat.color === 'green' ? 'bg-green-500' :
                        stat.color === 'yellow' ? 'bg-yellow-500' :
                        stat.color === 'red' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`}></div>
                      <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">{stat.name}</p>
                    </div>
                    <p className="text-4xl font-black text-slate-800 mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text group-hover:from-blue-600 group-hover:to-indigo-600">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-sm text-slate-500 font-medium">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`p-5 rounded-2xl shadow-xl ring-4 ring-white/20 group-hover:ring-blue-100/40 transition-all duration-300 ${
                    stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600' :
                    stat.color === 'green' ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-green-600' :
                    stat.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600' :
                    stat.color === 'red' ? 'bg-gradient-to-br from-red-500 via-pink-500 to-red-600' :
                    'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600'
                  } group-hover:scale-110 group-hover:shadow-2xl`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {stat.changeType === 'warning' ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 shadow-sm">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-bold text-red-700">{stat.change}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700">{stat.change}</span>
                    </div>
                  )}
                  {stat.changeType !== 'warning' && (
                    <span className="text-xs text-slate-500 font-medium">vs last month</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Healthcare System Overview */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-5"></div>
          <div className="relative p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Healthcare System Overview</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">System Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-green-700">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-blue-700">127 online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Pending Alerts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-yellow-700">3 alerts</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Reports Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-purple-700">47 reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Healthcare Activities */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-5"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Recent Activities</h3>
              </div>
              <button 
                onClick={onRefresh}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className={`p-3 rounded-xl shadow-lg ${getIconColor(activity.color)}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 mb-1">{activity.message}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Healthcare Quick Actions */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-5"></div>
        <div className="relative p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <button 
              onClick={() => navigate('/admin?tab=clinics')}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-300 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Add Clinic</span>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin?tab=reports')}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-2xl p-6 hover:border-green-300 hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-green-700 transition-colors">Upload Report</span>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin?tab=analytics')}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-2xl p-6 hover:border-purple-300 hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-purple-700 transition-colors">View Analytics</span>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin?tab=alerts')}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-300 hover:from-yellow-50 hover:to-yellow-100 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-yellow-700 transition-colors">Check Alerts</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;