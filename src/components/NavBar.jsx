import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Factory, Menu, X } from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePersonalSignup = () => {
    navigate('/register', {
      state: {
        userType: 'personal',
        fromLanding: true
      }
    });
  };

  const handleClinicSignup = () => {
    navigate('/register', {
      state: {
        userType: 'clinic',
        fromLanding: true
      }
    });
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-5 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center">
          {/* Center Navigation Pill with Logo, Links and Buttons ALL INSIDE */}
          <div className="hidden lg:flex items-center bg-white backdrop-blur-md rounded-full shadow-md px-8 py-4 gap-6">
            {/* Logo INSIDE Pill */}
            <div className="flex items-center pr-3 border-r border-gray-200 cursor-pointer" onClick={() => navigate('/')}>
              <Factory className="h-6 w-6 text-[#1e3a5f]" />
              <span className="ml-1.5 text-lg font-bold text-gray-900">
                AIMS
              </span>
            </div>

            {/* Navigation Links */}
            <a href="/#features" className="text-gray-700 hover:text-gray-900 text-sm font-normal transition-colors whitespace-nowrap">
              Features
            </a>
            <a href="/#how-it-works" className="text-gray-700 hover:text-gray-900 text-sm font-normal transition-colors whitespace-nowrap">
              How it works
            </a>
            <a href="/#pricing" className="text-gray-700 hover:text-gray-900 text-sm font-normal transition-colors whitespace-nowrap">
              Pricing
            </a>

            {/* Action Buttons Inside Same Pill */}
            <button
              onClick={handlePersonalSignup}
              className="bg-[#1e3a5f] hover:bg-[#152d4a] text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleClinicSignup}
              className="bg-gray-900 hover:bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
            >
              Request Demo
            </button>
          </div>

          {/* Mobile - Logo and Menu Button */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Factory className="h-6 w-6 text-[#1e3a5f]" />
              <span className="ml-1.5 text-lg font-bold text-gray-900">
                AIMS
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-800 transition-transform duration-300"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
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
                <Factory className="h-8 w-8 text-[#1e3a5f]" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  AIMS
                </span>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-6 mb-12">
                <a href="/#features" className="text-gray-900 hover:text-gray-600 text-lg font-normal transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="/#how-it-works" className="text-gray-900 hover:text-gray-600 text-lg font-normal transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  How it works
                </a>
                <a href="/#pricing" className="text-gray-900 hover:text-gray-600 text-lg font-normal transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handlePersonalSignup}
                  className="bg-[#1e3a5f] hover:bg-[#152d4a] text-white px-6 py-3 rounded-full text-base font-medium transition-all w-full"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={handleClinicSignup}
                  className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full text-base font-medium transition-all w-full"
                >
                  Request Demo
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;
