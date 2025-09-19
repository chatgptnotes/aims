import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { Progress } from '../ui/Progress'
import { useBrainWellness } from '../../hooks/useBrainWellness'
import type { ImprovementFocus } from '../../types/brain-wellness'

interface OnboardingData {
  // Step 1: Personal Info
  name: string
  age: string
  gender: string
  email: string
  
  // Step 2: Improvement Focus
  improvementFocus: ImprovementFocus[]
  
  // Step 3: Conditional assessments based on focus
  hasCompletedQEEG: boolean
  qeegFile?: File
  
  // Step 4: Health & Lifestyle
  currentSymptoms: string[]
  medications: string[]
  sleepHours: string
  exerciseFrequency: string
  stressLevel: number
  
  // Step 5: Coaching Preferences
  coachingPreference: 'brain' | 'nervous_system' | 'both' | 'none'
}

const initialData: OnboardingData = {
  name: '',
  age: '',
  gender: '',
  email: '',
  improvementFocus: [],
  hasCompletedQEEG: false,
  currentSymptoms: [],
  medications: [],
  sleepHours: '',
  exerciseFrequency: '',
  stressLevel: 5,
  coachingPreference: 'none'
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate()
  const { updateUser } = useBrainWellness()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)

  // Calculate total steps based on selected focus areas
  const getTotalSteps = () => {
    let steps = 3 // Personal info, focus selection, final setup
    
    // Add conditional steps based on focus
    if (data.improvementFocus.includes('adhd') || data.improvementFocus.includes('stress')) {
      steps += 1 // QEEG and assessment step
    }
    
    steps += 1 // Health & lifestyle
    steps += 1 // Coaching preferences
    
    return steps
  }

  const totalSteps = getTotalSteps()

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleFocus = (focus: ImprovementFocus) => {
    setData(prev => ({
      ...prev,
      improvementFocus: prev.improvementFocus.includes(focus)
        ? prev.improvementFocus.filter(f => f !== focus)
        : [...prev.improvementFocus, focus]
    }))
  }

  const toggleSymptom = (symptom: string) => {
    setData(prev => ({
      ...prev,
      currentSymptoms: prev.currentSymptoms.includes(symptom)
        ? prev.currentSymptoms.filter(s => s !== symptom)
        : [...prev.currentSymptoms, symptom]
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      navigate('/')
    }
  }

  const handleComplete = async () => {
    try {
      // Update user profile with onboarding data
      await updateUser({
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender as 'male' | 'female' | 'other',
        email: data.email,
        improvementFocus: data.improvementFocus[0] || 'wellness',
        onboardingCompleted: true
      })
      
      onComplete(data)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep()
      case 2:
        return renderFocusSelectionStep()
      case 3:
        return renderConditionalAssessmentStep()
      case 4:
        return renderHealthLifestyleStep()
      case 5:
        return renderCoachingPreferencesStep()
      case 6:
        return renderFinalSetupStep()
      default:
        return null
    }
  }

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to LBW</h2>
        <p className="text-gray-700 dark:text-gray-200 text-base font-medium leading-6">Break free from stress, forgetfulness, and brain fog. Let's start with some basic information about you.</p>
      </div>
      
      <div className="space-y-4">
        <Input
          label="Full Name"
          value={data.name}
          onChange={(e) => updateData('name', e.target.value)}
          placeholder="Enter your full name"
          required
        />
        
        <Input
          label="Age"
          type="number"
          value={data.age}
          onChange={(e) => updateData('age', e.target.value)}
          placeholder="Enter your age"
          required
        />
        
        <Select
          label="Gender"
          value={data.gender}
          onChange={(e) => updateData('gender', e.target.value)}
          options={[
            { value: '', label: 'Select gender' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]}
          required
        />
        
        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(e) => updateData('email', e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>
    </div>
  )

  const renderFocusSelectionStep = () => {
    const focusOptions = [
      { 
        id: 'adhd' as ImprovementFocus, 
        title: 'Stay focused longer (ADHD)', 
        description: 'Attention, focus, and executive function support', 
        icon: '🧠',
        pathway: 'ADHD Pathway'
      },
      { 
        id: 'memory' as ImprovementFocus, 
        title: 'Remember things better', 
        description: 'Memory enhancement and cognitive training', 
        icon: '💭',
        pathway: 'Memory Pathway'
      },
      { 
        id: 'mood' as ImprovementFocus, 
        title: 'Improve mood regulation', 
        description: 'Emotional balance and mental well-being', 
        icon: '😌',
        pathway: 'Mood Pathway'
      },
      { 
        id: 'stress' as ImprovementFocus, 
        title: 'Be in control of stress', 
        description: 'Stress management and emotional regulation', 
        icon: '🧘‍♀️',
        pathway: 'Stress & Emotional Regulation Pathway'
      },
      { 
        id: 'all' as ImprovementFocus, 
        title: 'All of the above', 
        description: 'Comprehensive brain wellness approach', 
        icon: '⭐',
        pathway: 'Complete Wellness Program'
      }
    ]

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">What would you like to improve?</h2>
          <p className="text-gray-700 dark:text-gray-200 text-base font-medium leading-6">Select all areas that apply to you. We'll personalize your experience based on your goals.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {focusOptions.map((focus) => (
            <button
              key={focus.id}
              onClick={() => toggleFocus(focus.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                data.improvementFocus.includes(focus.id)
                  ? 'border-brain-500 bg-brain-50 ring-2 ring-brain-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <span className="text-3xl">{focus.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{focus.title}</h3>
                  <p className="text-base text-gray-700 dark:text-gray-200 mb-2 font-medium leading-6">{focus.description}</p>
                  <span className="text-base text-brain-600 font-semibold">{focus.pathway}</span>
                </div>
                {data.improvementFocus.includes(focus.id) && (
                  <span className="text-brain-500 text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {data.improvementFocus.length > 0 && (
          <div className="bg-brain-50 rounded-lg p-4">
            <h4 className="font-medium text-brain-900 mb-2">Your Selected Pathways:</h4>
            <ul className="text-base text-brain-700 space-y-1 font-medium">
              {data.improvementFocus.map((focus) => {
                const option = focusOptions.find(opt => opt.id === focus)
                return option ? <li key={focus}>• {option.pathway}</li> : null
              })}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const renderConditionalAssessmentStep = () => {
    const needsQEEG = data.improvementFocus.includes('adhd') || data.improvementFocus.includes('stress')
    
    if (!needsQEEG) {
      // Skip this step if not needed
      return renderHealthLifestyleStep()
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">QEEG Brain Mapping</h2>
          <p className="text-gray-700 dark:text-gray-200 text-base font-medium leading-6">
            Based on your focus areas, a QEEG brain scan will provide valuable insights for your personalized program.
          </p>
        </div>

        <Card variant="gradient">
          <CardContent className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">QEEG Brain Scan</h3>
            <p className="text-gray-600 mb-4">
              A QEEG (Quantitative Electroencephalogram) provides detailed insights into your brain's electrical activity, 
              helping us create the most effective personalized treatment plan.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-100 mb-2 leading-6">
                  Have you completed a QEEG scan?
                </label>
                <div className="flex space-x-4 justify-center">
                  <Button
                    variant={data.hasCompletedQEEG ? 'brain' : 'outline'}
                    onClick={() => updateData('hasCompletedQEEG', true)}
                  >
                    Yes, I have
                  </Button>
                  <Button
                    variant={!data.hasCompletedQEEG ? 'brain' : 'outline'}
                    onClick={() => updateData('hasCompletedQEEG', false)}
                  >
                    No, I need one
                  </Button>
                </div>
              </div>

              {data.hasCompletedQEEG && (
                <div>
                  <label className="block text-base font-semibold text-gray-800 dark:text-gray-100 mb-2 leading-6">
                    Upload your QEEG results (PDF or image)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => updateData('qeegFile', e.target.files?.[0])}
                    className="block w-full text-base text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-brain-50 file:text-brain-700 hover:file:bg-brain-100 font-medium"
                  />
                </div>
              )}

              {!data.hasCompletedQEEG && (
                <div className="bg-white rounded-lg p-4 border border-brain-200">
                  <h4 className="font-medium text-gray-900 mb-2">Book Your QEEG Scan</h4>
                  <p className="text-base text-gray-700 dark:text-gray-200 mb-3 font-medium leading-6">
                    We'll help you schedule a QEEG scan with one of our certified providers.
                  </p>
                  <Button variant="wellness" size="sm">
                    Find QEEG Provider
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderHealthLifestyleStep = () => {
    const commonSymptoms = [
      'Difficulty concentrating',
      'Memory problems',
      'Anxiety',
      'Depression',
      'Irritability',
      'Fatigue',
      'Sleep problems',
      'Mood swings',
      'Brain fog',
      'Procrastination'
    ]

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Health & Lifestyle Assessment</h2>
          <p className="text-gray-700 dark:text-gray-200 text-base font-medium leading-6">Help us understand your current state to provide better recommendations.</p>
        </div>

        <div className="space-y-6">
          {/* Current Symptoms */}
          <div>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 leading-6">
              What symptoms are you currently experiencing? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`p-2 text-base rounded-lg border transition-colors font-medium ${
                    data.currentSymptoms.includes(symptom)
                      ? 'border-brain-500 bg-brain-50 text-brain-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Hours */}
          <Select
            label="How many hours of sleep do you typically get?"
            value={data.sleepHours}
            onChange={(e) => updateData('sleepHours', e.target.value)}
            options={[
              { value: '', label: 'Select hours' },
              { value: '<5', label: 'Less than 5 hours' },
              { value: '5-6', label: '5-6 hours' },
              { value: '7-8', label: '7-8 hours' },
              { value: '9+', label: '9+ hours' }
            ]}
          />

          {/* Exercise */}
          <Select
            label="How often do you exercise per week?"
            value={data.exerciseFrequency}
            onChange={(e) => updateData('exerciseFrequency', e.target.value)}
            options={[
              { value: '', label: 'Select frequency' },
              { value: 'never', label: 'Never' },
              { value: '1-2', label: '1-2 times' },
              { value: '3-4', label: '3-4 times' },
              { value: '5+', label: '5+ times' }
            ]}
          />

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your current stress level? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-base text-gray-700 dark:text-gray-200 font-medium">Low (1)</span>
              <input
                type="range"
                min="1"
                max="10"
                value={data.stressLevel}
                onChange={(e) => updateData('stressLevel', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-base text-gray-700 dark:text-gray-200 font-medium">High (10)</span>
            </div>
            <div className="text-center mt-1">
              <span className="text-lg font-semibold text-brain-600">{data.stressLevel}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCoachingPreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Coaching Preferences</h2>
        <p className="text-gray-600">Choose the type of coaching support you'd like to receive.</p>
      </div>

      <div className="space-y-4">
        {[
          {
            id: 'brain',
            title: 'Brain Coach',
            description: 'Specialized in ADHD, cognitive enhancement, and brain optimization',
            icon: '🧠',
            focus: 'ADHD & Cognitive Enhancement'
          },
          {
            id: 'nervous_system',
            title: 'Nervous System Coach',
            description: 'Focused on stress management, anxiety, and emotional regulation',
            icon: '🧘‍♀️',
            focus: 'Stress & Emotional Regulation'
          },
          {
            id: 'both',
            title: 'Both Types of Coaching',
            description: 'Comprehensive support covering all aspects of brain wellness',
            icon: '⭐',
            focus: 'Complete Wellness Support'
          },
          {
            id: 'none',
            title: 'Self-guided for now',
            description: 'I prefer to start with self-guided content and assessments',
            icon: '📚',
            focus: 'Independent Learning'
          }
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => updateData('coachingPreference', option.id as any)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              data.coachingPreference === option.id
                ? 'border-brain-500 bg-brain-50 ring-2 ring-brain-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                <p className="text-base text-gray-700 dark:text-gray-200 mb-1 font-medium leading-6">{option.description}</p>
                <span className="text-base text-brain-600 font-semibold">{option.focus}</span>
              </div>
              {data.coachingPreference === option.id && (
                <span className="text-brain-500 text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderFinalSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">You're All Set!</h2>
        <p className="text-gray-600">Your personalized brain wellness journey is ready to begin.</p>
      </div>
      
      <Card variant="gradient">
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">What's Next:</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-brain-500 rounded-full flex-shrink-0"></span>
              <span className="text-gray-700">Complete your initial brain fitness assessment</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-wellness-500 rounded-full flex-shrink-0"></span>
              <span className="text-gray-700">Receive your personalized daily content</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-calm-500 rounded-full flex-shrink-0"></span>
              <span className="text-gray-700">Track your progress and improvements</span>
            </li>
            {data.coachingPreference !== 'none' && (
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-brain-600 rounded-full flex-shrink-0"></span>
                <span className="text-gray-700">Connect with your selected coaching support</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="bg-wellness-50 rounded-lg p-4 border border-wellness-200">
        <p className="text-wellness-800 text-center font-medium">
          "You're not broken. You're becoming limitless."
        </p>
      </div>
    </div>
  )

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name && data.age && data.gender && data.email
      case 2:
        return data.improvementFocus.length > 0
      case 3:
        return true // QEEG step is optional
      case 4:
        return data.sleepHours && data.exerciseFrequency
      case 5:
        return data.coachingPreference !== 'none'
      case 6:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">Step {currentStep} of {totalSteps}</span>
            <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress 
            value={(currentStep / totalSteps) * 100}
            variant="wellness"
          />
        </div>

        {/* Content Card */}
        <Card>
          <CardContent className="p-8">
            {renderStep()}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                {currentStep === 1 ? '← Back to Home' : '← Back'}
              </Button>
              <Button
                variant="wellness"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === totalSteps ? 'Complete Setup' : 'Continue →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
