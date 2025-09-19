import { Coach } from '../../types/brain-wellness'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface CoachProfileProps {
  coach: Coach
  onBookSession: () => void
  onClose: () => void
}

export default function CoachProfile({ coach, onBookSession, onClose }: CoachProfileProps) {
  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'adhd': return 'bg-brain-100 text-brain-700'
      case 'memory': return 'bg-wellness-100 text-wellness-700'
      case 'stress': return 'bg-calm-100 text-calm-700'
      case 'wellness': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatSpecialty = (specialty: string) => {
    switch (specialty) {
      case 'adhd': return 'ADHD Support'
      case 'memory': return 'Memory Enhancement'
      case 'stress': return 'Stress Management'
      case 'wellness': return 'Complete Wellness'
      default: return specialty
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Coach Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Coach Info */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-brain-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    👩‍⚕️
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{coach.name}</h3>
                  <p className="text-gray-600">{coach.title}</p>
                  
                  <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{coach.rating}</span>
                    </div>
                    <div className="text-gray-500">
                      {coach.totalSessions} sessions
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialty.map((spec) => (
                      <span
                        key={spec}
                        className={`px-3 py-1 rounded-full text-sm ${getSpecialtyColor(spec)}`}
                      >
                        {formatSpecialty(spec)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {coach.languages.map((language) => (
                      <span
                        key={language}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Book Session Button */}
                <Button
                  onClick={onBookSession}
                  className="w-full"
                  variant="brain"
                >
                  Book Session
                </Button>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">About</h4>
                <p className="text-gray-600 leading-relaxed">{coach.bio}</p>
              </Card>

              {/* Certifications */}
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Certifications & Credentials</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {coach.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-brain-50 rounded-lg"
                    >
                      <span className="text-brain-600">🎓</span>
                      <span className="text-sm text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pricing */}
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Session Types & Pricing</h4>
                <div className="space-y-4">
                  {coach.pricing.map((pricing, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{pricing.sessionType}</div>
                        <div className="text-sm text-gray-600">{pricing.duration} minutes</div>
                      </div>
                      <div className="text-xl font-semibold text-brain-600">
                        ${pricing.price}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Reviews Preview */}
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Recent Reviews</h4>
                <div className="space-y-4">
                  <div className="border-l-4 border-brain-500 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-500">
                        ⭐⭐⭐⭐⭐
                      </div>
                      <span className="text-sm text-gray-500">Sarah M.</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      "Dr. Chen helped me develop amazing strategies for managing my ADHD. 
                      Her approach is both scientific and practical. Highly recommend!"
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-wellness-500 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-500">
                        ⭐⭐⭐⭐⭐
                      </div>
                      <span className="text-sm text-gray-500">Mark T.</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      "The memory training techniques have been life-changing. 
                      I can now remember names and important details much better."
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-calm-500 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-500">
                        ⭐⭐⭐⭐⭐
                      </div>
                      <span className="text-sm text-gray-500">Jennifer L.</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      "Professional, knowledgeable, and genuinely caring. 
                      The sessions are always productive and insightful."
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

