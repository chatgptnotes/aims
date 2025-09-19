import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import AssessmentTaker from '../components/features/AssessmentTaker'
import { allAssessments, getAssessmentById } from '../data/assessments'

export default function AssessmentPage() {
  const { type } = useParams()
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(type || null)
  
  const currentAssessment = selectedAssessment ? getAssessmentById(selectedAssessment) : null

  const handleStartAssessment = (assessmentId: string) => {
    setSelectedAssessment(assessmentId)
  }

  const handleAssessmentComplete = () => {
    setSelectedAssessment(null)
  }

  const handleAssessmentCancel = () => {
    setSelectedAssessment(null)
  }

  if (currentAssessment) {
    return (
      <AssessmentTaker
        assessment={currentAssessment}
        onComplete={handleAssessmentComplete}
        onCancel={handleAssessmentCancel}
      />
    )
  }

  const assessmentIcons = {
    'adhd-rating-scale': '🧠',
    'gad-7': '😌',
    'pss-10': '🧘‍♀️',
    'memory-assessment': '💭',
    'mood-assessment': '☀️'
  }

  const assessmentColors = {
    'adhd-rating-scale': 'brain',
    'gad-7': 'brain',
    'pss-10': 'calm',
    'memory-assessment': 'wellness',
    'mood-assessment': 'wellness'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Brain Wellness Assessments</h1>
            <p className="text-gray-600">
              Complete these evidence-based assessments to get personalized insights and recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAssessments.map((assessment) => {
              const iconKey = assessment.id as keyof typeof assessmentIcons
              const colorKey = assessment.id as keyof typeof assessmentColors
              const icon = assessmentIcons[iconKey] || '📋'
              const color = assessmentColors[colorKey] || 'brain'
              
              // Define static class mappings
              const bgClasses = {
                brain: 'bg-brain-100',
                wellness: 'bg-wellness-100',
                calm: 'bg-calm-100'
              }
              
              const textClasses = {
                brain: 'text-brain-600',
                wellness: 'text-wellness-600', 
                calm: 'text-calm-600'
              }
              
              return (
                <Card key={assessment.id} variant="interactive">
                  <CardHeader>
                    <div className={`w-12 h-12 ${bgClasses[color as keyof typeof bgClasses]} rounded-lg flex items-center justify-center mb-4`}>
                      <span className={`${textClasses[color as keyof typeof textClasses]} text-xl`}>{icon}</span>
                    </div>
                    <CardTitle>{assessment.title}</CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">~{assessment.estimatedTime} minutes</span>
                      <span className={`text-sm font-medium ${textClasses[color as keyof typeof textClasses]}`}>
                        {assessment.questions.length} questions
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      variant={color as any}
                      onClick={() => handleStartAssessment(assessment.id)}
                    >
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              )
            })}

            {/* Comprehensive Assessment Suite */}
            <Card variant="wellness">
              <CardHeader>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">⭐</span>
                </div>
                <CardTitle className="text-white">Complete Assessment Suite</CardTitle>
                <CardDescription className="text-white text-opacity-90">
                  Take all assessments in one session for the most comprehensive brain fitness analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-white text-opacity-75">
                    ~{allAssessments.reduce((total, assessment) => total + assessment.estimatedTime, 0)} minutes
                  </span>
                  <span className="text-sm font-medium text-white">Full Suite</span>
                </div>
                <Button
                  className="w-full bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                  onClick={() => {
                    // TODO: Implement comprehensive assessment flow
                    console.log('Starting comprehensive assessment...')
                  }}
                >
                  Start Full Assessment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Assessment History */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Assessment History</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">ADHD Assessment</div>
                  <div className="text-sm text-gray-600">Completed 3 days ago • Score: 68/100</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // TODO: Implement results viewing
                    alert('Assessment results viewing coming soon!')
                  }}
                >
                  View Results
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Stress Scale (PSS)</div>
                  <div className="text-sm text-gray-600">Completed 1 week ago • Score: 24/40</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // TODO: Implement results viewing
                    alert('Assessment results viewing coming soon!')
                  }}
                >
                  View Results
                </Button>
              </div>
              
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  Take regular assessments to track your progress over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}