import ContentEngine from '../components/features/ContentEngine'
import { useBrainWellness } from '../hooks/useBrainWellness'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'

export default function ContentPage() {
  const { user } = useBrainWellness()

  const handleContentComplete = (contentId: string) => {
    console.log('Content completed:', contentId)
    // Here you would update user progress, add achievements, etc.
  }

  const handleContentStart = (contentId: string) => {
    console.log('Content started:', contentId)
    // Here you would track analytics, update user activity, etc.
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Personalized Content</h1>
            <p className="text-gray-600">
              Discover evidence-based exercises, meditations, and resources tailored to your brain wellness goals.
            </p>
          </motion.div>

          {/* Welcome Message for User's Focus Area */}
          {user?.improvementFocus && (
            <Card className="p-6 mb-8 bg-gradient-to-r from-brain-100 to-wellness-100">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {user.improvementFocus === 'adhd' ? '🎯' :
                   user.improvementFocus === 'memory' ? '🧠' :
                   user.improvementFocus === 'stress' ? '🧘‍♀️' : '🌟'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.improvementFocus === 'adhd' ? 'ADHD & Focus Content' :
                     user.improvementFocus === 'memory' ? 'Memory Enhancement Content' :
                     user.improvementFocus === 'stress' ? 'Stress Management Content' :
                     'Complete Wellness Content'}
                  </h2>
                  <p className="text-gray-600">
                    Content specifically curated for your 
                    {user.improvementFocus === 'adhd' ? ' focus and attention goals' :
                     user.improvementFocus === 'memory' ? ' memory and cognitive enhancement journey' :
                     user.improvementFocus === 'stress' ? ' stress reduction and emotional wellness' :
                     ' comprehensive brain wellness journey'}.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Main Content Engine */}
          <ContentEngine 
            user={user}
            onContentComplete={handleContentComplete}
            onContentStart={handleContentStart}
          />

          {/* Additional Resources */}
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-brain-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">📚</span>
                  <span className="font-medium text-gray-900">Research Library</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Access peer-reviewed studies and scientific papers on brain wellness.
                </p>
                <Button variant="outline" size="sm">
                  Browse Research
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-wellness-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">🎓</span>
                  <span className="font-medium text-gray-900">Courses</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Structured learning paths for deep-dive brain training.
                </p>
                <Button variant="outline" size="sm">
                  View Courses
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-calm-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">👥</span>
                  <span className="font-medium text-gray-900">Community</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Connect with others on similar brain wellness journeys.
                </p>
                <Button variant="outline" size="sm">
                  Join Community
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">📱</span>
                  <span className="font-medium text-gray-900">Mobile App</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Take your brain training on the go with our mobile app.
                </p>
                <Button variant="outline" size="sm">
                  Download App
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">🔬</span>
                  <span className="font-medium text-gray-900">Lab Tests</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Discover biomarkers and lab tests to optimize brain health.
                </p>
                <Button variant="outline" size="sm">
                  Explore Tests
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">💊</span>
                  <span className="font-medium text-gray-900">Supplements</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Evidence-based supplement recommendations for brain health.
                </p>
                <Button variant="outline" size="sm">
                  View Supplements
                </Button>
              </div>
            </div>
          </Card>

          {/* Content Categories Overview */}
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-brain-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-brain-600 text-2xl">🎯</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Focus & Attention</h4>
                <p className="text-sm text-gray-600">
                  ADHD support, attention training, and executive function exercises
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-wellness-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-wellness-600 text-2xl">🧠</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Memory & Cognition</h4>
                <p className="text-sm text-gray-600">
                  Memory enhancement, cognitive training, and brain optimization
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-calm-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-calm-600 text-2xl">🧘‍♀️</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Stress & Mood</h4>
                <p className="text-sm text-gray-600">
                  Stress management, emotional regulation, and mental wellness
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-2xl">🌟</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Complete Wellness</h4>
                <p className="text-sm text-gray-600">
                  Holistic brain health, nutrition, exercise, and lifestyle
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

