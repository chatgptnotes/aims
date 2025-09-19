import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'
import { Assessment } from '../../types/brain-wellness'

interface BrainFitnessScoreProps {
  assessments?: Assessment[]
  onRecommendationClick?: (recommendation: string) => void
}

interface ScoreBreakdown {
  focus: number
  memory: number
  mood: number
  stress: number
  overall: number
}

interface ScoreHistory {
  date: string
  score: ScoreBreakdown
}

const mockScoreHistory: ScoreHistory[] = [
  {
    date: '2025-01-15',
    score: { focus: 85, memory: 78, mood: 92, stress: 74, overall: 82 }
  },
  {
    date: '2025-01-05',
    score: { focus: 78, memory: 72, mood: 85, stress: 68, overall: 76 }
  },
  {
    date: '2024-12-26',
    score: { focus: 70, memory: 68, mood: 80, stress: 62, overall: 70 }
  }
]

export default function BrainFitnessScore({ assessments = [], onRecommendationClick }: BrainFitnessScoreProps) {
  const [currentScore, setCurrentScore] = useState<ScoreBreakdown>(mockScoreHistory[0].score)
  const [scoreHistory] = useState<ScoreHistory[]>(mockScoreHistory)
  const [showDetails, setShowDetails] = useState(false)

  // Calculate score based on assessments
  useEffect(() => {
    if (assessments.length > 0) {
      const calculatedScore = calculateScoreFromAssessments(assessments)
      setCurrentScore(calculatedScore)
    }
  }, [assessments])

  const calculateScoreFromAssessments = (assessments: Assessment[]): ScoreBreakdown => {
    let focusTotal = 0, memoryTotal = 0, moodTotal = 0, stressTotal = 0
    let focusCount = 0, memoryCount = 0, moodCount = 0, stressCount = 0

    assessments.forEach(assessment => {
      const score = Math.max(0, 100 - (assessment.score || 0) * 2) // Convert to 0-100 scale
      
      switch (assessment.type) {
        case 'adhd':
          focusTotal += score
          focusCount++
          break
        case 'memory':
          memoryTotal += score
          memoryCount++
          break
        case 'mood':
          moodTotal += score
          moodCount++
          break
        case 'gad7':
        case 'pss':
          stressTotal += score
          stressCount++
          break
      }
    })

    const focus = focusCount > 0 ? Math.round(focusTotal / focusCount) : currentScore.focus
    const memory = memoryCount > 0 ? Math.round(memoryTotal / memoryCount) : currentScore.memory
    const mood = moodCount > 0 ? Math.round(moodTotal / moodCount) : currentScore.mood
    const stress = stressCount > 0 ? Math.round(stressTotal / stressCount) : currentScore.stress
    const overall = Math.round((focus + memory + mood + stress) / 4)

    return { focus, memory, mood, stress, overall }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    if (score >= 60) return 'Needs Work'
    return 'Needs Attention'
  }

  const getRecommendations = () => {
    const recommendations = []
    
    if (currentScore.focus < 70) {
      recommendations.push({
        area: 'Focus & Attention',
        suggestion: 'Consider ADHD-focused exercises and mindfulness training',
        priority: 'high'
      })
    }
    
    if (currentScore.memory < 70) {
      recommendations.push({
        area: 'Memory & Cognitive Function',
        suggestion: 'Try memory training games and cognitive exercises',
        priority: currentScore.memory < 60 ? 'high' : 'medium'
      })
    }
    
    if (currentScore.stress < 70) {
      recommendations.push({
        area: 'Stress Management',
        suggestion: 'Practice stress reduction techniques and breathing exercises',
        priority: 'high'
      })
    }
    
    if (currentScore.mood < 70) {
      recommendations.push({
        area: 'Mood & Emotional Regulation',
        suggestion: 'Consider mood tracking and emotional wellness activities',
        priority: currentScore.mood < 60 ? 'high' : 'medium'
      })
    }
    
    // Add positive reinforcement for high scores
    if (currentScore.overall >= 80) {
      recommendations.push({
        area: 'Maintenance',
        suggestion: 'Keep up the great work! Focus on maintaining your current routine',
        priority: 'low'
      })
    }
    
    return recommendations
  }

  const getScoreChange = (current: number, previous: number) => {
    const change = current - previous
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
      percentage: previous > 0 ? Math.abs((change / previous) * 100).toFixed(1) : '0'
    }
  }

  const previousScore = scoreHistory[1]?.score
  const recommendations = getRecommendations()

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <Card className="p-6 bg-gradient-to-br from-brain-50 to-wellness-50">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Brain Fitness Score</h2>
          <p className="text-gray-600">Your overall brain wellness assessment</p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(currentScore.overall)}`}>
                  {currentScore.overall}
                </div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            </div>
            {/* Progress ring would go here in a real implementation */}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`text-lg font-medium ${getScoreColor(currentScore.overall)}`}>
            {getScoreDescription(currentScore.overall)}
          </div>
          {previousScore && (
            <div className="text-sm text-gray-600 mt-1">
              {(() => {
                const change = getScoreChange(currentScore.overall, previousScore.overall)
                return change.direction === 'up' ? (
                  <span className="text-green-600">↗️ +{change.value} points ({change.percentage}% improvement)</span>
                ) : change.direction === 'down' ? (
                  <span className="text-red-600">↘️ -{change.value} points ({change.percentage}% decrease)</span>
                ) : (
                  <span className="text-gray-600">→ No change from last assessment</span>
                )
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="brain"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>
          <Button variant="outline">
            Take Assessment
          </Button>
        </div>
      </Card>

      {/* Detailed Breakdown */}
      {showDetails && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { key: 'focus', label: 'Focus & Attention', color: 'brain', icon: '🎯' },
              { key: 'memory', label: 'Memory & Cognition', color: 'wellness', icon: '🧠' },
              { key: 'mood', label: 'Mood & Emotional', color: 'calm', icon: '😊' },
              { key: 'stress', label: 'Stress Management', color: 'purple', icon: '🧘‍♀️' }
            ].map((metric) => {
              const score = currentScore[metric.key as keyof ScoreBreakdown]
              const prevScore = previousScore?.[metric.key as keyof ScoreBreakdown]
              const change = prevScore ? getScoreChange(score, prevScore) : null
              
              return (
                <div key={metric.key} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{metric.icon}</span>
                      <span className="font-medium text-gray-900">{metric.label}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                        {score}
                      </div>
                      {change && (
                        <div className="text-xs">
                          {change.direction === 'up' && (
                            <span className="text-green-600">+{change.value}</span>
                          )}
                          {change.direction === 'down' && (
                            <span className="text-red-600">-{change.value}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={score} 
                    variant={metric.color as any}
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {getScoreDescription(score)}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                  rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{rec.area}</div>
                    <div className="text-sm text-gray-600 mt-1">{rec.suggestion}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRecommendationClick?.(rec.area)}
                    >
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Score History */}
      {showDetails && scoreHistory.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score History</h3>
          <div className="space-y-3">
            {scoreHistory.slice(0, 5).map((entry, index) => (
              <div
                key={entry.date}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-brain-50 border border-brain-200' : 'bg-gray-50'
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {index === 0 && <span className="ml-2 text-brain-600">(Current)</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    Focus: {entry.score.focus} • Memory: {entry.score.memory} • 
                    Mood: {entry.score.mood} • Stress: {entry.score.stress}
                  </div>
                </div>
                <div className={`text-xl font-bold ${getScoreColor(entry.score.overall)}`}>
                  {entry.score.overall}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

