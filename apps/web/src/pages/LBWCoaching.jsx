import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Star, Users, Clock, DollarSign, ChevronRight, Heart, Activity } from 'lucide-react';

const LBWCoaching = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCoach, setSelectedCoach] = useState(null);

  const coaches = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      title: 'Brain Performance Coach',
      specialties: ['ADHD', 'Memory'],
      rating: 4.9,
      sessions: 250,
      price: 80,
      image: '👩‍⚕️',
      bio: 'Specializing in ADHD management and executive function optimization with 10+ years experience.',
      availability: 'Available today'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      title: 'Nervous System Specialist',
      specialties: ['Stress', 'Wellness'],
      rating: 4.8,
      sessions: 180,
      price: 90,
      image: '👨‍⚕️',
      bio: 'Expert in stress regulation, trauma recovery, and nervous system optimization.',
      availability: 'Next available: Tomorrow'
    },
    {
      id: 3,
      name: 'Dr. Lisa Thompson',
      title: 'Neurofeedback Expert',
      specialties: ['ADHD', 'Memory', 'Stress'],
      rating: 4.9,
      sessions: 320,
      price: 150,
      image: '👩‍🔬',
      bio: 'qEEG consultation and brain mapping specialist with advanced neurofeedback expertise.',
      availability: 'Available this week'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      title: 'Cognitive Enhancement Coach',
      specialties: ['Memory', 'Wellness'],
      rating: 4.7,
      sessions: 145,
      price: 75,
      image: '👨‍💼',
      bio: 'Focus on cognitive enhancement, memory improvement, and peak mental performance.',
      availability: 'Available today'
    },
    {
      id: 5,
      name: 'Emma Martinez',
      title: 'Holistic Brain Wellness Coach',
      specialties: ['Wellness', 'Stress'],
      rating: 4.8,
      sessions: 210,
      price: 85,
      image: '👩‍🏫',
      bio: 'Integrative approach combining nutrition, mindfulness, and brain training.',
      availability: 'Next available: 2 days'
    }
  ];

  const coachingTypes = [
    {
      id: 'brain',
      title: 'Brain Coaching',
      icon: '🧠',
      description: 'Focus enhancement, executive function, and cognitive performance optimization.',
      price: 'Starting at $80/session',
      color: 'blue'
    },
    {
      id: 'nervous',
      title: 'Nervous System Coaching',
      icon: '🌿',
      description: 'Stress regulation, trauma recovery, and nervous system optimization.',
      price: 'Starting at $90/session',
      color: 'green'
    },
    {
      id: 'qeeg',
      title: 'qEEG Consultation',
      icon: '⚡',
      description: 'Brain mapping analysis and neurofeedback treatment planning.',
      price: 'Starting at $150/session',
      color: 'purple'
    }
  ];

  const filteredCoaches = selectedSpecialty === 'all'
    ? coaches
    : coaches.filter(coach =>
        coach.specialties.some(s => s.toLowerCase() === selectedSpecialty)
      );

  const handleBookCoach = (coach) => {
    setSelectedCoach(coach);
    alert(`Booking session with ${coach.name}. In a real app, this would open a booking calendar.`);
  };

  const specialtyColors = {
    'ADHD': 'bg-pink-100 text-pink-700',
    'Memory': 'bg-purple-100 text-purple-700',
    'Stress': 'bg-green-100 text-green-700',
    'Wellness': 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header with Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Limitless Brain Wellness</span>
                <span className="text-sm text-gray-500">by Dr. Sweta Adatia</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/assessments')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Assessments
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Brain Wellness Coaching</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with certified brain wellness coaches for personalized guidance and support.
            </p>
          </div>

          {/* Specialty Filter */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-md">
              <button
                onClick={() => setSelectedSpecialty('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSpecialty === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Coaches
              </button>
              <button
                onClick={() => setSelectedSpecialty('adhd')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSpecialty === 'adhd'
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🧠 ADHD
              </button>
              <button
                onClick={() => setSelectedSpecialty('memory')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSpecialty === 'memory'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                💭 Memory
              </button>
              <button
                onClick={() => setSelectedSpecialty('stress')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSpecialty === 'stress'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🌿 Stress
              </button>
              <button
                onClick={() => setSelectedSpecialty('wellness')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSpecialty === 'wellness'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                ⚡ Wellness
              </button>
            </div>
          </div>

          {/* Coaching Types Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {coachingTypes.map((type) => (
              <div
                key={type.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{type.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                  <p className="text-base font-medium text-gray-700 mb-4">{type.price}</p>
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md transition-all font-medium">
                    Find {type.title.split(' ')[0]} Coaches
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* All Coaches Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedSpecialty === 'all' ? 'All Coaches' : `${selectedSpecialty.charAt(0).toUpperCase() + selectedSpecialty.slice(1)} Specialists`}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="p-6">
                    {/* Coach Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-3xl">
                        {coach.image}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                        <p className="text-sm text-gray-600">{coach.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700">{coach.rating}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{coach.sessions} sessions</span>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {coach.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${specialtyColors[specialty]}`}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 mb-4">{coach.bio}</p>

                    {/* Footer */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">${coach.price}</p>
                          <p className="text-xs text-gray-500">per session</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{coach.availability}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookCoach(coach)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Book Session
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Our Coaches */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Our Brain Wellness Coaches?</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Certified Experts</h4>
                <p className="text-sm text-white text-opacity-90">All coaches are certified in neurofeedback and brain training</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Personalized Care</h4>
                <p className="text-sm text-white text-opacity-90">Customized programs tailored to your unique needs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Evidence-Based</h4>
                <p className="text-sm text-white text-opacity-90">All methods backed by scientific research</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="font-semibold mb-2">Proven Results</h4>
                <p className="text-sm text-white text-opacity-90">Thousands of successful client transformations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LBWCoaching;