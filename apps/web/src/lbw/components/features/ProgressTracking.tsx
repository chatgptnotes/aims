import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'

interface ProgressData {
  date: string
  overallScore: number
  focusScore: number
  memoryScore: number
  moodScore: number
  stressScore: number
  activitiesCompleted: number
  assessmentsCompleted: number
}

interface ReassessmentCycle {
  id: string
  startDate: string
  endDate: string
  dayNumber: number
  status: 'active' | 'completed' | 'upcoming'
  initialAssessments: string[]
  finalAssessments: string[]
  improvements: {
    focus: number
    memory: number
    mood: number
    stress: number
  }
}

const mockProgressData: ProgressData[] = [
  { date: '2025-01-15', overallScore: 78, focusScore: 85, memoryScore: 78, moodScore: 92, stressScore: 74, activitiesCompleted: 3, assessmentsCompleted: 1 },
  { date: '2025-01-14', overallScore: 76, focusScore: 83, memoryScore: 76, moodScore: 90, stressScore: 72, activitiesCompleted: 4, assessmentsCompleted: 0 },
  { date: '2025-01-13', overallScore: 74, focusScore: 80, memoryScore: 75, moodScore: 88, stressScore: 70, activitiesCompleted: 2, assessmentsCompleted: 1 },
  { date: '2025-01-12', overallScore: 72, focusScore: 78, memoryScore: 73, moodScore: 85, stressScore: 68, activitiesCompleted: 3, assessmentsCompleted: 0 },
  { date: '2025-01-11', overallScore: 70, focusScore: 75, memoryScore: 70, moodScore: 82, stressScore: 65, activitiesCompleted: 2, assessmentsCompleted: 2 },
]

const mockReassessmentCycles: ReassessmentCycle[] = [
  {
    id: 'cycle-1',
    startDate: '2025-01-06',
    endDate: '2025-01-15',
    dayNumber: 10,
    status: 'completed',
    initialAssessments: ['ADHD Rating Scale', 'GAD-7', 'PSS-10'],
    finalAssessments: ['ADHD Rating Scale', 'GAD-7', 'PSS-10'],
    improvements: {
      focus: 12,
      memory: 8,
      mood: 15,
      stress: 10
    }
  },
  {
    id: 'cycle-2',
    startDate: '2025-01-16',
    endDate: '2025-01-25',
    dayNumber: 6,
    status: 'active',
    initialAssessments: ['ADHD Rating Scale', 'Memory Assessment'],
    finalAssessments: [],
    improvements: {
      focus: 0,
      memory: 0,
      mood: 0,
      stress: 0
    }
  },
  {
    id: 'cycle-3',
    startDate: '2025-01-26',
    endDate: '2025-02-04',
    dayNumber: 0,
    status: 'upcoming',
    initialAssessments: [],
    finalAssessments: [],
    improvements: {
      focus: 0,
      memory: 0,
      mood: 0,
      stress: 0
    }
  }
]

