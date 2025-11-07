import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ImprovementFocus, User } from '../../types/brain-wellness'
import { getPersonalizedDailyContent } from '../../data/content'

interface ContentItem {
  id: string
  type: 'article' | 'video' | 'exercise' | 'quote' | 'meditation' | 'nutrition' | 'breathwork'
  title: string
  description: string
  content: string
  duration?: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: ImprovementFocus
  tags: string[]
  completed?: boolean
  progress?: number
  estimatedBenefit: string
  scientificBacking?: string
}

interface ContentEngineProps {
  user?: User | null
  onContentComplete?: (contentId: string) => void
  onContentStart?: (contentId: string) => void
}

export default function ContentEngine({ user, onContentComplete, onContentStart }: ContentEngineProps) {
  const [selectedCategory, setSelectedCategory] = useState<ImprovementFocus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ContentItem['type'] | 'all'>('all')
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [dailyContent, setDailyContent] = useState<any>(null)

  useEffect(() => {
    // Load personalized daily content
    if (user?.improvementFocus) {
      const daily = getPersonalizedDailyContent(user.improvementFocus)
      setDailyContent(daily)
    }

    // Generate personalized content recommendations
    const personalizedContent = generatePersonalizedContent(user)
    setContentItems(personalizedContent)
  }, [user])

  const generatePersonalizedContent = (user?: User | null): ContentItem[] => {
    const baseContent: ContentItem[] = [
      // ADHD/Focus Content
      {
        id: 'focus-1',
        type: 'exercise',
        title: 'Pomodoro Focus Training',
        description: 'Structured focus sessions with timed breaks to improve attention span',
        content: 'Work for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a longer break.',
        duration: 25,
        difficulty: 'beginner',
        category: 'adhd',
        tags: ['focus', 'productivity', 'time-management'],
        estimatedBenefit: 'Improves sustained attention by 20-30%',
        scientificBacking: 'Based on attention restoration theory and cognitive load research'
      },
      {
        id: 'focus-2',
        type: 'meditation',
        title: 'Single-Point Focus Meditation',
        description: 'Train your brain to maintain attention on a single point',
        content: 'Focus on your breath, a candle flame, or a specific sound for increasing durations.',
        duration: 15,
        difficulty: 'intermediate',
        category: 'adhd',
        tags: ['meditation', 'focus', 'mindfulness'],
        estimatedBenefit: 'Strengthens prefrontal cortex attention networks',
        scientificBacking: 'Supported by neuroplasticity research on meditation'
      },
      
      // Memory Content
      {
        id: 'memory-1',
        type: 'exercise',
        title: 'Memory Palace Technique',
        description: 'Use spatial memory to remember lists and information',
        content: 'Create a mental map of familiar locations and place items to remember at specific locations.',
        duration: 20,
        difficulty: 'intermediate',
        category: 'memory',
        tags: ['memory', 'mnemonics', 'spatial'],
        estimatedBenefit: 'Can improve recall by up to 500%',
        scientificBacking: 'Ancient technique validated by modern neuroscience'
      },
      {
        id: 'memory-2',
        type: 'exercise',
        title: 'Dual N-Back Training',
        description: 'Advanced working memory training exercise',
        content: 'Track both visual and auditory sequences simultaneously to boost working memory.',
        duration: 15,
        difficulty: 'advanced',
        category: 'memory',
        tags: ['working-memory', 'cognitive-training', 'dual-task'],
        estimatedBenefit: 'Increases fluid intelligence and working memory capacity',
        scientificBacking: 'Peer-reviewed studies show transfer to general intelligence'
      },
      
      // Stress Management Content
      {
        id: 'stress-1',
        type: 'breathwork',
        title: '4-7-8 Breathing Technique',
        description: 'Activate the parasympathetic nervous system for relaxation',
        content: 'Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4-8 cycles.',
        duration: 5,
        difficulty: 'beginner',
        category: 'stress',
        tags: ['breathing', 'relaxation', 'anxiety'],
        estimatedBenefit: 'Reduces cortisol levels within 5 minutes',
        scientificBacking: 'Activates vagus nerve and parasympathetic response'
      },
      {
        id: 'stress-2',
        type: 'meditation',
        title: 'Body Scan Progressive Relaxation',
        description: 'Systematically release tension throughout your body',
        content: 'Start at your toes and mentally scan upward, consciously relaxing each body part.',
        duration: 20,
        difficulty: 'beginner',
        category: 'stress',
        tags: ['relaxation', 'body-awareness', 'tension-release'],
        estimatedBenefit: 'Reduces muscle tension and stress hormones',
        scientificBacking: 'Evidence-based practice in clinical psychology'
      },
      
      // Wellness Content
      {
        id: 'wellness-1',
        type: 'nutrition',
        title: 'Brain-Healthy Smoothie Recipe',
        description: 'Nutrient-rich smoothie to support cognitive function',
        content: 'Blend blueberries, spinach, walnuts, Greek yogurt, and green tea for brain-boosting nutrients.',
        duration: 10,
        difficulty: 'beginner',
        category: 'wellness',
        tags: ['nutrition', 'antioxidants', 'omega-3'],
        estimatedBenefit: 'Provides essential nutrients for brain health',
        scientificBacking: 'Ingredients shown to support neuroplasticity and reduce inflammation'
      },
      {
        id: 'wellness-2',
        type: 'exercise',
        title: 'High-Intensity Interval Training (HIIT)',
        description: 'Short bursts of intense exercise to boost BDNF',
        content: '30 seconds high intensity, 90 seconds rest. Repeat 8-12 cycles.',
        duration: 20,
        difficulty: 'intermediate',
        category: 'wellness',
        tags: ['exercise', 'BDNF', 'neuroplasticity'],
        estimatedBenefit: 'Increases BDNF by 200-300%',
        scientificBacking: 'Exercise-induced neurotrophin research'
      }
    ]

    // Filter content based on user's improvement focus
    if (!user?.improvementFocus) return baseContent

    // Prioritize content for user's focus area
    const prioritizedContent = baseContent.sort((a, b) => {
      const userFocus = Array.isArray(user.improvementFocus) ? user.improvementFocus[0] : user.improvementFocus
      if (a.category === userFocus && b.category !== userFocus) return -1
      if (b.category === userFocus && a.category !== userFocus) return 1
      return 0
    })

    return prioritizedContent
  }

  const filteredContent = contentItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory
    const typeMatch = selectedType === 'all' || item.type === selectedType
    return categoryMatch && typeMatch
  })

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'article': return '📖'
      case 'video': return '🎥'
      case 'exercise': return '🏋️‍♀️'
      case 'quote': return '💭'
      case 'meditation': return '🧘‍♀️'
      case 'nutrition': return '🥗'
      case 'breathwork': return '🌬️'
      default: return '📋'
    }
  }

  // const getCategoryColor = (category: ImprovementFocus) => {
  //   switch (category) {
  //     case 'adhd': return 'brain'
  //     case 'memory': return 'wellness'
  //     case 'stress': return 'calm'
  //     case 'wellness': return 'green'
  //     default: return 'gray'
  //   }
  // }

  const getDifficultyColor = (difficulty: ContentItem['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleStartContent = (item: ContentItem) => {
    setContentItems(prev => 
      prev.map(content => 
        content.id === item.id 
          ? { ...content, progress: 0 }
          : content
      )
    )
    onContentStart?.(item.id)
  }

  const handleCompleteContent = (item: ContentItem) => {
    setContentItems(prev => 
      prev.map(content => 
        content.id === item.id 
          ? { ...content, completed: true, progress: 100 }
          : content
      )
    )
    onContentComplete?.(item.id)
  }

  return (
    <div className="space-y-6">
      {/* Daily Featured Content */}
      {dailyContent && (
        <Card className="p-6 bg-gradient-to-br from-brain-50 to-wellness-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Featured Content</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-brain-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">💭</span>
                <span className="font-medium text-gray-900">Daily Quote</span>
              </div>
              <p className="text-gray-600 italic">"{dailyContent.quote.text}"</p>
              <p className="text-sm text-gray-500 mt-2">— {dailyContent.quote.author}</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-wellness-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">🎯</span>
                <span className="font-medium text-gray-900">Daily Task</span>
              </div>
              <p className="text-gray-600">{dailyContent.task.title}</p>
              <Button size="sm" variant="outline" className="mt-2">
                Start Task
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="adhd">ADHD & Focus</option>
              <option value="memory">Memory & Cognition</option>
              <option value="stress">Stress Management</option>
              <option value="wellness">Complete Wellness</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="exercise">Exercises</option>
              <option value="meditation">Meditation</option>
              <option value="breathwork">Breathwork</option>
              <option value="nutrition">Nutrition</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className={`p-6 ${item.completed ? 'bg-green-50 border-green-200' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTypeIcon(item.type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                </div>
              </div>
              {item.duration && (
                <span className="text-sm text-gray-500">{item.duration}m</span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-700 mb-1">Estimated Benefit:</div>
              <div className="text-xs text-green-600">{item.estimatedBenefit}</div>
            </div>
            
            {item.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-brain-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              {!item.completed && item.progress === undefined && (
                <Button
                  onClick={() => handleStartContent(item)}
                  variant="brain"
                  size="sm"
                  className="flex-1"
                >
                  Start
                </Button>
              )}
              
              {item.progress !== undefined && !item.completed && (
                <Button
                  onClick={() => handleCompleteContent(item)}
                  variant="wellness"
                  size="sm"
                  className="flex-1"
                >
                  Complete
                </Button>
              )}
              
              {item.completed && (
                <div className="flex-1 text-center py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  ✅ Completed
                </div>
              )}
              
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
