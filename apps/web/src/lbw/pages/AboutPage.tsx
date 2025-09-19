import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { founders, companyInfo, researchHighlights, collaborations } from '../data/founders'

export default function AboutPage() {
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

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-brain-600 to-wellness-600 bg-clip-text text-transparent mb-6">
            About Limitless Brain Wellness
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto font-medium leading-8">
            {companyInfo.mission}
          </p>
        </motion.div>

        {/* Company Overview */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="p-8 mb-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Global Presence</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <div className="font-medium">Global Locations</div>
                      <div className="text-base text-gray-800 dark:text-gray-100 font-semibold">
                        {companyInfo.locations.join(' • ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="font-medium">Founded</div>
                      <div className="text-base text-gray-800 dark:text-gray-100 font-semibold">{companyInfo.founded}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Impact Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-brain-50 rounded-lg">
                    <div className="text-2xl font-bold text-brain-600">{companyInfo.keyMetrics.brainsMapped.toLocaleString()}+</div>
                    <div className="text-sm text-gray-600">Brains Mapped</div>
                  </div>
                  <div className="text-center p-4 bg-wellness-50 rounded-lg">
                    <div className="text-2xl font-bold text-wellness-600">{companyInfo.keyMetrics.livesImpacted.toLocaleString()}+</div>
                    <div className="text-sm text-gray-600">Lives Impacted</div>
                  </div>
                  <div className="text-center p-4 bg-calm-50 rounded-lg">
                    <div className="text-2xl font-bold text-calm-600">{companyInfo.keyMetrics.studentsHelped.toLocaleString()}+</div>
                    <div className="text-sm text-gray-600">Students Helped</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{companyInfo.keyMetrics.seminarsDelivered}+</div>
                    <div className="text-sm text-gray-600">Seminars Delivered</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Founder Section */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-semibold text-center text-gray-900 mb-8"
          >
            Meet Our Founder
          </motion.h2>

          {founders.map((founder) => (
            <motion.div key={founder.id} variants={fadeInUp}>
              <Card className="p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Founder Image and Basic Info */}
                  <div className="text-center">
                    <motion.div 
                      className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img 
                        src={founder.imageUrl}
                        alt={founder.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-initials') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        className="fallback-initials w-full h-full bg-gradient-to-br from-brain-500 to-wellness-500 items-center justify-center absolute top-0 left-0"
                        style={{ display: 'none' }}
                      >
                        <div className="w-44 h-44 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-6xl text-white font-bold">
                            {founder.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{founder.name}</h3>
                    <p className="text-brain-600 font-medium mb-2">{founder.title}</p>
                    <p className="text-gray-700 dark:text-gray-200 text-base mb-4 font-medium leading-6">{founder.role}</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {founder.languages.slice(0, 4).map((lang) => (
                        <span key={lang} className="px-2 py-1 bg-brain-100 text-brain-700 text-sm rounded-full font-medium">
                          {lang}
                        </span>
                      ))}
                      {founder.languages.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:text-gray-100 text-sm rounded-full font-medium">
                          +{founder.languages.length - 4} more
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-brain-600">{founder.yearsExperience}+</div>
                      <div className="text-base text-gray-800 dark:text-gray-100 font-semibold">Years Experience</div>
                    </div>
                  </div>

                  {/* Bio and Education */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Biography</h4>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base font-medium">{founder.bio}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Education & Qualifications</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {founder.education.slice(0, 6).map((edu, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="text-brain-600 mt-1">•</span>
                            <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{edu}</span>
                          </div>
                        ))}
                      </div>
                      {founder.education.length > 6 && (
                        <p className="text-base text-gray-700 dark:text-gray-200 font-medium mt-2 leading-6">+ {founder.education.length - 6} additional qualifications</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h4>
                        <div className="space-y-2">
                          {founder.achievements.slice(0, 5).map((achievement, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <span className="text-wellness-600 mt-1">✓</span>
                              <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {founder.specialties.slice(0, 8).map((specialty) => (
                            <span key={specialty} className="px-3 py-1 bg-wellness-100 text-wellness-700 text-sm rounded-full font-medium">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Research Highlights */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-semibold text-center text-gray-900 mb-8"
          >
            Research Highlights
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {researchHighlights.map((highlight, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{highlight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-200 mb-4 text-base font-medium leading-6">{highlight.description}</p>
                    <div className="bg-gradient-to-r from-brain-50 to-wellness-50 p-3 rounded-lg">
                      <p className="text-base font-semibold text-gray-800 dark:text-gray-100 leading-6">{highlight.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Services & Methodology */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">🔬</span>
                    <span>Our Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {companyInfo.services.map((service, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-brain-600 mt-1">•</span>
                        <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">🧠</span>
                    <span>Our Methodology</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {companyInfo.methodology.map((method, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-wellness-600 mt-1">•</span>
                        <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{method}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Collaborations */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-semibold text-center text-gray-900 mb-8"
          >
            Global Collaborations
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((collab, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-brain-500 to-wellness-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🤝</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{collab.organization}</h3>
                  <p className="text-base text-brain-600 mb-2 font-medium">{collab.type}</p>
                  <p className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">{collab.focus}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center bg-gradient-to-r from-brain-600 to-wellness-600 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Unlock Your Brain's Potential?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Join thousands of individuals who have transformed their lives through our science-backed brain wellness programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="bg-white text-brain-600 hover:bg-gray-50">
              Learn More About Our Research
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white">
              Start Your Brain Wellness Journey
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
