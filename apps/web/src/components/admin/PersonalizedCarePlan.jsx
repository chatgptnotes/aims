import React, { useState, useEffect } from 'react';
import {
  Heart,
  Brain,
  Activity,
  Target,
  Calendar,
  User,
  FileText,
  Download,
  Upload,
  Edit3,
  Save,
  Plus,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  Clock,
  Shield,
  Award
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';

const PersonalizedCarePlan = ({ patientId, clinicId }) => {
  const [carePlan, setCarePlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (patientId) {
      loadPatientData();
      loadCarePlan();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      // Mock patient data - replace with actual API call
      const mockPatient = {
        id: patientId,
        name: 'John Smith',
        age: 34,
        gender: 'Male',
        diagnosis: 'ADHD with Anxiety',
        startDate: '2025-08-01',
        clinicId: clinicId
      };
      setPatient(mockPatient);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const loadCarePlan = async () => {
    try {
      setLoading(true);
      // Mock care plan data - replace with actual API call
      const mockCarePlan = generateMockCarePlan();
      setCarePlan(mockCarePlan);
      reset(mockCarePlan);
    } catch (error) {
      console.error('Error loading care plan:', error);
      toast.error('Failed to load care plan');
    } finally {
      setLoading(false);
    }
  };

  const generateMockCarePlan = () => {
    return {
      id: 'cp-001',
      patientId: patientId,
      createdAt: '2025-09-01',
      updatedAt: '2025-09-15',
      status: 'active',

      // Primary Goals
      primaryGoals: [
        {
          id: 'goal-1',
          title: 'Improve Focus & Attention',
          description: 'Enhance sustained attention span from 15 to 45 minutes',
          targetDate: '2025-12-01',
          progress: 65,
          status: 'in_progress',
          metrics: ['Daily focus exercises', 'Weekly attention assessments']
        },
        {
          id: 'goal-2',
          title: 'Reduce Anxiety Levels',
          description: 'Lower GAD-7 score from 14 to below 8',
          targetDate: '2025-11-15',
          progress: 45,
          status: 'in_progress',
          metrics: ['Bi-weekly GAD-7 assessments', 'Daily mood tracking']
        }
      ],

      // Neurofeedback Protocol
      neurofeedbackProtocol: {
        frequency: '2x per week',
        duration: '30 minutes',
        protocols: [
          {
            name: 'SMR Enhancement',
            target: '12-15 Hz at C3/C4',
            purpose: 'Improve focus and reduce hyperactivity'
          },
          {
            name: 'Alpha Training',
            target: '8-12 Hz at Pz',
            purpose: 'Promote relaxation and reduce anxiety'
          }
        ],
        nextSession: '2025-09-20',
        completedSessions: 12,
        totalSessions: 24
      },

      // Cognitive Exercises
      cognitiveExercises: [
        {
          name: 'Working Memory Training',
          frequency: 'Daily',
          duration: '15 minutes',
          tools: 'BrainHQ, Lumosity',
          progress: 'Consistent improvement noted'
        },
        {
          name: 'Mindfulness Meditation',
          frequency: '2x daily',
          duration: '10 minutes',
          tools: 'Headspace app',
          progress: 'Good adherence, reduced anxiety'
        }
      ],

      // Lifestyle Modifications
      lifestyleRecommendations: [
        {
          category: 'Sleep Hygiene',
          recommendations: [
            'Maintain consistent sleep schedule (10 PM - 6 AM)',
            'No screens 1 hour before bed',
            'Use blue light filters after sunset'
          ],
          compliance: 'Good'
        },
        {
          category: 'Physical Activity',
          recommendations: [
            '30 minutes moderate exercise daily',
            'Morning yoga or stretching routine',
            'Weekend outdoor activities'
          ],
          compliance: 'Moderate'
        },
        {
          category: 'Nutrition',
          recommendations: [
            'Omega-3 supplementation (1000mg daily)',
            'Reduce caffeine intake to 1 cup/day',
            'Mediterranean diet focus'
          ],
          compliance: 'Good'
        }
      ],

      // Progress Tracking
      milestones: [
        {
          date: '2025-09-01',
          achievement: 'Started neurofeedback training',
          notes: 'Initial qEEG baseline established'
        },
        {
          date: '2025-09-08',
          achievement: '25% improvement in attention span',
          notes: 'Measured during cognitive assessment'
        },
        {
          date: '2025-09-15',
          achievement: 'GAD-7 score reduced from 14 to 11',
          notes: 'Patient reports feeling calmer'
        }
      ],

      // Clinical Notes
      clinicalNotes: 'Patient showing steady improvement. Excellent compliance with neurofeedback sessions. Consider adjusting protocol to include more SMR training based on recent qEEG results.',

      // Next Review Date
      nextReviewDate: '2025-10-01'
    };
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Save care plan to database
      console.log('Saving care plan:', data);
      toast.success('Care plan updated successfully');
      setIsEditing(false);
      loadCarePlan();
    } catch (error) {
      console.error('Error saving care plan:', error);
      toast.error('Failed to save care plan');
    } finally {
      setLoading(false);
    }
  };

  const exportCarePlan = () => {
    // Generate PDF or export functionality
    toast.success('Care plan exported successfully');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Patient Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Patient Overview
            </h3>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {patient?.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Age:</span> {patient?.age} years
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Diagnosis:</span> {patient?.diagnosis}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Treatment Start:</span> {new Date(patient?.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Activity className="w-3 h-3 mr-1" />
              Active Plan
            </span>
          </div>
        </div>
      </div>

      {/* Primary Goals */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Primary Treatment Goals
        </h3>
        <div className="space-y-4">
          {carePlan?.primaryGoals.map(goal => (
            <div key={goal.id} className="border-l-4 border-purple-500 pl-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{goal.progress}%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Neurofeedback Sessions</p>
              <p className="text-xl font-bold text-blue-600">
                {carePlan?.neurofeedbackProtocol.completedSessions}/{carePlan?.neurofeedbackProtocol.totalSessions}
              </p>
            </div>
            <Brain className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <p className="text-xl font-bold text-green-600">55%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next Review</p>
              <p className="text-xl font-bold text-purple-600">
                {carePlan && new Date(carePlan.nextReviewDate).toLocaleDateString()}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNeurofeedback = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Brain className="w-5 h-5 mr-2 text-blue-600" />
        Neurofeedback Protocol
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Frequency</p>
            <p className="font-medium">{carePlan?.neurofeedbackProtocol.frequency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{carePlan?.neurofeedbackProtocol.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Session</p>
            <p className="font-medium">
              {new Date(carePlan?.neurofeedbackProtocol.nextSession).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Progress</p>
            <p className="font-medium">
              {carePlan?.neurofeedbackProtocol.completedSessions}/{carePlan?.neurofeedbackProtocol.totalSessions} sessions
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Training Protocols</h4>
          <div className="space-y-3">
            {carePlan?.neurofeedbackProtocol.protocols.map((protocol, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{protocol.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">Target: {protocol.target}</p>
                    <p className="text-sm text-gray-500 mt-1">{protocol.purpose}</p>
                  </div>
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLifestyle = () => (
    <div className="space-y-6">
      {/* Cognitive Exercises */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          Cognitive Exercises
        </h3>
        <div className="space-y-3">
          {carePlan?.cognitiveExercises.map((exercise, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">{exercise.name}</h4>
              <div className="mt-1 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Frequency:</span> {exercise.frequency}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {exercise.duration}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Tools:</span> {exercise.tools}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Progress: {exercise.progress}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lifestyle Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <Heart className="w-5 h-5 mr-2 text-red-600" />
          Lifestyle Modifications
        </h3>
        <div className="space-y-4">
          {carePlan?.lifestyleRecommendations.map((category, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{category.category}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  category.compliance === 'Good'
                    ? 'bg-green-100 text-green-800'
                    : category.compliance === 'Moderate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.compliance} Compliance
                </span>
              </div>
              <ul className="space-y-1">
                {category.recommendations.map((rec, recIndex) => (
                  <li key={recIndex} className="flex items-start text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
        Progress & Milestones
      </h3>

      <div className="space-y-4">
        {carePlan?.milestones.map((milestone, index) => (
          <div key={index} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              {index < carePlan.milestones.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-300 mt-2" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{milestone.achievement}</p>
                  <p className="text-sm text-gray-600 mt-1">{milestone.notes}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(milestone.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Notes */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-2">Clinical Notes</h4>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          {carePlan?.clinicalNotes}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!carePlan && !showCreateModal) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Care Plan Found
        </h3>
        <p className="text-gray-600 mb-4">
          Create a personalized care plan for this patient
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Care Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Shield className="mr-3" />
              Personalized Care Plan
            </h2>
            <p className="mt-2 text-indigo-100">
              Comprehensive treatment strategy and progress tracking
            </p>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Plan
                </button>
                <button
                  onClick={exportCarePlan}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-400 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubmit(onSubmit)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    reset(carePlan);
                  }}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-400 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'neurofeedback', label: 'Neurofeedback', icon: Brain },
            { id: 'lifestyle', label: 'Lifestyle & Exercises', icon: Heart },
            { id: 'progress', label: 'Progress', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'neurofeedback' && renderNeurofeedback()}
        {activeSection === 'lifestyle' && renderLifestyle()}
        {activeSection === 'progress' && renderProgress()}
      </div>
    </div>
  );
};

export default PersonalizedCarePlan;