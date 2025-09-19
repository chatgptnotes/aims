import { useState } from 'react'
import { Coach, CoachingSession, ImprovementFocus } from '../types/brain-wellness'
import { sampleCoaches, getCoachesBySpecialty } from '../data/coaches'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import CoachProfile from '../components/features/CoachProfile'
import CoachBooking from '../components/features/CoachBooking'
// import { useBrainWellness } from '../hooks/useBrainWellness'

export default function CoachingPage() {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<ImprovementFocus | 'all'>('all')
  // const { user } = useBrainWellness()

  const filteredCoaches = selectedSpecialty === 'all' 
    ? sampleCoaches 
    : getCoachesBySpecialty(selectedSpecialty)

  const handleBookingComplete = (session: Partial<CoachingSession>) => {
    console.log('Session booked:', session)
    // Here you would normally save to database
    setShowBooking(false)
    setSelectedCoach(null)
    
    // Show success message (you could use a toast here)
    alert('Session booked successfully! You will receive a confirmation email shortly.')
  }

  const getSpecialtyIcon = (specialty: ImprovementFocus) => {
    switch (specialty) {
      case 'adhd': return '🧠'
      case 'memory': return '💭'
      case 'stress': return '🌿'
      case 'wellness': return '⚡'
      default: return '🎯'
    }
  }

  const getSpecialtyColor = (specialty: ImprovementFocus) => {
    switch (specialty) {
      case 'adhd': return 'brain'
      case 'memory': return 'wellness'
      case 'stress': return 'calm'
      case 'wellness': return 'wellness'
      default: return 'brain'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Brain Wellness Coaching</h1>
            <p className="text-gray-700 dark:text-gray-200 text-base font-medium leading-6">
              Connect with certified brain wellness coaches for personalized guidance and support.
            </p>
          </div>

          {/* Filter by Specialty */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSpecialty === 'all' ? 'brain' : 'outline'}
                  onClick={() => setSelectedSpecialty('all')}
                  className="text-sm"
                >
                  All Coaches
                </Button>
                {(['adhd', 'memory', 'stress', 'wellness'] as ImprovementFocus[]).map((specialty) => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? getSpecialtyColor(specialty) as any : 'outline'}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className="text-sm"
                  >
                    {getSpecialtyIcon(specialty)} {specialty === 'adhd' ? 'ADHD' : specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Coaching Types */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-brain-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brain-600 text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brain Coaching</h3>
              <p className="text-gray-700 dark:text-gray-200 text-base mb-4 font-medium leading-6">
                Focus enhancement, executive function, and cognitive performance optimization.
              </p>
              <div className="text-base text-gray-700 dark:text-gray-200 mb-4 font-medium">Starting at $80/session</div>
              <Button
                onClick={() => setSelectedSpecialty('adhd')}
                variant="brain"
                className="w-full"
              >
                Find Brain Coaches
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-calm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-calm-600 text-2xl">🌿</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nervous System Coaching</h3>
              <p className="text-gray-700 dark:text-gray-200 text-base mb-4 font-medium leading-6">
                Stress regulation, trauma recovery, and nervous system optimization.
              </p>
              <div className="text-sm text-gray-500 mb-4">Starting at $90/session</div>
              <Button
                onClick={() => setSelectedSpecialty('stress')}
                variant="calm"
                className="w-full"
              >
                Find Stress Coaches
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-wellness-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-wellness-600 text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">qEEG Consultation</h3>
              <p className="text-gray-700 dark:text-gray-200 text-base mb-4 font-medium leading-6">
                Brain mapping analysis and neurofeedback treatment planning.
              </p>
              <div className="text-sm text-gray-500 mb-4">Starting at $150/session</div>
              <Button
                onClick={() => setSelectedSpecialty('memory')}
                variant="wellness"
                className="w-full"
              >
                Find qEEG Experts
              </Button>
            </Card>
          </div>

          {/* Featured Coaches */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {selectedSpecialty === 'all' ? 'All Coaches' : `${selectedSpecialty.charAt(0).toUpperCase() + selectedSpecialty.slice(1)} Specialists`}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoaches.map((coach) => (
                <Card key={coach.id} className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      👩‍⚕️
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                      <p className="text-sm text-gray-600">{coach.title}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {coach.specialty.map((spec) => (
                        <span key={spec} className={`px-2 py-1 text-xs rounded-full ${
                          spec === 'adhd' ? 'bg-brain-100 text-brain-700' :
                          spec === 'memory' ? 'bg-wellness-100 text-wellness-700' :
                          spec === 'stress' ? 'bg-calm-100 text-calm-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {spec === 'adhd' ? 'ADHD' : spec.charAt(0).toUpperCase() + spec.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>⭐ {coach.rating} rating</span>
                    <span>{coach.totalSessions} sessions</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => setSelectedCoach(coach)}
                      variant="outline"
                      className="w-full"
                    >
                      View Profile
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedCoach(coach)
                        setShowBooking(true)
                      }}
                      variant="brain"
                      className="w-full"
                    >
                      Book Session
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">Brain Coaching with Dr. Sarah Chen</div>
                    <span className="text-sm text-gray-500">Tomorrow</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">2:00 PM - 3:00 PM (60 minutes)</div>
                  <div className="flex space-x-2">
                    <Button variant="brain" className="text-sm px-3 py-1">
                      Join Session
                    </Button>
                    <Button variant="outline" className="text-sm px-3 py-1">
                      Reschedule
                    </Button>
                  </div>
                </div>
                
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-4">No more upcoming sessions</p>
                  <Button
                    onClick={() => setSelectedSpecialty('all')}
                    variant="brain"
                  >
                    Book New Session
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session History</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">ADHD Strategy Session</div>
                    <span className="text-sm text-gray-500">3 days ago</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Coach: Dr. Sarah Chen • 60 minutes
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">⭐ Rated: 5/5</span>
                    <button className="text-brain-600 text-sm hover:text-brain-700">
                      View Notes
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">Stress Management</div>
                    <span className="text-sm text-gray-500">1 week ago</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Coach: Michael Rodriguez • 45 minutes
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">⭐ Rated: 5/5</span>
                    <button className="text-brain-600 text-sm hover:text-brain-700">
                      View Notes
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedCoach && !showBooking && (
        <CoachProfile
          coach={selectedCoach}
          onBookSession={() => setShowBooking(true)}
          onClose={() => setSelectedCoach(null)}
        />
      )}

      {selectedCoach && showBooking && (
        <CoachBooking
          coach={selectedCoach}
          onBookingComplete={handleBookingComplete}
          onCancel={() => {
            setShowBooking(false)
            setSelectedCoach(null)
          }}
        />
      )}
    </div>
  )
}