import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const LBWProjectUpdates = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Measure your brain activity",
      description: "Electrical signals generated in the brain reflect your current mental state. Neurosense uses proprietary technology to study and measure your brain activity",
      image: "/neuro1.mp4",
      isVideo: true
    },
    {
      number: 2,
      title: "Understand your brain",
      description: "NeuroSense scans, decodes, and provides you with in depth insights into your brain. Your Brain Map, explained.",
      image: "/neuro2.mp4",
      isVideo: true
    },
    {
      number: 3,
      title: "Get a personalized brain training plan",
      description: "We create a personalized, holistic frequency modulation plan based on your brain activity, brain type, and goals, helping your brain reach its ultimate capacity.",
      image: "/neuro3.mp4",
      isVideo: true
    },
    {
      number: 4,
      title: "Practice for best results",
      description: "We turn your data into clear next steps. You implement, we adapt. Personalized insights, targeted changes, measurable gains. Get the exact changes in your brain, stay consistent, and watch progress stack tracked with metrics in the NeuroSense webapp.",
      image: "/neuro4.mp4",
      isVideo: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Main Content */}
      <div className="pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4">
            A Step-By-Step Guide to Doing
          </h1>
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900">
            Neurofeedback With <span className="text-[#00897B]">NeuroSense</span>
          </h1>
        </div>

        {/* Steps Section */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="bg-gray-50 rounded-2xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Left Content */}
                <div className="flex-1">
                  <h2 className="text-3xl font-normal text-gray-900 mb-4">
                    {step.number}. {step.title}
                  </h2>
                  <p className="text-lg text-[#00897B] mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  {step.number === 1 && (
                    <button
                      onClick={() => navigate('/register')}
                      className="bg-[#00897B] hover:bg-[#00796B] text-white px-8 py-3 rounded-full text-base font-medium transition-all"
                    >
                      Find a clinic near you
                    </button>
                  )}
                </div>

                {/* Right Image/Video */}
                <div className="w-full md:w-[500px] flex justify-center">
                  <div className={`rounded-lg p-6 w-full h-80 flex items-center justify-center ${step.isVideo ? '' : 'bg-black'}`}>
                    {step.isVideo ? (
                      <video
                        src={step.image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#00897B] to-[#00796B] rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-normal mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of people who have improved their mental wellness with NeuroSense
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-[#00897B] hover:bg-gray-100 px-8 py-3 rounded-full text-base font-medium transition-all"
          >
            Get Started Today
          </button>
        </div>

      </div>
      </div>

      <Footer />
    </div>
  );
};

export default LBWProjectUpdates;
