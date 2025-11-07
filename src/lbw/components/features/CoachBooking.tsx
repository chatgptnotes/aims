import { useState } from 'react'
import { Coach, TimeSlot, CoachingSession } from '../../types/brain-wellness'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { getAvailableTimeSlots } from '../../data/coaches'

interface CoachBookingProps {
  coach: Coach
  onBookingComplete: (session: Partial<CoachingSession>) => void
  onCancel: () => void
}

export default function CoachBooking({ coach, onBookingComplete, onCancel }: CoachBookingProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedSessionType, setSelectedSessionType] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isBooking, setIsBooking] = useState(false)

  const availableSlots = selectedDate ? getAvailableTimeSlots(coach.id, selectedDate) : []
  
  // Generate next 30 days for date selection
  const generateDateOptions = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })
        })
      }
    }
    
    return dates
  }

  const handleBooking = async () => {
    if (!selectedSlot || !selectedSessionType) return
    
    setIsBooking(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // const selectedPricing = coach.pricing.find(p => p.sessionType === selectedSessionType)
      
      const session: Partial<CoachingSession> = {
        coachId: coach.id,
        datetime: selectedSlot.datetime,
        duration: selectedSlot.duration,
        type: selectedSessionType.toLowerCase().includes('qeeg') ? 'qeeg_consultation' :
              selectedSessionType.toLowerCase().includes('nervous') ? 'nervous_system' : 'brain_coaching',
        status: 'scheduled',
        notes: notes || undefined
      }
      
      onBookingComplete(session)
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsBooking(false)
    }
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Book Session with {coach.name}</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Coach Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-brain-100 rounded-full flex items-center justify-center text-2xl">
              👩‍⚕️
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{coach.name}</h3>
              <p className="text-sm text-gray-600">{coach.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-yellow-600">⭐ {coach.rating}</span>
                <span className="text-sm text-gray-500">• {coach.totalSessions} sessions</span>
              </div>
            </div>
          </div>

          {/* Session Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Session Type
            </label>
            <div className="grid gap-3">
              {coach.pricing.map((pricing) => (
                <button
                  key={pricing.sessionType}
                  onClick={() => setSelectedSessionType(pricing.sessionType)}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    selectedSessionType === pricing.sessionType
                      ? 'border-brain-500 bg-brain-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{pricing.sessionType}</div>
                      <div className="text-sm text-gray-600">{pricing.duration} minutes</div>
                    </div>
                    <div className="text-lg font-semibold text-brain-600">
                      ${pricing.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedSlot(null)
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brain-500 focus:border-brain-500"
            >
              <option value="">Choose a date...</option>
              {generateDateOptions().map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Time Slots
              </label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 text-center border rounded-lg transition-colors ${
                        selectedSlot?.id === slot.id
                          ? 'border-brain-500 bg-brain-50 text-brain-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {formatTime(slot.datetime)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No available slots for this date. Please select another date.
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Session Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific topics you'd like to discuss or goals for this session..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brain-500 focus:border-brain-500"
              rows={3}
            />
          </div>

          {/* Booking Summary */}
          {selectedSlot && selectedSessionType && (
            <div className="mb-6 p-4 bg-brain-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Coach: {coach.name}</div>
                <div>Session: {selectedSessionType}</div>
                <div>
                  Date: {new Date(selectedSlot.datetime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div>Time: {formatTime(selectedSlot.datetime)}</div>
                <div>Duration: {selectedSlot.duration} minutes</div>
                <div className="font-medium text-brain-600">
                  Total: ${coach.pricing.find(p => p.sessionType === selectedSessionType)?.price}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!selectedSlot || !selectedSessionType || isBooking}
              className="flex-1"
            >
              {isBooking ? 'Booking...' : 'Book Session'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
