import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Database,
  Bell,
  Shield,
  Zap,
  Settings,
  BarChart3,
  Globe,
  Sparkles,
  Calendar,
  Trophy,
  Target,
  Rocket,
  Code,
  GitBranch,
  Package
} from 'lucide-react';

const LBWProjectUpdates = () => {
  const navigate = useNavigate();

  const completedFeatures = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Authentication System",
      description: "Complete auth flow with role-based access (Super Admin, Clinic Admin, Patients)",
      date: "Sept 18, 2025",
      status: "completed"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Clinic Management",
      description: "Full CRUD operations for clinic registration and management",
      date: "Sept 18, 2025",
      status: "completed"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Patient Reports System",
      description: "EEG data processing, report generation, and personalized care plans",
      date: "Sept 18, 2025",
      status: "completed"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Data Access Center",
      description: "Comprehensive data access with clinic → patient → files navigation",
      date: "Sept 18, 2025",
      status: "completed"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Advanced Analytics",
      description: "Test metrics, revenue patterns, utilization tracking with CSV export",
      date: "Sept 18, 2025",
      status: "completed"
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Notification System",
      description: "Real-time alerts for clinic usage limits and critical events",
      date: "Sept 18, 2025",
      status: "completed"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Co-Branding Configuration",
      description: "Logo management and co-labeling with pricing tiers",
      date: "Sept 18, 2025",
      status: "completed"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Modern UI Design",
      description: "Glassmorphism effects, animations, and responsive design",
      date: "Sept 18, 2025",
      status: "completed"
    }
  ];

  const inProgressFeatures = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multi-language Support",
      description: "Adding support for multiple languages",
      progress: 65,
      status: "in-progress"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Performance Optimization",
      description: "Code splitting and lazy loading for faster load times",
      progress: 40,
      status: "in-progress"
    },
    {
      icon: <Package className="w-5 h-5" />,
      title: "API Integration",
      description: "RESTful API with AWS DynamoDB backend",
      progress: 30,
      status: "in-progress"
    }
  ];

  const upcomingFeatures = [
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Gamification System",
      description: "Patient engagement through achievements and rewards",
      status: "planned"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "AI-Powered Insights",
      description: "Machine learning models for pattern detection",
      status: "planned"
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "Mobile App",
      description: "React Native app for iOS and Android",
      status: "planned"
    }
  ];

  const stats = [
    { label: "Total Features", value: "20+", icon: <Code className="w-6 h-6" /> },
    { label: "Completed", value: "8", icon: <CheckCircle className="w-6 h-6" /> },
    { label: "In Progress", value: "3", icon: <Clock className="w-6 h-6" /> },
    { label: "Code Quality", value: "A+", icon: <Trophy className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">LBW Project Updates</h1>
                  <p className="text-sm text-gray-600">NeuroSense360 Development Progress</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active Development
              </span>
              <GitBranch className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="text-blue-600">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Completed Features */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Completed Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{feature.date}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Features */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            In Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inProgressFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-medium text-gray-700">{feature.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${feature.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Upcoming Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Planned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Project Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Phase 1: Core Features</p>
                <p className="text-sm text-gray-600">Authentication, Clinic Management, Basic UI - Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Phase 2: Advanced Features</p>
                <p className="text-sm text-gray-600">Analytics, Notifications, Data Access - In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Phase 3: AI & Mobile</p>
                <p className="text-sm text-gray-600">ML Models, Mobile Apps - Planned Q1 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-xl font-bold mb-4">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="font-medium">Frontend</p>
              <p className="text-sm opacity-90">React 18, Tailwind CSS</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="font-medium">Backend</p>
              <p className="text-sm opacity-90">Node.js, Express</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="font-medium">Database</p>
              <p className="text-sm opacity-90">AWS DynamoDB</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="font-medium">Deployment</p>
              <p className="text-sm opacity-90">Vercel, AWS</p>
            </div>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default LBWProjectUpdates;