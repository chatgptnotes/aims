import QEEGUpload from '../components/features/QEEGUpload'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function QEEGPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brain-50 via-white to-wellness-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">qEEG Brain Mapping</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload and analyze your quantitative EEG brain maps to get personalized insights 
              and neurofeedback training recommendations.
            </p>
          </div>

          {/* What is qEEG Section */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What is qEEG Brain Mapping?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-4">
                  Quantitative EEG (qEEG) is a sophisticated analysis of your brain's electrical activity. 
                  It provides a detailed "brain map" that shows how different areas of your brain are functioning.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-brain-600 mr-2">•</span>
                    <span>Identifies areas of over/under activity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brain-600 mr-2">•</span>
                    <span>Reveals connectivity patterns between brain regions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brain-600 mr-2">•</span>
                    <span>Guides personalized neurofeedback protocols</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brain-600 mr-2">•</span>
                    <span>Tracks progress over time</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-brain-100 to-wellness-100 rounded-lg p-6 text-center">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Brain Map</h3>
                <p className="text-sm text-gray-600">
                  Get a detailed analysis of your brain's unique patterns and receive 
                  personalized recommendations for optimization.
                </p>
              </div>
            </div>
          </Card>

          {/* Upload Component */}
          <QEEGUpload />

          {/* Benefits Section */}
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Benefits of qEEG Analysis</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-brain-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-brain-600 text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Precision Targeting</h3>
                <p className="text-gray-600 text-sm">
                  Identify specific brain areas that need attention for ADHD, anxiety, 
                  depression, or cognitive enhancement.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-wellness-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-wellness-600 text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600 text-sm">
                  Monitor changes in brain function over time and see how your 
                  training protocols are working.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-calm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-calm-600 text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Protocols</h3>
                <p className="text-gray-600 text-sm">
                  Receive customized neurofeedback and brain training protocols 
                  based on your unique brain patterns.
                </p>
              </div>
            </div>
          </Card>

          {/* Getting Started */}
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 border-2 border-dashed border-brain-200 rounded-lg">
                <div className="text-2xl mb-2">1️⃣</div>
                <div className="font-medium text-gray-900 mb-1">Get qEEG</div>
                <p className="text-xs text-gray-600">Schedule with a certified provider</p>
              </div>
              
              <div className="text-center p-4 border-2 border-dashed border-brain-200 rounded-lg">
                <div className="text-2xl mb-2">2️⃣</div>
                <div className="font-medium text-gray-900 mb-1">Upload Files</div>
                <p className="text-xs text-gray-600">Upload your .edf brain map files</p>
              </div>
              
              <div className="text-center p-4 border-2 border-dashed border-brain-200 rounded-lg">
                <div className="text-2xl mb-2">3️⃣</div>
                <div className="font-medium text-gray-900 mb-1">AI Analysis</div>
                <p className="text-xs text-gray-600">Our system analyzes your brain patterns</p>
              </div>
              
              <div className="text-center p-4 border-2 border-dashed border-brain-200 rounded-lg">
                <div className="text-2xl mb-2">4️⃣</div>
                <div className="font-medium text-gray-900 mb-1">Get Protocol</div>
                <p className="text-xs text-gray-600">Receive personalized recommendations</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                Don't have a qEEG yet? Our certified partners can help you get one.
              </p>
              <Button variant="brain" className="mr-3">
                Find qEEG Provider
              </Button>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

