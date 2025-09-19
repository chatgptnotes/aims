import ProgressTracking from '../components/features/ProgressTracking'
import { Card } from '../components/ui/Card'

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Progress</h1>
            <p className="text-gray-600">
              Track your brain wellness journey with 10-day assessment cycles and celebrate your achievements.
            </p>
          </div>

          {/* Main Progress Tracking Component */}
          <ProgressTracking />

          {/* Achievements Section */}
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements & Milestones</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-medium text-gray-900 text-sm">First Assessment</div>
                <div className="text-xs text-gray-600">Completed your first brain assessment</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <div className="text-3xl mb-2">📅</div>
                <div className="font-medium text-gray-900 text-sm">Cycle Completed</div>
                <div className="text-xs text-gray-600">Finished your first 10-day cycle</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                <div className="text-3xl mb-2">🧘‍♀️</div>
                <div className="font-medium text-gray-900 text-sm">Consistency Master</div>
                <div className="text-xs text-gray-600">Completed daily activities for 7 days</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg border-2 border-dashed border-purple-300">
                <div className="text-3xl mb-2 opacity-50">🎯</div>
                <div className="font-medium text-gray-500 text-sm">Focus Champion</div>
                <div className="text-xs text-gray-400">Complete 3 assessment cycles</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-brain-100 to-brain-200 rounded-lg">
                <div className="text-3xl mb-2">🧠</div>
                <div className="font-medium text-gray-900 text-sm">Brain Optimizer</div>
                <div className="text-xs text-gray-600">Improved focus score by 15+</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-calm-100 to-calm-200 rounded-lg">
                <div className="text-3xl mb-2">🌟</div>
                <div className="font-medium text-gray-900 text-sm">Wellness Warrior</div>
                <div className="text-xs text-gray-600">Maintained streak for 30 days</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-wellness-100 to-wellness-200 rounded-lg border-2 border-dashed border-wellness-300">
                <div className="text-3xl mb-2 opacity-50">⚡</div>
                <div className="font-medium text-gray-500 text-sm">qEEG Expert</div>
                <div className="text-xs text-gray-400">Upload and analyze qEEG data</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg border-2 border-dashed border-orange-300">
                <div className="text-3xl mb-2 opacity-50">🎖️</div>
                <div className="font-medium text-gray-500 text-sm">Coach Connection</div>
                <div className="text-xs text-gray-400">Complete first coaching session</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}