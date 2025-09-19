import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../services/bookingService';
import progressTrackingService from '../../services/progressTrackingService';
import {
  User,
  FileText,
  Calendar,
  Brain,
  Download,
  Heart,
  Target,
  MapPin,
  Clock,
  TrendingUp,
  Star,
  Book,
  Video,
  Phone,
  Mail,
  ChevronRight,
  Plus,
  Activity,
  LogOut
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [appointments, setAppointments] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({});
  const [progressData, setProgressData] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  // Load real appointment data
  useEffect(() => {
    const loadPatientData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Load appointments
        const patientAppointments = await bookingService.getPatientAppointments(user.id);
        setAppointments(patientAppointments);

        // Load appointment statistics
        const stats = await bookingService.getAppointmentStats(user.id);
        setAppointmentStats(stats);

        // Load progress tracking data
        const progressHistory = await progressTrackingService.getPatientProgressHistory(user.id, '6months');
        setProgressData(progressHistory);

        // Load current status
        const status = await progressTrackingService.getCurrentProgressStatus(user.id);
        setCurrentStatus(status);

        console.log('✅ Patient data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [user?.id]);

  // Handle appointment booking
  const handleBookAppointment = async () => {
    try {
      // Simple booking - book next available follow-up slot
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      // Get available slots
      const availableSlots = await bookingService.getAvailableSlots(
        user?.clinic_id || 'default-clinic',
        dateStr,
        'follow-up'
      );

      if (availableSlots.length === 0) {
        alert('No available slots for tomorrow. Please try a different date.');
        return;
      }

      // Book the first available slot
      const firstSlot = availableSlots.find(slot => slot.available);
      if (!firstSlot) {
        alert('No available slots found. Please contact the clinic directly.');
        return;
      }

      const appointmentData = {
        patientId: user.id,
        clinicId: user?.clinic_id || 'default-clinic',
        appointmentType: 'follow-up',
        date: dateStr,
        time: firstSlot.time,
        requestedBy: user.id,
        notes: 'Requested via patient portal'
      };

      const newAppointment = await bookingService.bookAppointment(appointmentData);

      // Refresh appointments list
      const updatedAppointments = await bookingService.getPatientAppointments(user.id);
      setAppointments(updatedAppointments);

      alert(`Appointment booked successfully for ${dateStr} at ${firstSlot.display}!`);
      console.log('✅ Appointment booked:', newAppointment);

    } catch (error) {
      console.error('❌ Failed to book appointment:', error);
      alert(`Failed to book appointment: ${error.message}`);
    }
  };
  const [patientData, setPatientData] = useState({
    profile: {
      name: user?.name || 'John Doe',
      email: user?.email || 'patient@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      address: '123 Main Street, City, State 12345',
      emergencyContact: 'Jane Doe - +1 (555) 987-6543'
    },
    clinic: {
      name: 'NeuroSense Health Center',
      address: '456 Medical Plaza, Healthcare District',
      phone: '+1 (555) 246-8135',
      email: 'contact@neurosense.com',
      doctorName: 'Dr. Sarah Wilson'
    },
    reports: [
      {
        id: 1,
        type: 'NeuroSense QEEG Report',
        date: '2024-09-15',
        status: 'Available',
        summary: 'Comprehensive brain activity analysis showing improved focus patterns'
      },
      {
        id: 2,
        type: 'Progress Assessment',
        date: '2024-08-20',
        status: 'Available',
        summary: 'Quarterly progress review with recommendations'
      }
    ],
    carePlans: [
      {
        id: 1,
        title: 'Focus Enhancement Program',
        progress: 75,
        nextSession: '2024-09-25',
        goals: ['Improve attention span', 'Reduce mental fatigue', 'Enhance cognitive flexibility']
      }
    ],
    resources: [
      {
        id: 1,
        title: 'Mindfulness Meditation Guide',
        type: 'video',
        duration: '15 min',
        unlocked: true
      },
      {
        id: 2,
        title: 'Brain Training Exercises',
        type: 'interactive',
        duration: '20 min',
        unlocked: true
      },
      {
        id: 3,
        title: 'Cognitive Health Assessment',
        type: 'assessment',
        duration: '30 min',
        unlocked: false
      }
    ],
    // appointments now loaded dynamically from booking service
  });

  const tabs = [
    { id: 'profile', label: 'Profile & History', icon: User },
    { id: 'reports', label: 'Reports & Plans', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Book },
    { id: 'journey', label: 'Recurring Journey', icon: Calendar }
  ];

  const ProfileSection = () => (
    <div className="space-y-6">
      {/* Personal Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{patientData.profile.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{patientData.profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{patientData.profile.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{patientData.profile.dateOfBirth}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{patientData.profile.address}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{patientData.profile.emergencyContact}</p>
          </div>
        </div>
      </div>

      {/* Clinic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Your Clinic</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
            <p className="text-gray-900 font-medium">{patientData.clinic.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Doctor</label>
            <p className="text-gray-900 font-medium">{patientData.clinic.doctorName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <p className="text-blue-600 hover:text-blue-800 cursor-pointer">{patientData.clinic.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-blue-600 hover:text-blue-800 cursor-pointer">{patientData.clinic.email}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <p className="text-gray-900">{patientData.clinic.address}</p>
          </div>
        </div>
      </div>

      {/* Test History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Test History</h2>
        </div>

        <div className="space-y-3">
          {patientData.reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{report.type}</h3>
                <p className="text-sm text-gray-600">{report.date}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {report.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ReportsSection = () => (
    <div className="space-y-6">
      {/* NeuroSense Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">NeuroSense Reports</h2>
        </div>

        <div className="grid gap-4">
          {patientData.reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{report.type}</h3>
                  <p className="text-gray-600 text-sm mb-3">{report.summary}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {report.date}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      {report.status}
                    </span>
                  </div>
                </div>
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Care Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Personalized Care Plans</h2>
        </div>

        <div className="space-y-4">
          {patientData.carePlans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                <span className="text-sm text-blue-600 font-medium">{plan.progress}% Complete</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${plan.progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Session</label>
                  <p className="text-gray-900">{plan.nextSession}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                <ul className="space-y-1">
                  {plan.goals.map((goal, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ResourcesSection = () => (
    <div className="space-y-6">
      {/* Online Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Book className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Unlocked Content</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patientData.resources.map((resource) => (
            <div key={resource.id} className={`border rounded-lg p-4 ${resource.unlocked ? 'border-gray-200 hover:shadow-md' : 'border-gray-100 opacity-60'} transition-shadow`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${resource.unlocked ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  {resource.type === 'video' && <Video className={`h-5 w-5 ${resource.unlocked ? 'text-blue-600' : 'text-gray-400'}`} />}
                  {resource.type === 'interactive' && <Target className={`h-5 w-5 ${resource.unlocked ? 'text-green-600' : 'text-gray-400'}`} />}
                  {resource.type === 'assessment' && <Brain className={`h-5 w-5 ${resource.unlocked ? 'text-purple-600' : 'text-gray-400'}`} />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${resource.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500">{resource.duration}</p>
                </div>
              </div>

              {resource.unlocked ? (
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Start
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg text-center">
                  🔒 Complete care plan to unlock
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referrals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-50 rounded-lg">
            <MapPin className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Nearby Services</h2>
        </div>

        <div className="grid gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Advanced Neurofeedback Center</h3>
                <p className="text-gray-600 text-sm mt-1">Specialized neurofeedback therapy sessions</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                  <span>📍 2.3 miles away</span>
                  <span>📞 (555) 123-4567</span>
                </div>
              </div>
              <button className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Cognitive Wellness Institute</h3>
                <p className="text-gray-600 text-sm mt-1">Comprehensive cognitive assessment and training</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                  <span>📍 4.7 miles away</span>
                  <span>📞 (555) 987-6543</span>
                </div>
              </div>
              <button className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const JourneySection = () => (
    <div className="space-y-6">
      {/* Progress Tracking */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Progress Tracking</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading progress data...</p>
          </div>
        ) : currentStatus?.hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(currentStatus.currentMetrics?.attention || 0)}
              </div>
              <div className="text-sm text-blue-800">Attention Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(currentStatus.currentMetrics?.relaxation || 0)}
              </div>
              <div className="text-sm text-green-800">Relaxation Score</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round(currentStatus.currentMetrics?.sleepQuality || 0)}
              </div>
              <div className="text-sm text-purple-800">Sleep Quality</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {Math.round(currentStatus.overallScore || 0)}
              </div>
              <div className="text-sm text-orange-800">Overall Score</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No progress data available yet</p>
            <p className="text-sm">Complete your first assessment to see progress tracking</p>
          </div>
        )}

        {/* Progress Trends */}
        {progressData?.trends && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Trends</h3>
            <div className="space-y-3">
              {Object.entries(progressData.trends).map(([metric, trend]) => (
                <div key={metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${
                      trend.direction === 'improving' ? 'text-green-600' :
                      trend.direction === 'declining' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend.direction === 'improving' ? '↗️' : trend.direction === 'declining' ? '↘️' : '→'}
                      {trend.direction}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({Math.abs(trend.change).toFixed(1)} pts)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
          </div>
          <button
            onClick={() => handleBookAppointment()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Book Follow-up</span>
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{appointment.type}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.start_time}
                    </p>
                    <p className="text-xs text-gray-500">
                      Duration: {appointment.duration} min • ${appointment.price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    appointment.status === 'scheduled'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  {appointment.clinics && (
                    <p className="text-xs text-gray-500 mt-1">{appointment.clinics.name}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming appointments</p>
              <p className="text-sm">Book your first appointment to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Journey Loop */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Your Brain Health Journey</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Continue Your Progress</h3>
            <p className="text-gray-600 text-sm mb-4">
              Regular follow-up tests help track your cognitive improvements and adjust your care plan.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Schedule Next Assessment
            </button>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Refer a Friend</h3>
            <p className="text-gray-600 text-sm mb-4">
              Share the benefits of brain health monitoring with friends and family.
            </p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Send Referral
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection />;
      case 'reports':
        return <ReportsSection />;
      case 'resources':
        return <ResourcesSection />;
      case 'journey':
        return <JourneySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Brain Health Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name || 'Patient'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Patient Portal</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default PatientDashboard;