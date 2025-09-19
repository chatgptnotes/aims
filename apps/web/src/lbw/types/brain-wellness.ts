// LBW Brain Wellness Types

export type ImprovementFocus = 'adhd' | 'memory' | 'stress' | 'wellness'

export interface User {
  id: string
  name: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  email: string
  improvementFocus: ImprovementFocus
  healthConditions?: string[]
  currentMedications?: string[]
  sleepHours?: number
  exerciseFrequency?: 'never' | 'rarely' | 'light' | 'moderate' | 'intense'
  stressLevel?: number
  coachingPreference?: 'none' | 'brain' | 'nervous_system' | 'both'
  onboardingCompleted?: boolean
  brainFitnessScore?: number
  createdAt: string
  updatedAt?: string
}

export interface BrainFitnessScore {
  overall: number
  breakdown: {
    focus: number
    memory: number
    mood: number
    stress: number
  }
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  improvements: string[]
}

export interface Assessment {
  id: string
  title: string
  description: string
  type: 'adhd' | 'stress' | 'memory' | 'mood' | 'gad7' | 'pss'
  questions: AssessmentQuestion[]
  estimatedTime: number // in minutes
  scoring: ScoringConfig
  score?: number
}

export interface AssessmentQuestion {
  id: string
  text: string
  type: 'scale' | 'multiple_choice' | 'boolean' | 'text'
  options?: string[]
  scaleMin?: number
  scaleMax?: number
  scaleLabels?: { min: string; max: string }
  required: boolean
  weight?: number
}

export interface AssessmentResponse {
  questionId: string
  value: number | string | boolean
  timestamp: string
}

export interface AssessmentResult {
  id: string
  userId: string
  assessmentType: Assessment['type']
  responses: AssessmentResponse[]
  score: number
  insights: string[]
  recommendations: string[]
  completedAt: string
}

export interface ScoringConfig {
  maxScore: number
  categories: {
    name: string
    range: [number, number]
    description: string
    color: string
  }[]
}

export interface DailyContent {
  id: string
  userId: string
  date: string
  quote: QuoteContent
  video: VideoContent
  article: ArticleContent
  breathwork: BreathworkContent
  nutrition: NutritionContent
  task: TaskContent
  viewed: boolean
}

export interface QuoteContent {
  id: string
  text: string
  author: string
  category: ImprovementFocus
  mood: 'motivational' | 'calming' | 'inspiring' | 'empowering'
}

export interface VideoContent {
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
  duration: number // in seconds
  category: ImprovementFocus
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

export interface ArticleContent {
  id: string
  title: string
  excerpt: string
  content: string
  readTime: number // in minutes
  category: ImprovementFocus
  imageUrl?: string
  author: string
  publishedAt: string
  tags: string[]
}

export interface BreathworkContent {
  id: string
  title: string
  description: string
  technique: string
  duration: number // in minutes
  instructions: string[]
  audioUrl?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  benefits: string[]
}

export interface NutritionContent {
  id: string
  title: string
  description: string
  type: 'tip' | 'recipe' | 'supplement' | 'meal_plan'
  content: string
  imageUrl?: string
  category: ImprovementFocus
  ingredients?: string[]
  instructions?: string[]
}

export interface TaskContent {
  id: string
  title: string
  description: string
  type: 'reminder' | 'journal' | 'exercise' | 'meditation' | 'cognitive_training'
  estimatedTime: number // in minutes
  instructions?: string[]
  category: ImprovementFocus
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface DailyProgress {
  id: string
  userId: string
  date: string
  moodRating: number // 1-10
  stressLevel: number // 1-10
  focusLevel: number // 1-10
  energyLevel: number // 1-10
  completedActivities: string[]
  notes?: string
  sleepHours?: number
  symptoms?: string[]
}

export interface Coach {
  id: string
  name: string
  title: string
  specialty: ImprovementFocus[]
  bio: string
  imageUrl: string
  rating: number
  totalSessions: number
  certifications: string[]
  languages: string[]
  pricing: {
    sessionType: string
    price: number
    duration: number
  }[]
  availability: TimeSlot[]
}

export interface TimeSlot {
  id: string
  datetime: string
  duration: number // in minutes
  available: boolean
  timeZone: string
}

export interface CoachingSession {
  id: string
  coachId: string
  userId: string
  datetime: string
  duration: number
  type: 'brain_coaching' | 'nervous_system' | 'qeeg_consultation'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  sessionNotes?: string
  nextSteps?: string[]
  rating?: number
  feedback?: string
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  isCompleted: boolean
  isRequired: boolean
  order: number
  estimatedTime: number
}

export interface OnboardingData {
  personalInfo: {
    name: string
    age: number
    gender: 'male' | 'female' | 'other'
    email: string
  }
  improvementFocus: ImprovementFocus[]
  healthInfo: {
    currentSymptoms: string[]
    medications: string[]
    previousTherapy: boolean
    sleepQuality: number
  }
  lifestyle: {
    exerciseFrequency: string
    stressLevel: number
    workEnvironment: string
    relationships: string
  }
  assessmentResults: Record<string, AssessmentResult>
  qeegCompleted: boolean
  qeegUpload?: File
  coachingPreference: 'brain' | 'nervous_system' | 'both' | 'none'
}

export interface Achievement {
  id: string
  userId: string
  type: 'streak' | 'assessment' | 'improvement' | 'milestone'
  title: string
  description: string
  icon: string
  unlockedAt: string
  category: ImprovementFocus
  points: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
  success: boolean
  message?: string
  timestamp: string
}

export interface BrainWellnessContextType {
  user: User | null
  loading: boolean
  brainFitnessScore: BrainFitnessScore | null
  dailyContent: DailyContent | null
  progress: DailyProgress[]
  achievements: Achievement[]
  updateUser: (updates: Partial<User>) => Promise<void>
  completeAssessment: (result: AssessmentResult) => Promise<void>
  logDailyProgress: (progress: Omit<DailyProgress, 'id' | 'userId'>) => Promise<void>
  refreshData: () => Promise<void>
}