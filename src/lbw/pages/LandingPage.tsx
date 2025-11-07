import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import InteractiveBrainHero from '../components/features/InteractiveBrainHero'

export default function LandingPage() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  return (
    <div>
      {/* Interactive Brain Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <InteractiveBrainHero />
      </motion.div>
      
      {/* Video Section */}
      <motion.div 
        className="bg-gray-900 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold text-white mb-4"
            >
              Discover Your Brain's Potential
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-gray-100 dark:text-gray-200 mb-8 max-w-2xl mx-auto font-medium text-lg leading-7"
            >
              Watch how our science-backed approach transforms brain wellness through personalized assessments, targeted training, and expert coaching.
            </motion.p>
            
            {/* Video Player Container */}
            <motion.div 
              variants={scaleIn}
              className="relative w-full max-w-3xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-video">
                <video 
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video failed to load:', e);
                    // Hide video and show placeholder if video fails to load
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                  onLoadStart={() => console.log('Video loading started')}
                  onCanPlay={() => console.log('Video can start playing')}
                  onLoadedData={() => console.log('Video data loaded')}
                >
                  <source src="/videos/brain-wellness-intro.mp4" type="video/mp4" />
                  <source src="/videos/brain-wellness-intro.webm" type="video/webm" />
                  <p className="text-white p-8">
                    Your browser doesn't support video playback. 
                    <a href="/videos/brain-wellness-intro.mp4" className="text-brain-400 underline">
                      Download the video instead
                    </a>
                  </p>
                </video>
                
                {/* Video Placeholder (shown when video fails to load) */}
                <div className="hidden w-full h-full bg-gradient-to-br from-brain-600 to-wellness-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-xl font-semibold mb-2">Brain Wellness Introduction Video</h3>
                    <p className="text-brain-100 text-sm">
                      Video coming soon - Upload your video to /public/videos/
                    </p>
                    <div className="mt-6 inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                      <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>Play Video</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Video Description */}
            <motion.div 
              variants={fadeInUp}
              className="mt-8 grid md:grid-cols-3 gap-6 text-left"
            >
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-brain-400 text-2xl mb-3">🎯</div>
                <h3 className="text-white font-semibold mb-2">Personalized Assessment</h3>
                <p className="text-gray-100 dark:text-gray-200 text-base font-medium leading-6">
                  Comprehensive evaluation of your cognitive strengths and areas for improvement.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-wellness-400 text-2xl mb-3">🧠</div>
                <h3 className="text-white font-semibold mb-2">Targeted Training</h3>
                <p className="text-gray-100 dark:text-gray-200 text-base font-medium leading-6">
                  Evidence-based exercises designed specifically for your brain wellness goals.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-calm-400 text-2xl mb-3">👥</div>
                <h3 className="text-white font-semibold mb-2">Expert Coaching</h3>
                <p className="text-gray-100 dark:text-gray-200 text-base font-medium leading-6">
                  Professional guidance from certified brain wellness and nervous system specialists.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Main Content Section */}
      <motion.div 
        className="bg-gradient-to-br from-brain-50 via-white to-wellness-50 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-12">
              <motion.h1 
                className="text-5xl font-bold bg-gradient-to-r from-brain-600 to-wellness-600 bg-clip-text text-transparent mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Limitless Brain Wellness
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-8 font-medium leading-7"
              >
                Science-backed, personalized brain wellness programs designed to enhance focus, memory, mood, and stress management.
              </motion.p>
              
              {/* Hero CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/assessments"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brain-600 to-wellness-600 text-white font-semibold rounded-lg hover:from-brain-700 hover:to-wellness-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Take Free Assessment
                    <motion.span 
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center px-8 py-4 bg-white text-brain-600 font-semibold rounded-lg border-2 border-brain-600 hover:bg-brain-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/about"
                    className="inline-flex items-center px-6 py-3 text-brain-600 font-medium hover:text-brain-700 transition-colors duration-200"
                  >
                    Learn More
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

          {/* Key Features */}
          <motion.div 
            variants={fadeInUp}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {[
              {
                icon: "🧠",
                bgColor: "bg-brain-100",
                textColor: "text-brain-600",
                borderColor: "border-brain-100",
                title: "ADHD Support",
                description: "Comprehensive tools and strategies for attention enhancement and executive function improvement."
              },
              {
                icon: "💡",
                bgColor: "bg-wellness-100",
                textColor: "text-wellness-600",
                borderColor: "border-wellness-100",
                title: "Memory Enhancement",
                description: "Evidence-based memory training and cognitive exercises to boost recall and retention."
              },
              {
                icon: "🧘‍♀️",
                bgColor: "bg-calm-100",
                textColor: "text-calm-600",
                borderColor: "border-calm-100",
                title: "Stress & Mood",
                description: "Personalized stress management and mood regulation techniques for emotional balance."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`p-6 rounded-lg bg-white shadow-sm border ${feature.borderColor} hover:shadow-lg transition-shadow duration-300`}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <motion.div 
                  className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 mx-auto`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`${feature.textColor} text-xl`}>{feature.icon}</span>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-200 mb-4 font-medium text-base leading-6">{feature.description}</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={index === 0 ? "/assessments/adhd" : index === 1 ? "/assessments/memory" : "/assessments/stress"}
                    className={`inline-flex items-center px-4 py-2 ${feature.textColor} font-medium text-sm rounded-lg border hover:bg-opacity-10 hover:${feature.bgColor} transition-all duration-200`}
                  >
                    Explore
                    <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Brain Fitness Score Preview */}
          <motion.div 
            variants={scaleIn}
            className="bg-white rounded-xl shadow-lg p-8 mb-12 hover:shadow-xl transition-shadow duration-300"
          >
            <motion.h2 
              className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Track Your Brain Fitness
            </motion.h2>
            <motion.p 
              className="text-gray-700 dark:text-gray-200 mb-6 font-medium text-base leading-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Get a personalized Brain Fitness Score based on comprehensive assessments and daily tracking.
            </motion.p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { score: 85, label: "Focus", color: "text-brain-600" },
                { score: 78, label: "Memory", color: "text-wellness-600" },
                { score: 92, label: "Mood", color: "text-calm-600" },
                { score: 74, label: "Stress", color: "text-brain-500" }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className={`text-2xl font-bold ${metric.color}`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {metric.score}
                  </motion.div>
                  <div className="text-base text-gray-700 dark:text-gray-200 font-medium">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/onboarding"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brain-600 to-wellness-600 text-white font-semibold rounded-lg hover:from-brain-700 hover:to-wellness-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Your Brain Wellness Journey
                <motion.span 
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
            <motion.p 
              className="text-base text-gray-700 dark:text-gray-200 mt-4 font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Free assessment • Personalized insights • Science-backed recommendations
            </motion.p>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/about"
                className="text-brain-600 hover:text-brain-700 text-sm font-medium underline"
              >
                Learn about our research and founder Dr. Sweta Adatia →
              </Link>
            </motion.div>
          </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}