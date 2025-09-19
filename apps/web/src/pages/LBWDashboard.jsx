import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Activity, Target, TrendingUp, Calendar, Award, ChevronRight, Sparkles } from 'lucide-react';

const LBWDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [brainScore, setBrainScore] = useState(75);

  const quickActions = [
    { title: 'Daily Check-in', desc: 'Log your mood and progress', icon: '📝', path: '/lbw/progress' },
    { title: 'New Assessment', desc: 'Take a brain wellness test', icon: '🧪', path: '/assessments' },
    { title: 'Book Coaching', desc: 'Schedule a session', icon: '👥', path: '/coaching' },
    { title: 'Learn Something', desc: 'Explore new content', icon: '📚', path: '/lbw/content' }
  ];

  const recentActivity = [
    { type: 'assessment', title: 'ADHD Assessment Completed', date: '2 days ago', score: 85 },
    { type: 'coaching', title: 'Session with Dr. Sarah Chen', date: '3 days ago', duration: '45 min' },
    { type: 'progress', title: 'Weekly Goal Achieved', date: '5 days ago', achievement: 'Focus Master' },
    { type: 'content', title: 'Watched: Mindfulness Basics', date: '1 week ago', completion: 100 }
  ];

  const weeklyProgress = [
    { day: 'Mon', score: 72 },
    { day: 'Tue', score: 75 },
    { day: 'Wed', score: 78 },
    { day: 'Thu', score: 74 },
    { day: 'Fri', score: 80 },
    { day: 'Sat', score: 82 },
    { day: 'Sun', score: 85 }
  ];

  const upcomingSessions = [
    { title: 'Brain Training Session', time: 'Today, 3:00 PM', type: 'training' },
    { title: 'Dr. Michael Rodriguez', time: 'Tomorrow, 10:00 AM', type: 'coaching' },
    { title: 'Memory Assessment Due', time: 'In 3 days', type: 'assessment' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/lbw')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">LBW Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/lbw/progress')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Progress
              </button>
              <button
                onClick={() => navigate('/assessments')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Assessment
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's your brain wellness overview for today
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Brain Fitness Score Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Brain Fitness Score</h2>
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - brainScore / 100)}`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">{brainScore}</div>
                        <div className="text-sm text-gray-500">out of 100</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">82</div>
                    <div className="text-xs text-gray-500">Focus</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">78</div>
                    <div className="text-xs text-gray-500">Memory</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">90</div>
                    <div className="text-xs text-gray-500">Mood</div>
                  </div>
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h3>
                <div className="flex items-end justify-between h-40">
                  {weeklyProgress.map((day, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-12 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:opacity-80"
                        style={{ height: `${day.score}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{day.day}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          {activity.type === 'assessment' && '🧪'}
                          {activity.type === 'coaching' && '👥'}
                          {activity.type === 'progress' && '🏆'}
                          {activity.type === 'content' && '📚'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-500">{activity.date}</div>
                        </div>
                      </div>
                      {activity.score && (
                        <div className="text-lg font-bold text-blue-600">{activity.score}%</div>
                      )}
                      {activity.achievement && (
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          {activity.achievement}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{action.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{action.title}</div>
                            <div className="text-xs text-gray-500">{action.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Sessions</h3>
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                      <div className="font-medium text-gray-900">{session.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {session.time}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                  View All Sessions →
                </button>
              </div>

              {/* Achievement Card */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="h-8 w-8" />
                  <h3 className="text-lg font-bold">New Achievement!</h3>
                </div>
                <p className="text-white/90 mb-4">
                  You've completed 7 days of consistent brain training. Keep up the great work!
                </p>
                <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                  View All Achievements
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LBWDashboard;