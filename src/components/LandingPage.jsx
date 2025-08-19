import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Shield, Users, BarChart3, Sparkles, CheckCircle2, Star } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Brain className="w-8 h-8 mr-3" />
            <span>Neuro360</span>
          </div>
          <div className="nav-links gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 hidden sm:inline-block">Features</a>
            <a href="#trust" className="text-gray-600 hover:text-gray-900 hidden sm:inline-block">Trust</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 hidden sm:inline-block">Contact</a>
            <Link to="/login" className="login-btn">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-container">
        {/* Left Side - Content */}
        <div className="hero-content">
          <div className="content-overlay">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white/90 mb-5 backdrop-blur">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide">AI for Neurology</span>
            </div>
            <h1 className="hero-title bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">Smarter neurology. Simpler workflows.</h1>
            <p className="hero-subtitle opacity-100">Neuro360</p>
            <p className="hero-description">An end‑to‑end platform for neurological report analysis, patient management, and clinical insights — designed to be secure, reliable, and delightfully simple.</p>

            <div className="hero-buttons">
              <Link to="/login" className="btn-primary">Get Started</Link>
              <Link to="/register" className="btn-secondary">Create Account</Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/90">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <p className="text-sm">Uptime</p>
                  <p className="text-lg font-semibold">99.99%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-sm">Clinics</p>
                  <p className="text-lg font-semibold">120+ live</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" />
                <div>
                  <p className="text-sm">Satisfaction</p>
                  <p className="text-lg font-semibold">4.9/5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hero-visual">
          <img
            src="/hero-brain.png"
            alt="AI for Neurology illustration"
            className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-200"
          />
        </div>
      </div>

      {/* Logos / Trust */}
      <section id="trust" className="bg-white">
        <div className="container py-10">
          <p className="text-center text-sm text-gray-500">Trusted by teams at</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 items-center opacity-80">
            <div className="text-center text-gray-500 font-semibold">NeuroClinic</div>
            <div className="text-center text-gray-500 font-semibold">SynapseCare</div>
            <div className="text-center text-gray-500 font-semibold">BrainLabs</div>
            <div className="text-center text-gray-500 font-semibold">MindWorks</div>
            <div className="text-center text-gray-500 font-semibold">Axon Health</div>
            <div className="text-center text-gray-500 font-semibold">CortexRx</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Everything you need to run modern neurology</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Brain className="w-10 h-10 mx-auto text-blue-600" />
              </div>
              <h3>AI‑Powered Analysis</h3>
              <p>State‑of‑the‑art models deliver consistent, explainable neurological insights from reports and imaging.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield className="w-10 h-10 mx-auto text-blue-600" />
              </div>
              <h3>Security & Compliance</h3>
              <p>Best‑practice encryption, audit trails, and role‑based access built for clinical privacy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users className="w-10 h-10 mx-auto text-blue-600" />
              </div>
              <h3>Multi‑Clinic Ready</h3>
              <p>Seamlessly manage teams, clinics, and patients with granular permissions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 className="w-10 h-10 mx-auto text-blue-600" />
              </div>
              <h3>Advanced Analytics</h3>
              <p>Operational and clinical dashboards to monitor outcomes and optimize care.</p>
            </div>
          </div>

          <div className="cta-section">
            <Link to="/login" className="btn-primary-large">Start Using Neuro360</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Brain className="w-6 h-6 mr-2" />
              <span>Neuro360</span>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Neuro360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
