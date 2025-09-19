import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ShieldCheck, Users, Truck, ArrowDown } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const handlePersonalSignup = () => {
    setSelectedType('personal');
    setShowOptions(true);
  };

  const handleClinicSignup = () => {
    setSelectedType('clinic');
    setShowOptions(true);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = (userType = 'clinic') => {
    // Navigate to register page with state to pre-select user type
    navigate('/register', {
      state: {
        userType: userType,
        fromLanding: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Benefits Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-3">
            <div className="flex space-x-8 md:space-x-16 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4" />
                <span>30-day money back</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>+26,000 members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Free shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-lbl-navy" />
              <span className="ml-2 text-lg font-bold text-gray-900">NeuroSense360</span>
              <span className="ml-2 text-xs text-lbl-gold font-medium">by LBL</span>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="/lbw" className="text-purple-600 hover:text-purple-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 border-2 border-purple-600 hover:border-purple-700 bg-purple-50">
                🧠 LBW Portal
              </a>
              <a href="/lbw-updates" className="text-lbl-gold hover:text-yellow-600 font-bold text-sm px-3 py-2 rounded-lg hover:bg-yellow-50 transition-all duration-200 border-2 border-lbl-gold hover:border-yellow-600">
                🚀 Updates
              </a>
              <a href="/assessments" className="text-blue-600 hover:text-blue-700 font-bold text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 border-2 border-blue-600 hover:border-blue-700">
                📋 Assessments
              </a>
              <a href="/coaching" className="text-green-600 hover:text-green-700 font-bold text-sm px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-200 border-2 border-green-600 hover:border-green-700">
                👥 Coaching
              </a>
              <a href="#clinicians" className="text-gray-700 hover:text-gray-900 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                For clinicians
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                How it works
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen Background */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1931&q=80')`
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-8 leading-tight">
              Guided, personalized
              <br />
              <span className="font-normal">brain training.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 font-light max-w-2xl leading-relaxed">
              #1 at-home neurofeedback platform. Built for clinicians and consumers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handlePersonalSignup}
                className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                I want it for myself
              </button>
              <button
                onClick={handleClinicSignup}
                className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                I want it for my clinic
              </button>
            </div>

            {/* Options Modal when button is clicked */}
            {showOptions && (
              <div className="mt-6 p-6 bg-white/95 backdrop-blur-sm rounded-lg border border-white/20 max-w-md shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {selectedType === 'personal' ? "🎉 Personal Account" : "🏥 Clinic Account"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedType === 'personal'
                    ? "Get started with your personal neurofeedback journey"
                    : "Register your clinic for professional neurofeedback services"
                  }
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleRegister(selectedType === 'personal' ? 'patient' : 'clinic')}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create New Account
                  </button>
                  <button
                    onClick={handleLogin}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    I Already Have an Account
                  </button>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <ArrowDown className="h-6 w-6 text-white animate-bounce opacity-80" />
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="py-24 bg-gray-50 mx-4 rounded-2xl my-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-8">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mb-6">
                <span className="text-teal-600 font-medium text-lg">Step 1:</span>
                <h3 className="text-xl font-medium text-gray-800 mt-2">
                  Understand your brain's activity
                </h3>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <span className="text-teal-600 font-medium text-lg">Step 2:</span>
                <h3 className="text-xl font-medium text-gray-800 mt-2">
                  Connect with your Neuro Coach
                </h3>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <span className="text-teal-600 font-medium text-lg">Step 3:</span>
                <h3 className="text-xl font-medium text-gray-800 mt-2">
                  Train your brain
                </h3>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <span className="text-teal-600 font-medium text-lg">Step 4:</span>
                <h3 className="text-xl font-medium text-gray-800 mt-2">
                  Live a healthy, focused life
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional content sections can be added here */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light text-gray-900 mb-8">
            Transform your mental wellness
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the power of neurofeedback technology guided by professional therapists. 
            Our scientifically-backed approach helps you achieve lasting improvements in focus, 
            calm, and overall cognitive performance.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Brain className="h-8 w-8 text-lbl-gold" />
              <span className="ml-2 text-xl font-bold">NeuroSense360</span>
              <span className="ml-2 text-sm text-gray-400">by Limitless Brain Lab</span>
            </div>
            <div className="text-center text-gray-400">
              <p>&copy; 2024 Limitless Brain Lab. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
