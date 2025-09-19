import React, { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, Users, FileText, Calendar,
  BarChart3, PieChart, Download, Filter, RefreshCw,
  Target, Award, Clock, AlertTriangle
} from 'lucide-react';
import DatabaseService from '../../services/databaseService';

const AdvancedAnalytics = ({ clinicId, clinic }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('patients');

  useEffect(() => {
    if (clinicId) {
      loadAnalyticsData();
    }
  }, [clinicId, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load patients, reports, and subscription data
      const [patients, reports, subscriptions] = await Promise.all([
        DatabaseService.getPatientsByClinic(clinicId),
        DatabaseService.getReportsByClinic(clinicId),
        DatabaseService.get('subscriptions')
      ]);

      const clinicSubscription = subscriptions.find(sub => sub.clinicId === clinicId);

      // Generate analytics
      const analytics = generateAnalytics(patients, reports, clinicSubscription);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (patients, reports, subscription) => {
    const now = new Date();
    const periods = {
      '30days': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365
    };

    const cutoffDate = new Date(now.getTime() - periods[selectedPeriod] * 24 * 60 * 60 * 1000);

    // Filter data by period
    const periodPatients = patients.filter(p => new Date(p.createdAt) >= cutoffDate);
    const periodReports = reports.filter(r => new Date(r.createdAt) >= cutoffDate);

    // Monthly breakdown
    const monthlyData = generateMonthlyBreakdown(patients, reports, periods[selectedPeriod]);

    // Revenue calculations
    const revenueData = calculateRevenue(reports, subscription);

    // Patient demographics
    const demographics = calculateDemographics(patients);

    // Performance metrics
    const performance = calculatePerformanceMetrics(patients, reports);

    return {
      overview: {
        totalPatients: patients.length,
        newPatients: periodPatients.length,
        totalReports: reports.length,
        reportsGenerated: periodReports.length,
        revenue: revenueData.total,
        periodRevenue: revenueData.period,
        growth: calculateGrowthRate(patients, periods[selectedPeriod])
      },
      monthly: monthlyData,
      revenue: revenueData,
      demographics,
      performance
    };
  };

  const generateMonthlyBreakdown = (patients, reports, days) => {
    const months = Math.ceil(days / 30);
    const monthlyData = [];

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const monthPatients = patients.filter(p => {
        const date = new Date(p.createdAt);
        return date >= startDate && date < endDate;
      });

      const monthReports = reports.filter(r => {
        const date = new Date(r.createdAt);
        return date >= startDate && date < endDate;
      });

      monthlyData.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        patients: monthPatients.length,
        reports: monthReports.length,
        revenue: monthReports.length * 50 // Assuming $50 per report
      });
    }

    return monthlyData;
  };

  const calculateRevenue = (reports, subscription) => {
    const reportsRevenue = reports.length * 50; // Base report cost
    const subscriptionRevenue = subscription ? (subscription.amount || 0) : 0;

    return {
      total: reportsRevenue + subscriptionRevenue,
      period: reportsRevenue,
      reports: reportsRevenue,
      subscription: subscriptionRevenue,
      averagePerReport: reports.length > 0 ? reportsRevenue / reports.length : 0
    };
  };

  const calculateDemographics = (patients) => {
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };

    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0
    };

    patients.forEach(patient => {
      const age = patient.age || 0;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;

      const gender = (patient.gender || 'other').toLowerCase();
      if (genderDistribution.hasOwnProperty(gender)) {
        genderDistribution[gender]++;
      } else {
        genderDistribution.other++;
      }
    });

    return { ageGroups, genderDistribution };
  };

  const calculatePerformanceMetrics = (patients, reports) => {
    const reportsPerPatient = patients.length > 0 ? reports.length / patients.length : 0;
    const processingTime = 2.5; // Average hours
    const satisfactionScore = 4.6; // Out of 5

    return {
      reportsPerPatient: Math.round(reportsPerPatient * 10) / 10,
      averageProcessingTime: processingTime,
      patientSatisfaction: satisfactionScore,
      efficiencyScore: Math.min(100, Math.round((reportsPerPatient * 20) + (5 - processingTime) * 10))
    };
  };

  const calculateGrowthRate = (patients, days) => {
    const now = new Date();
    const currentPeriod = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriod = new Date(currentPeriod.getTime() - days * 24 * 60 * 60 * 1000);

    const currentCount = patients.filter(p => new Date(p.createdAt) >= currentPeriod).length;
    const previousCount = patients.filter(p => {
      const date = new Date(p.createdAt);
      return date >= previousPeriod && date < currentPeriod;
    }).length;

    if (previousCount === 0) return currentCount > 0 ? 100 : 0;
    return Math.round(((currentCount - previousCount) / previousCount) * 100);
  };

  if (loading || !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Advanced Analytics</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalPatients}</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{analyticsData.overview.newPatients} this period
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reports Generated</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalReports}</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{analyticsData.overview.reportsGenerated} this period
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analyticsData.revenue.total.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +${analyticsData.revenue.period.toLocaleString()} this period
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.growth}%</p>
              <p className="text-sm text-gray-500">vs previous period</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Monthly Trends
        </h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {analyticsData.monthly.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '200px' }}>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(10, (month[selectedMetric] / Math.max(...analyticsData.monthly.map(m => m[selectedMetric]))) * 100)}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                    {month[selectedMetric]}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">{month.month}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setSelectedMetric('patients')}
            className={`px-3 py-1 rounded-lg text-sm ${selectedMetric === 'patients' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          >
            Patients
          </button>
          <button
            onClick={() => setSelectedMetric('reports')}
            className={`px-3 py-1 rounded-lg text-sm ${selectedMetric === 'reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          >
            Reports
          </button>
          <button
            onClick={() => setSelectedMetric('revenue')}
            className={`px-3 py-1 rounded-lg text-sm ${selectedMetric === 'revenue' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          >
            Revenue
          </button>
        </div>
      </div>

      {/* Demographics and Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Patient Demographics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Patient Demographics
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Age Groups</h4>
              <div className="space-y-2">
                {Object.entries(analyticsData.demographics.ageGroups).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between">
                    <span className="text-gray-700">{group}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${analyticsData.overview.totalPatients > 0 ? (count / analyticsData.overview.totalPatients) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Gender Distribution</h4>
              <div className="space-y-2">
                {Object.entries(analyticsData.demographics.genderDistribution).map(([gender, count]) => (
                  <div key={gender} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{gender}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${analyticsData.overview.totalPatients > 0 ? (count / analyticsData.overview.totalPatients) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Reports per Patient</span>
                <span className="text-xl font-bold text-blue-600">{analyticsData.performance.reportsPerPatient}</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Avg. Processing Time</span>
                <span className="text-xl font-bold text-green-600">{analyticsData.performance.averageProcessingTime}h</span>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Patient Satisfaction</span>
                <span className="text-xl font-bold text-purple-600">{analyticsData.performance.patientSatisfaction}/5</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Efficiency Score</span>
                <span className="text-xl font-bold text-orange-600">{analyticsData.performance.efficiencyScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              CSV Export
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;