export default function ProgressTracking() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'cycles' | 'trends'>('overview')

  const activeCycle = mockReassessmentCycles.find(cycle => cycle.status === 'active')
  const latestData = mockProgressData[0]

  const getScoreChange = (current: number, previous: number) => {
    const change = current - previous
    return {
      value: change,
      positive: change >= 0,
      percentage: Math.abs((change / previous) * 100).toFixed(1)
    }
  }

  const getDaysUntilReassessment = () => {
    if (!activeCycle) return 0
    const endDate = new Date(activeCycle.endDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'cycles', label: 'Cycles' },
            { id: 'trends', label: 'Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-base font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-brain-700 shadow-sm'
                  : 'text-gray-700 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-100 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-base font-medium"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Active Cycle Alert */}
      {activeCycle && (
        <Card className="p-4 bg-gradient-to-r from-brain-50 to-wellness-50 border-brain-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Active 10-Day Cycle</h3>
              <p className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">
                Day {activeCycle.dayNumber} of 10 • {getDaysUntilReassessment()} days until reassessment
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-brain-600">{activeCycle.dayNumber}/10</div>
                <div className="text-xs text-gray-500">Days Complete</div>
              </div>
              <Progress 
                value={(activeCycle.dayNumber / 10) * 100} 
                className="w-16 h-2"
                variant="brain"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-brain-600 mb-1">
                {latestData.overallScore}
              </div>
              <div className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">Overall Score</div>
              <div className="text-xs text-green-600 mt-1">
                ↗️ +{getScoreChange(latestData.overallScore, mockProgressData[1].overallScore).value} points
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-wellness-600 mb-1">
                {latestData.activitiesCompleted}
              </div>
              <div className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">Today's Activities</div>
              <div className="text-xs text-green-600 mt-1">
                ✅ Target: 3-5 daily
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-calm-600 mb-1">
                {mockReassessmentCycles.filter(c => c.status === 'completed').length}
              </div>
              <div className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">Completed Cycles</div>
              <div className="text-xs text-blue-600 mt-1">
                📈 {mockReassessmentCycles.filter(c => c.status === 'completed').length * 10} total days
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {getDaysUntilReassessment()}
              </div>
              <div className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">Days to Assessment</div>
              <div className="text-xs text-purple-600 mt-1">
                🎯 Stay consistent!
              </div>
            </Card>
          </div>

          {/* Score Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Scores</h3>
            <div className="space-y-4">
              {[
                { label: 'Focus', value: latestData.focusScore, color: 'brain' },
                { label: 'Memory', value: latestData.memoryScore, color: 'wellness' },
                { label: 'Mood', value: latestData.moodScore, color: 'calm' },
                { label: 'Stress Management', value: latestData.stressScore, color: 'purple' }
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{metric.label}</span>
                    <span className={`font-medium ${
                      metric.color === 'brain' ? 'text-brain-600' :
                      metric.color === 'wellness' ? 'text-wellness-600' :
                      metric.color === 'calm' ? 'text-calm-600' :
                      'text-purple-600'
                    }`}>
                      {metric.value}/100
                    </span>
                  </div>
                  <Progress 
                    value={metric.value} 
                    variant={metric.color as any}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'cycles' && (
        <div className="space-y-6">
          <div className="grid gap-6">
            {mockReassessmentCycles.map((cycle) => (
              <Card key={cycle.id} className={`p-6 ${
                cycle.status === 'active' ? 'ring-2 ring-brain-500 bg-brain-50' : ''
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      10-Day Cycle {cycle.id.split('-')[1]}
                      {cycle.status === 'active' && <span className="ml-2 text-brain-600">(Active)</span>}
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">
                      {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cycle.status === 'completed' ? 'bg-green-100 text-green-700' :
                      cycle.status === 'active' ? 'bg-brain-100 text-brain-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                    </div>
                  </div>
                </div>

                {cycle.status === 'active' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{cycle.dayNumber}/10 days</span>
                    </div>
                    <Progress value={(cycle.dayNumber / 10) * 100} variant="brain" className="h-2" />
                  </div>
                )}

                {cycle.status === 'completed' && (
                  <div className="grid md:grid-cols-4 gap-4 mt-4">
                    {Object.entries(cycle.improvements).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">+{value}%</div>
                        <div className="text-xs text-gray-600 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">
                    {cycle.initialAssessments.length > 0 ? (
                      <>Initial: {cycle.initialAssessments.join(', ')}</>
                    ) : (
                      'No assessments yet'
                    )}
                  </div>
                  {cycle.status === 'active' && getDaysUntilReassessment() <= 2 && (
                    <Button 
                      variant="brain" 
                      size="sm"
                      onClick={() => {
                        window.location.href = '/assessments'
                      }}
                    >
                      Take Reassessment
                    </Button>
                  )}
                  {cycle.status === 'upcoming' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        alert('Cycle preparation: This would set up notifications, create study plan, and prepare assessment schedule.')
                      }}
                    >
                      Prepare Cycle
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Trend</h3>
            <div className="bg-gray-50 rounded-lg p-8 h-64 flex items-center justify-center">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Patterns</h3>
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">{day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brain-600 h-2 rounded-full" 
                          style={{ width: `${70 + (index * 5)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{70 + (index * 5)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Improvements</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Mood Regulation</span>
                  <span className="text-green-600 font-bold">+22%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Focus & Attention</span>
                  <span className="text-blue-600 font-bold">+18%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Stress Management</span>
                  <span className="text-purple-600 font-bold">+15%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Memory & Recall</span>
                  <span className="text-yellow-600 font-bold">+12%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

