import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'
import { useBrainWellness } from '../../hooks/useBrainWellness'
import type { Assessment, AssessmentQuestion, AssessmentResponse } from '../../types/brain-wellness'
import { calculateAssessmentScore } from '../../data/assessments'

interface AssessmentTakerProps {
  assessment: Assessment
  onComplete?: (result: any) => void
  onCancel?: () => void
}

export default function AssessmentTaker({ assessment, onComplete, onCancel }: AssessmentTakerProps) {
  const navigate = useNavigate()
  const { user, completeAssessment } = useBrainWellness()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [isCompleting, setIsCompleting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1
  const canProceed = responses[currentQuestion?.id] !== undefined

  const handleResponse = (value: number) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    
    setIsCompleting(true)
    
    try {
      // Calculate results
      const calculatedResults = calculateAssessmentScore(assessment, responses)
      
      // Create assessment result object
      const assessmentResult = {
        id: `${assessment.id}-${Date.now()}`,
        userId: user.id,
        assessmentType: assessment.type,
        responses: Object.entries(responses).map(([questionId, value]) => ({
          questionId,
          value,
          timestamp: new Date().toISOString()
        })) as AssessmentResponse[],
        score: calculatedResults.score,
        insights: calculatedResults.insights,
        recommendations: calculatedResults.recommendations,
        completedAt: new Date().toISOString()
      }

      // Save to database
      await completeAssessment(assessmentResult)
      
      setResults({
        ...calculatedResults,
        assessmentTitle: assessment.title,
        maxScore: assessment.scoring.maxScore
      })
      setShowResults(true)
      
      if (onComplete) {
        onComplete(assessmentResult)
      }
    } catch (error) {
      console.error('Error completing assessment:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleFinish = () => {
    navigate('/dashboard')
  }

  const renderScaleQuestion = (question: AssessmentQuestion) => {
    const scaleMin = question.scaleMin || 0
    const scaleMax = question.scaleMax || 5
    const currentValue = responses[question.id]

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-lg text-gray-800 leading-relaxed">{question.text}</p>
        </div>
        
        <div className="space-y-4">
          {/* Scale labels */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>{question.scaleLabels?.min || 'Low'}</span>
            <span>{question.scaleLabels?.max || 'High'}</span>
          </div>
          
          {/* Scale buttons */}
          <div className="flex justify-between gap-2">
            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => {
              const value = scaleMin + i
              const isSelected = currentValue === value
              
              return (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className={`flex-1 h-12 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-brain-500 bg-brain-50 text-brain-700 scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">{value}</div>
                </button>
              )
            })}
          </div>
          
          {/* Selected value indicator */}
          {currentValue !== undefined && (
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Selected: <span className="font-medium text-brain-600">{currentValue}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMultipleChoiceQuestion = (question: AssessmentQuestion) => {
    const currentValue = responses[question.id]

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-lg text-gray-800 leading-relaxed">{question.text}</p>
        </div>
        
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleResponse(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                currentValue === index
                  ? 'border-brain-500 bg-brain-50 text-brain-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderResults = () => {
    if (!results) return null

    const scorePercentage = (results.score / results.maxScore) * 100
    const categoryColor = assessment.scoring.categories.find(cat => 
      results.score >= cat.range[0] && results.score <= cat.range[1]
    )?.color || 'gray'

    const colorClasses = {
      green: 'text-green-600 bg-green-50 border-green-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      gray: 'text-gray-600 bg-gray-50 border-gray-200'
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-gray-600">Here are your results for the {results.assessmentTitle}</p>
        </div>

        {/* Score Display */}
        <Card variant="gradient">
          <div className="text-center">
            <div className="text-4xl font-bold text-brain-700 mb-2">
              {results.score}/{results.maxScore}
            </div>
            <div className="text-lg text-gray-700 mb-2">{scorePercentage.toFixed(0)}% Score</div>
            <div className={`inline-block px-4 py-2 rounded-full border ${colorClasses[categoryColor as keyof typeof colorClasses]} font-medium`}>
              {results.category}
            </div>
          </div>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-brain-500 mt-1">•</span>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-wellness-500 mt-1">✓</span>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleFinish} variant="wellness" size="lg">
            Continue to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {renderResults()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
            <p className="text-gray-600">{assessment.description}</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <Progress 
              value={progress} 
              variant="wellness"
              showLabel
              label={`Question ${currentQuestionIndex + 1} of ${assessment.questions.length}`}
            />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {currentQuestion?.type === 'scale' && renderScaleQuestion(currentQuestion)}
              {currentQuestion?.type === 'multiple_choice' && renderMultipleChoiceQuestion(currentQuestion)}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={currentQuestionIndex === 0 ? onCancel : handlePrevious}
            >
              {currentQuestionIndex === 0 ? 'Cancel' : '← Previous'}
            </Button>

            <Button
              variant="wellness"
              onClick={handleNext}
              disabled={!canProceed}
              loading={isCompleting}
            >
              {isLastQuestion ? 'Complete Assessment' : 'Next →'}
            </Button>
          </div>

          {/* Question indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {assessment.questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-brain-500'
                    : index < currentQuestionIndex
                    ? 'bg-wellness-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
