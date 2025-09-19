import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { BrainWellnessContextType, User, BrainFitnessScore, DailyContent, DailyProgress, Achievement, AssessmentResult } from '../types/brain-wellness'
import { supabase } from '../lib/supabase'

const BrainWellnessContext = createContext<BrainWellnessContextType | undefined>(undefined)

interface BrainWellnessProviderProps {
  children: ReactNode
}

export function BrainWellnessProvider({ children }: BrainWellnessProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [brainFitnessScore, setBrainFitnessScore] = useState<BrainFitnessScore | null>(null)
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null)
  const [progress, setProgress] = useState<DailyProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    // Initialize with mock data for development
    setUser({
      id: '1',
      name: 'Alex Johnson',
      age: 28,
      gender: 'other',
      email: 'alex@example.com',
      improvementFocus: 'adhd',
      onboardingCompleted: true,
      brainFitnessScore: 78,
      createdAt: '2024-01-15',
      updatedAt: '2024-12-26'
    })
    
    setBrainFitnessScore({
      overall: 78,
      breakdown: {
        focus: 85,
        memory: 78,
        mood: 92,
        stress: 74
      },
      trend: 'up',
      lastUpdated: '2024-12-26',
      improvements: ['Focus training', 'Stress management']
    })
    
    setLoading(false)
    // initializeUser()
  }, [])

  // const initializeUser = async () => {
  //   try {
  //     const { user: authUser } = await getCurrentUser()
  //     if (authUser) {
  //       const { data: userData } = await supabase
  //         .from('users')
  //         .select('*')
  //         .eq('id', authUser.id)
  //         .single()
        
  //       if (userData) {
  //         setUser({
  //           id: userData.id,
  //           name: userData.name,
  //           age: userData.age,
  //           gender: userData.gender,
  //           email: userData.email,
  //           improvementFocus: userData.improvement_focus,
  //           onboardingCompleted: userData.onboarding_completed,
  //           brainFitnessScore: userData.brain_fitness_score,
  //           createdAt: userData.created_at,
  //           updatedAt: userData.updated_at
  //         })
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error initializing user:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    
    try {
      const { data } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()
      
      if (data) {
        setUser(prev => prev ? { ...prev, ...updates } : null)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const completeAssessment = async (result: AssessmentResult) => {
    if (!user) return
    
    try {
      await supabase.from('assessments').insert({
        user_id: user.id,
        assessment_type: result.assessmentType,
        responses: result.responses,
        score: result.score,
        insights: result.insights,
        recommendations: result.recommendations,
        completed_at: result.completedAt
      })
      
      // Refresh brain fitness score after assessment
      await refreshData()
    } catch (error) {
      console.error('Error saving assessment:', error)
    }
  }

  const logDailyProgress = async (progressData: Omit<DailyProgress, 'id' | 'userId'>) => {
    if (!user) return
    
    try {
      await supabase.from('daily_progress').insert({
        user_id: user.id,
        date: progressData.date,
        mood_rating: progressData.moodRating,
        stress_level: progressData.stressLevel,
        focus_level: progressData.focusLevel,
        energy_level: progressData.energyLevel,
        completed_activities: progressData.completedActivities,
        notes: progressData.notes,
        sleep_hours: progressData.sleepHours,
        symptoms: progressData.symptoms || []
      })
      
      await refreshData()
    } catch (error) {
      console.error('Error logging progress:', error)
    }
  }

  const refreshData = async () => {
    if (!user) return
    
    try {
      // Fetch brain fitness score
      const { data: scoreData } = await supabase
        .rpc('calculate_brain_fitness_score', { user_id: user.id })
      
      if (scoreData) {
        setBrainFitnessScore({
          overall: scoreData.overall,
          breakdown: {
            focus: scoreData.focus,
            memory: scoreData.memory,
            mood: scoreData.mood,
            stress: scoreData.stress
          },
          trend: 'stable', // TODO: Calculate trend
          lastUpdated: new Date().toISOString(),
          improvements: [] // TODO: Calculate improvements
        })
      }

      // Fetch daily content
      const today = new Date().toISOString().split('T')[0]
      const { data: contentData } = await supabase
        .rpc('get_personalized_content', { 
          user_id: user.id, 
          content_date: today 
        })
      
      if (contentData) {
        setDailyContent(contentData as DailyContent)
      }

      // Fetch recent progress
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)
      
      if (progressData) {
        setProgress(progressData.map(item => ({
          id: item.id,
          userId: item.user_id,
          date: item.date,
          moodRating: item.mood_rating,
          stressLevel: item.stress_level,
          focusLevel: item.focus_level,
          energyLevel: item.energy_level,
          completedActivities: item.completed_activities,
          notes: item.notes,
          sleepHours: item.sleep_hours,
          symptoms: item.symptoms || []
        })))
      }

      // Fetch achievements
      const { data: achievementData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
      
      if (achievementData) {
        setAchievements(achievementData.map(item => ({
          id: item.id,
          userId: item.user_id,
          type: item.achievement_type,
          title: item.title,
          description: item.description,
          icon: item.icon,
          unlockedAt: item.unlocked_at,
          category: item.category,
          points: item.points
        })))
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const value: BrainWellnessContextType = {
    user,
    loading,
    brainFitnessScore,
    dailyContent,
    progress,
    achievements,
    updateUser,
    completeAssessment,
    logDailyProgress,
    refreshData
  }

  return (
    <BrainWellnessContext.Provider value={value}>
      {children}
    </BrainWellnessContext.Provider>
  )
}

export function useBrainWellness() {
  const context = useContext(BrainWellnessContext)
  if (context === undefined) {
    throw new Error('useBrainWellness must be used within a BrainWellnessProvider')
  }
  return context
}