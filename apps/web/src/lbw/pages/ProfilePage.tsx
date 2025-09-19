import { useState } from 'react'
import { useBrainWellness } from '../hooks/useBrainWellness'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function ProfilePage() {
  const { user, updateUser } = useBrainWellness()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age?.toString() || '',
    improvementFocus: user?.improvementFocus || 'wellness',
    healthConditions: user?.healthConditions || [],
    currentMedications: user?.currentMedications || [],
    sleepHours: user?.sleepHours?.toString() || '8',
    exerciseFrequency: user?.exerciseFrequency || 'moderate',
    stressLevel: user?.stressLevel?.toString() || '5',
    coachingPreference: user?.coachingPreference || 'none'
  })

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await updateUser({
        ...user,
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age) || undefined,
        improvementFocus: formData.improvementFocus as any,
        healthConditions: formData.healthConditions,
        currentMedications: formData.currentMedications,
        sleepHours: parseInt(formData.sleepHours) || undefined,
        exerciseFrequency: formData.exerciseFrequency as any,
        stressLevel: parseInt(formData.stressLevel) || undefined,
        coachingPreference: formData.coachingPreference as any
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const getImprovementFocusIcon = (focus: string | undefined) => {
    switch (focus) {
      case 'adhd': return '🎯'
      case 'memory': return '🧠'
      case 'stress': return '🧘‍♀️'
      case 'wellness': return '🌟'
      default: return '🎯'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Settings</h1>
            <p className="text-gray-600">
              Manage your personal information and brain wellness preferences.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-brain-500 to-wellness-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {user?.name || 'User'}
                </h2>
                <p className="text-gray-600 text-sm mb-4">{user?.email}</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Focus Area:</span>
                    <div className="flex items-center space-x-1">
                      <span>{getImprovementFocusIcon(user?.improvementFocus || 'wellness')}</span>
                      <span className="text-sm capitalize">
                        {user?.improvementFocus === 'adhd' ? 'ADHD' : user?.improvementFocus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Member Since:</span>
                    <span className="text-sm">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Last Active:</span>
                    <span className="text-sm text-green-600">Today</span>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="brain"
                  className="w-full mt-6"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Assessments:</span>
                    <span className="font-medium">5 completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Activities:</span>
                    <span className="font-medium">23 completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Streak:</span>
                    <span className="font-medium">7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Progress Score:</span>
                    <span className="font-medium text-brain-600">78/100</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  {isEditing && (
                    <Button onClick={handleSave} variant="brain" size="sm">
                      Save Changes
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Enter your age"
                        min="18"
                        max="120"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.age || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Focus Area
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.improvementFocus}
                        onChange={(e) => handleInputChange('improvementFocus', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brain-500 focus:border-brain-500"
                      >
                        <option value="adhd">ADHD & Focus</option>
                        <option value="memory">Memory Enhancement</option>
                        <option value="stress">Stress Management</option>
                        <option value="wellness">Complete Wellness</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">
                        {user?.improvementFocus === 'adhd' ? 'ADHD & Focus' : user?.improvementFocus}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Health Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Hours (per night)
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.sleepHours}
                        onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                        placeholder="8"
                        min="4"
                        max="12"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.sleepHours || 'Not provided'} hours</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercise Frequency
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.exerciseFrequency}
                        onChange={(e) => handleInputChange('exerciseFrequency', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brain-500 focus:border-brain-500"
                      >
                        <option value="never">Never</option>
                        <option value="rarely">Rarely (1-2 times/month)</option>
                        <option value="light">Light (1-2 times/week)</option>
                        <option value="moderate">Moderate (3-4 times/week)</option>
                        <option value="intense">Intense (5+ times/week)</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{user?.exerciseFrequency || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Stress Level (1-10)
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.stressLevel}
                        onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                        placeholder="5"
                        min="1"
                        max="10"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.stressLevel || 'Not provided'}/10</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coaching Preference
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.coachingPreference}
                        onChange={(e) => handleInputChange('coachingPreference', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brain-500 focus:border-brain-500"
                      >
                        <option value="none">Self-guided for now</option>
                        <option value="brain">Brain Coach</option>
                        <option value="nervous_system">Nervous System Coach</option>
                        <option value="both">Both Types of Coaching</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">
                        {user?.coachingPreference === 'none' ? 'Self-guided' : 
                         user?.coachingPreference === 'nervous_system' ? 'Nervous System Coach' :
                         user?.coachingPreference || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Account Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive updates about your progress and new content</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brain-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brain-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Data Export</div>
                      <div className="text-sm text-gray-600">Download your assessment data and progress</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <div className="font-medium text-red-900">Delete Account</div>
                      <div className="text-sm text-red-600">Permanently delete your account and all data</div>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
