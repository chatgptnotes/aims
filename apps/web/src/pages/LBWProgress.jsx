import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, TrendingUp, Calendar, Target, Award,
  Activity, BarChart3, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const LBWProgress = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  const progressData = {
    week: [
      { date: 'Mon', overall: 72, focus: 70, memory: 68, mood: 78 },
      { date: 'Tue', overall: 75, focus: 72, memory: 71, mood: 82 },
      { date: 'Wed', overall: 78, focus: 76, memory: 74, mood: 84 },
      { date: 'Thu', overall: 74, focus: 71, memory: 70, mood: 80 },
      { date: 'Fri', overall: 80, focus: 78, memory: 76, mood: 86 },
      { date: 'Sat', overall: 82, focus: 80, memory: 78, mood: 88 },
      { date: 'Sun', overall: 85, focus: 83, memory: 81, mood: 90 }
    ],
    month: [
      { date: 'Week 1', overall: 70, focus: 68, memory: 65, mood: 77 },
      { date: 'Week 2', overall: 75, focus: 73, memory: 71, mood: 81 },
      { date: 'Week 3', overall: 78, focus: 76, memory: 74, mood: 84 },
      { date: 'Week 4', overall: 82, focus: 80, memory: 78, mood: 88 }
    ]
  };

  const milestones = [
    { title: '7-Day Streak', desc: 'Completed daily check-ins for a week', achieved: true, icon: '🔥' },
    { title: 'Focus Master', desc: 'Achieved 80+ focus score', achieved: true, icon: '🎯' },
    { title: 'Memory Champion', desc: 'Complete 10 memory exercises', achieved: false, progress: 7, total: 10, icon: '🧠' },
    { title: 'Wellness Warrior', desc: 'Maintain 85+ mood score for 30 days', achieved: false, progress: 12, total: 30, icon: '⭐' }
  ];

  const insights = [
    { type: 'positive', title: 'Great Progress!', desc: 'Your focus score improved by 15% this week' },
    { type: 'positive', title: 'Consistent Practice', desc: 'You\'ve maintained daily training for 7 days' },
    { type: 'suggestion', title: 'Try Memory Exercises', desc: 'Your memory score could benefit from more practice' },
    { type: 'tip', title: 'Best Performance Time', desc: 'You perform best during morning sessions (9-11 AM)' }
  ];

  const goals = [
    { title: 'Daily Brain Training', progress: 85, target: '30 min/day', current: '25 min' },
    { title: 'Weekly Assessments', progress: 100, target: '3 assessments', current: '3 completed' },
    { title: 'Coaching Sessions', progress: 50, target: '2 sessions', current: '1 completed' },
    { title: 'Content Learning', progress: 70, target: '5 articles', current: '3.5 read' }
  ];

  const currentData = progressData[selectedPeriod];
  const maxValue = 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">Progress Tracking</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/lbw/dashboard')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Progress Journey</h1>
            <p className="text-lg text-gray-600">Track your brain wellness improvements over time</p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedPeriod === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedPeriod === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Main Progress Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Performance Trends</h2>
              <div className="flex gap-2">
                {['overall', 'focus', 'memory', 'mood'].map(metric => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedMetric === metric
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 flex items-end justify-between gap-4">
              {currentData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 hover:opacity-90"
                      style={{ height: `${(day[selectedMetric] / maxValue) * 100}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-700">
                        {day[selectedMetric]}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{day.date}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Current Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">Previous Period</span>
              </div>
            </div>
          </div>

          {/* Goals and Milestones Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Goals Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Goals</h3>
              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900">{goal.title}</span>
                      <span className="text-sm text-gray-500">{goal.current}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Target: {goal.target}</span>
                      <span className="text-xs font-medium text-purple-600">{goal.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Milestones</h3>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                      {milestone.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{milestone.title}</span>
                        {milestone.achieved ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-xs text-gray-500">
                            {milestone.progress}/{milestone.total}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{milestone.desc}</p>
                      {!milestone.achieved && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 rounded-full"
                            style={{ width: `${(milestone.progress / milestone.total) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Personalized Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'positive'
                      ? 'bg-green-50 border-green-200'
                      : insight.type === 'suggestion'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {insight.type === 'positive' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                    {insight.type === 'suggestion' && <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
                    {insight.type === 'tip' && <Activity className="h-5 w-5 text-yellow-600 mt-0.5" />}
                    <div>
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate('/assessments')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Take New Assessment
            </button>
            <button
              onClick={() => navigate('/coaching')}
              className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
            >
              Book Coaching Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LBWProgress;