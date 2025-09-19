import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// Pages
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import AssessmentPage from './pages/AssessmentPage'
import CoachingPage from './pages/CoachingPage'
import ProgressPage from './pages/ProgressPage'
import QEEGPage from './pages/QEEGPage'
import ContentPage from './pages/ContentPage'
import ProfilePage from './pages/ProfilePage'

// Providers
import { BrainWellnessProvider } from './hooks/useBrainWellness'

// Components
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'

// Create React Query client optimized for brain wellness data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (gcTime replaces cacheTime in newer versions)
    },
    mutations: {
      retry: 1,
    },
  },
})

// Animated Routes component
function AnimatedRoutes() {
  const location = useLocation()
  
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 50,
      scale: 0.98
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      x: -50,
      scale: 0.98
    }
  }

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.4
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Onboarding flow */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding/:step" element={<OnboardingPage />} />
          
          {/* Main app routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assessments" element={<AssessmentPage />} />
          <Route path="/assessments/:type" element={<AssessmentPage />} />
          <Route path="/coaching" element={<CoachingPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/qeeg" element={<QEEGPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Catch all - redirect to landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrainWellnessProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Header />
            </motion.div>
            
            <main className="flex-1 relative overflow-hidden">
              <AnimatedRoutes />
            </main>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Footer />
            </motion.div>
            
            {/* Global toast notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                },
              }}
              className="toaster group"
              closeButton
            />
          </div>
        </Router>
      </BrainWellnessProvider>
    </QueryClientProvider>
  )
}

export default App