import { Link } from 'react-router-dom'
import { useBrainWellness } from '../hooks/useBrainWellness'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { getPersonalizedDailyContent } from '../data/content'
import BrainFitnessScore from '../components/features/BrainFitnessScore'
import { SkeletonDashboard } from '../components/ui/Skeleton'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { user, loading } = useBrainWellness()
  
  // Get personalized content based on user's improvement focus
  const dailyContent = user?.improvementFocus 
    ? getPersonalizedDailyContent(user.improvementFocus) 
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SkeletonDashboard />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-700 dark:text-gray-200 mt-2 text-base font-medium leading-6">Here's your brain wellness overview for today.</p>
        </motion.div>

        {/* Brain Fitness Score */}
        <motion.div 
          className="grid lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="lg:col-span-2">
            <BrainFitnessScore 
              onRecommendationClick={(recommendation) => {
                // Handle recommendation clicks - could navigate to specific content or assessments
                console.log('Recommendation clicked:', recommendation)
              }}
            />
          </div>

          {/* Quick Actions */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/progress"
                  className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-brain-300 hover:bg-brain-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📝</span>
                    <div>
                      <div className="font-medium text-gray-900">Daily Check-in</div>
                      <div className="text-base text-gray-700 dark:text-gray-200 font-medium">Log your mood and progress</div>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  to="/assessments"
                  className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-wellness-300 hover:bg-wellness-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🧪</span>
                    <div>
                      <div className="font-medium text-gray-900">Take Assessment</div>
                      <div className="text-base text-gray-700 dark:text-gray-200 font-medium">ADHD, stress, or memory test</div>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  to="/content"
                  className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-calm-300 hover:bg-calm-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="font-medium text-gray-900">Start Activity</div>
                      <div className="text-base text-gray-700 dark:text-gray-200 font-medium">Breathing, exercise, or cognitive training</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Today's Personalized Content */}
        <motion.div 
          className="space-y-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Today's Inspiration */}
          {dailyContent?.quote && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Inspiration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-brain-50 to-wellness-50 rounded-lg p-4">
                  <blockquote className="text-gray-700 italic mb-2 text-lg">
                    "{dailyContent.quote.text}"
                  </blockquote>
                  <cite className="text-base text-gray-700 dark:text-gray-200 font-medium">— {dailyContent.quote.author}</cite>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Featured Video */}
            {dailyContent?.video && (
              <Card variant="interactive">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🎥</span>
                    <span className="text-base font-semibold text-brain-600">Featured Video</span>
                  </div>
                  <CardTitle className="text-lg">{dailyContent.video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-200 text-base mb-4 font-medium leading-6">{dailyContent.video.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{Math.floor(dailyContent.video.duration / 60)} min</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dailyContent.video.category === 'adhd' ? 'bg-brain-100 text-brain-700' :
                      dailyContent.video.category === 'memory' ? 'bg-wellness-100 text-wellness-700' :
                      'bg-calm-100 text-calm-700'
                    }`}>
                      {dailyContent.video.difficulty}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(dailyContent.video.url, '_blank')}
                  >
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Featured Article */}
            {dailyContent?.article && (
              <Card variant="interactive">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">📚</span>
                    <span className="text-sm font-medium text-wellness-600">Featured Article</span>
                  </div>
                  <CardTitle className="text-lg">{dailyContent.article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{dailyContent.article.excerpt}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{dailyContent.article.readTime} min read</span>
                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium">By {dailyContent.article.author}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">Read Article</Button>
                </CardContent>
              </Card>
            )}

            {/* Daily Task */}
            {dailyContent?.task && (
              <Card variant="interactive">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🎯</span>
                    <span className="text-sm font-medium text-calm-600">Today's Task</span>
                  </div>
                  <CardTitle className="text-lg">{dailyContent.task.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{dailyContent.task.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{dailyContent.task.estimatedTime} min</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dailyContent.task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      dailyContent.task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {dailyContent.task.difficulty}
                    </span>
                  </div>
                  <Link to="/content">
                    <Button size="sm" variant="wellness" className="w-full">Start Task</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Content Row */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {/* Breathwork */}
            {dailyContent?.breathwork && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🧘‍♀️</span>
                    <span className="text-sm font-medium text-calm-600">Breathwork</span>
                  </div>
                  <CardTitle>{dailyContent.breathwork.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{dailyContent.breathwork.description}</p>
                  <div className="bg-calm-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-calm-800">{dailyContent.breathwork.technique}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{dailyContent.breathwork.duration} min</span>
                    <Button size="sm" variant="calm">Practice Now</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nutrition */}
            {dailyContent?.nutrition && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🥗</span>
                    <span className="text-sm font-medium text-wellness-600">Brain Nutrition</span>
                  </div>
                  <CardTitle>{dailyContent.nutrition.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{dailyContent.nutrition.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium capitalize">{dailyContent.nutrition.type}</span>
                    <Link to="/content">
                      <Button size="sm" variant="wellness">View Recipe</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="font-semibold text-gray-900 mb-4">Your Progress This Week</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm text-gray-600 mb-2">{day}</div>
                <div className={`w-8 h-8 rounded-full mx-auto ${
                  index < 4 ? 'bg-brain-200' : 'bg-gray-100'
                }`}></div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            You've been active for 4 out of 7 days this week. Keep it up! 🎉
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}