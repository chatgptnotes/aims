import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ShieldCheck, Users, Truck, ArrowDown, Menu, X } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    setIsVisible(true);

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionsVisible((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

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
    <div className="w-full min-h-screen bg-white m-0 p-0">
      {/* Top Info Bar */}
      <div className="w-full bg-white border-b border-gray-200 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Free shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">30-day money back</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>+26,000 members</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Free shipping</span>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-gray-800" />
            <span className="ml-2 text-base sm:text-lg font-semibold text-gray-900">NeuroSense360</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/lbw" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
              For clinicians
            </a>
            <a href="/lbw-updates" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
              How it works
            </a>
            <a href="/assessments" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
              Reviews
            </a>
            <a href="/coaching" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
              Blog
            </a>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={handlePersonalSignup}
              className="bg-[#323956] hover:bg-[#323956] text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
            >
              Start
            </button>
            <button
              onClick={handleClinicSignup}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
            >
              For clinics
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-800 transition-transform duration-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300">
            <div className="p-6">
              {/* Logo */}
              <div className="flex items-center mb-12 mt-2">
                <Brain className="h-6 w-6 text-gray-800" />
                <span className="ml-2 text-lg font-semibold text-gray-900">NeuroSense360</span>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-6 mb-12">
                <a href="/lbw" className="text-gray-900 hover:text-gray-600 text-lg font-normal transition-colors">
                  LBW Portal
                </a>
                <a href="/lbw-updates" className="text-gray-900 hover:text-gray-600 text-lg font-normal transition-colors">
                  Updates
                </a>
                <a href="/assessments" className="text-gray-900 hover:text-gray-600 text-lg font-normal transition-colors">
                  Assessments
                </a>
                <a href="/coaching" className="text-gray-900 hover:text-gray-600 text-lg font-normal transition-colors">
                  Coaching
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handlePersonalSignup}
                  className="bg-[#323956] hover:bg-[#232D3C] text-white px-6 py-3 rounded-full text-base font-medium transition-all w-full"
                >
                  I want it for myself
                </button>
                <button
                  onClick={handleClinicSignup}
                  className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full text-base font-medium transition-all w-full"
                >
                  I want it for my clinic
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hero Section - Myndlift Style */}
      <section className="relative w-full bg-white pt-4 sm:pt-6 pb-6 sm:pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Hero Container with Rounded Corners */}
        <div className="max-w-[96%] sm:max-w-[95%] lg:max-w-[94%] mx-auto relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] md:rounded-[2.25rem] lg:rounded-[2.75rem]"
          style={{
            height: 'auto',
            minHeight: 'clamp(500px, 70vh, 750px)',
            maxHeight: '85vh'
          }}>
          {/* Video Background */}
          <video
            src="https://framerusercontent.com/assets/MTjurdJLyLHPoBRajkFnx4WnwkU.mp4"
            loop
            preload="auto"
            muted
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundColor: 'rgb(133, 119, 95)',
              objectFit: 'cover',
              objectPosition: '60% center'
            }}
            onError={(e) => {
              console.error('Video failed to load:', e);
              e.target.style.display = 'none';
            }}
          />

          {/* Gradient Overlay - darker on left, lighter on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/85 via-black/60 to-black/40 sm:from-black/80 sm:via-black/55 sm:to-transparent" style={{ pointerEvents: 'none' }} />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center sm:justify-start px-3 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10 sm:py-12 md:py-16">
            <div className="max-w-full sm:max-w-2xl md:max-w-3xl text-center sm:text-left w-full">
              {/* Main Heading */}
              <h1
                className={`text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white mb-5 sm:mb-6 leading-[1.15] sm:leading-tight transition-all duration-1000 px-2 sm:px-0 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: '200ms',
                  fontWeight: '400',
                  letterSpacing: '-0.01em'
                }}
              >
                Feel calmer and more focused with guided brain training
              </h1>

              {/* Subtitle */}
              <p
                className={`text-sm sm:text-base md:text-lg text-white/95 mb-7 sm:mb-8 font-normal leading-relaxed max-w-sm sm:max-w-xl mx-auto sm:mx-0 px-2 sm:px-0 transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                Personalized neurofeedback, trusted by thousands of clinics and 26,000+ members.
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start transition-all duration-1000 px-2 sm:px-0 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                <button
                  onClick={handlePersonalSignup}
                  className="bg-[#323956] hover:bg-[#2a3048] text-white px-6 sm:px-7 py-3.5 sm:py-3 rounded-full text-sm sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto shadow-lg hover:shadow-xl"
                >
                  I want it for myself
                </button>

                <button
                  onClick={handleClinicSignup}
                  className="bg-gray-900 hover:bg-black text-white px-6 sm:px-7 py-3.5 sm:py-3 rounded-full text-sm sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto shadow-lg hover:shadow-xl"
                >
                  I want it for my clinic
                </button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:flex">
            <div
              className="flex flex-col items-center gap-2"
              style={{
                animation: 'bounce-smooth 2s ease-in-out infinite'
              }}
            >
              <ArrowDown className="h-5 w-5 text-white/80" />
            </div>
          </div>
        </div>
      </section>

      {/* Options Modal - Fixed Position Overlay */}
      {showOptions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            onClick={() => setShowOptions(false)}
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          />

          {/* Modal Content */}
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] sm:w-auto"
            style={{
              animation: 'slideUp 0.4s ease-out'
            }}
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 text-center">
                {selectedType === 'personal' ? "Personal Account" : "Clinic Account"}
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base text-center">
                {selectedType === 'personal'
                  ? "Get started with your personal neurofeedback journey"
                  : "Register your clinic for professional neurofeedback services"
                }
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleRegister(selectedType === 'personal' ? 'patient' : 'clinic')}
                  className="bg-[#323956] hover:bg-[#2a3048] text-white px-6 py-3.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create New Account
                </button>
                <button
                  onClick={handleLogin}
                  className="bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  I Already Have an Account
                </button>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline mt-2 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-smooth {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {/* How It Works - 4 Steps */}
      <section
        ref={(el) => (sectionRefs.current.howItWorks = el)}
        data-section="howItWorks"
        className={`py-12 sm:py-16 md:py-20 bg-stone-50 mx-2 sm:mx-4 rounded-2xl sm:rounded-3xl my-6 sm:my-8 transition-all duration-1000 ${
          sectionsVisible.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block bg-teal-100 text-teal-700 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-semibold">1</div>
                <h3 className="text-lg font-normal text-gray-800">
                  Understand your brain's activity
                </h3>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block bg-teal-100 text-teal-700 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-semibold">2</div>
                <h3 className="text-lg font-normal text-gray-800">
                  Connect with your Neuro Coach
                </h3>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block bg-teal-100 text-teal-700 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-semibold">3</div>
                <h3 className="text-lg font-normal text-gray-800">
                  Train your brain
                </h3>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block bg-teal-100 text-teal-700 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-semibold">4</div>
                <h3 className="text-lg font-normal text-gray-800">
                  Live a healthy, focused life
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional content sections can be added here */}
      <section
        ref={(el) => (sectionRefs.current.wellness = el)}
        data-section="wellness"
        className={`py-12 sm:py-16 md:py-20 lg:py-24 bg-white transition-all duration-1000 ${
          sectionsVisible.wellness ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 sm:mb-6">
              {['Sharper', 'focus,', 'calmer', 'mind,'].map((word, index) => (
                <span
                  key={index}
                  className="inline-block mx-1.5 transition-all duration-500"
                  style={{
                    willChange: 'transform',
                    display: 'inline-block'
                  }}
                >
                  {word}
                </span>
              ))}
            </h2>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900">
              {['better', 'well-being'].map((word, index) => (
                <span
                  key={index}
                  className="inline-block mx-1.5 transition-all duration-500"
                  style={{
                    willChange: 'transform',
                    display: 'inline-block'
                  }}
                >
                  {word}
                </span>
              ))}
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed font-light px-4 sm:px-0">
            Experience the power of neurofeedback technology guided by professional therapists.
            Our scientifically-backed approach helps you achieve lasting improvements in focus,
            calm, and overall cognitive performance.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div className="flex flex-col sm:flex-row items-center mb-4 md:mb-0 gap-2 sm:gap-0">
              <div className="flex items-center">
                <Brain className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 text-[#323956]" />
                <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-light">NeuroSense360</span>
              </div>
              <span className="sm:ml-3 text-xs sm:text-sm text-gray-400 font-light">by Limitless Brain Lab</span>
            </div>
            <div className="text-center text-gray-400 font-light text-xs sm:text-sm">
              <p>&copy; 2024 Limitless Brain Lab. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
