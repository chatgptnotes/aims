import React, { useState, useEffect } from 'react';
import {
  Brain,
  Activity,
  BarChart3,
  Download,
  Share,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  TrendingUp,
  Eye,
  Filter,
  Grid,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const QEEGFileViewer = ({ fileId, patientId, onClose }) => {
  const [qeegData, setQeegData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('topographic'); // topographic, waveform, metrics, report
  const [selectedBand, setSelectedBand] = useState('alpha');
  const [timeRange, setTimeRange] = useState({ start: 0, end: 100 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadQEEGData();
  }, [fileId]);

  const loadQEEGData = async () => {
    try {
      setLoading(true);
      // Mock qEEG data - replace with actual API call
      const mockData = generateMockQEEGData();
      setQeegData(mockData);
    } catch (error) {
      console.error('Error loading qEEG data:', error);
      toast.error('Failed to load qEEG file');
    } finally {
      setLoading(false);
    }
  };

  const generateMockQEEGData = () => {
    return {
      id: fileId,
      patientId: patientId,
      recordingDate: '2025-09-15T10:30:00Z',
      duration: 1200, // 20 minutes in seconds
      samplingRate: 256,
      electrodes: [
        'Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2',
        'F7', 'F8', 'T3', 'T4', 'T5', 'T6', 'Fz', 'Cz', 'Pz'
      ],

      // Patient Info
      patient: {
        name: 'John Smith',
        age: 34,
        gender: 'Male',
        diagnosis: 'ADHD'
      },

      // Frequency Band Analysis
      frequencyBands: {
        delta: { range: '0.5-4 Hz', power: 15.2, relative: 18.5, status: 'normal' },
        theta: { range: '4-8 Hz', power: 22.8, relative: 28.3, status: 'elevated' },
        alpha: { range: '8-13 Hz', power: 18.6, relative: 23.1, status: 'reduced' },
        beta: { range: '13-30 Hz', power: 19.4, relative: 24.1, status: 'normal' },
        gamma: { range: '30-100 Hz', power: 4.9, relative: 6.0, status: 'normal' }
      },

      // Topographic Maps
      topographicMaps: {
        delta: generateTopoMap('delta'),
        theta: generateTopoMap('theta'),
        alpha: generateTopoMap('alpha'),
        beta: generateTopoMap('beta'),
        gamma: generateTopoMap('gamma')
      },

      // Key Metrics
      metrics: {
        dominantFrequency: 9.2,
        posteriorAlpha: 10.1,
        thetaBetaRatio: 1.18,
        asymmetryIndex: 0.12,
        coherence: 0.78,
        phase: 0.65
      },

      // Clinical Findings
      findings: [
        {
          type: 'abnormal',
          region: 'Frontal',
          description: 'Elevated theta activity in frontal regions',
          severity: 'moderate',
          clinical_significance: 'Consistent with ADHD presentation'
        },
        {
          type: 'abnormal',
          region: 'Parietal',
          description: 'Reduced alpha activity in posterior regions',
          severity: 'mild',
          clinical_significance: 'May indicate attention difficulties'
        },
        {
          type: 'normal',
          region: 'Temporal',
          description: 'Normal beta activity in temporal regions',
          severity: 'none',
          clinical_significance: 'Within normal limits'
        }
      ],

      // Recommendations
      recommendations: [
        'SMR training at C3/C4 (12-15 Hz) to enhance sensorimotor rhythm',
        'Alpha training at Pz (8-12 Hz) to improve relaxed focus',
        'Theta suppression training in frontal regions',
        'Follow-up qEEG recommended in 3 months'
      ],

      // Quality metrics
      quality: {
        artifactPercentage: 8.5,
        eyeBlinkArtifacts: 12,
        muscleArtifacts: 5,
        overallQuality: 'good'
      }
    };
  };

  const generateTopoMap = (band) => {
    // Generate mock topographic data for each electrode position
    const electrodes = ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2'];
    return electrodes.reduce((acc, electrode) => {
      acc[electrode] = Math.random() * 100;
      return acc;
    }, {});
  };

  const handleExport = () => {
    toast.success('qEEG report exported successfully');
  };

  const handleShare = () => {
    toast.success('Share link copied to clipboard');
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const renderTopographicView = () => (
    <div className="space-y-4">
      {/* Band Selection */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(qeegData.frequencyBands).map(([band, data]) => (
          <button
            key={band}
            onClick={() => setSelectedBand(band)}
            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              selectedBand === band
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {band} ({data.range})
          </button>
        ))}
      </div>

      {/* Topographic Map */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {selectedBand} Band Topography
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Power: {qeegData.frequencyBands[selectedBand].power} μV²
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              qeegData.frequencyBands[selectedBand].status === 'normal'
                ? 'bg-green-100 text-green-800'
                : qeegData.frequencyBands[selectedBand].status === 'elevated'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {qeegData.frequencyBands[selectedBand].status}
            </span>
          </div>
        </div>

        {/* Brain Map Visualization */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-32 h-32 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">
              Interactive brain topography map would be rendered here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Showing {selectedBand} band activity distribution
            </p>
          </div>
        </div>

        {/* Color Scale */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Low</span>
            <div className="w-40 h-4 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded"></div>
            <span className="text-sm text-gray-600">High</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWaveformView = () => (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayback}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            <SkipBack className="w-4 h-4" />
          </button>
          <button className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
            className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Waveform Display */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="bg-black rounded-lg p-4 min-h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">EEG Waveform Display</p>
              <p className="text-sm opacity-75 mt-2">
                Real-time or recorded EEG traces for {qeegData.electrodes.length} channels
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max="100"
            value={timeRange.start}
            onChange={(e) => setTimeRange({ ...timeRange, start: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>0:00</span>
            <span>10:00</span>
            <span>20:00</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetricsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Frequency Bands */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Frequency Band Analysis
        </h3>
        <div className="space-y-3">
          {Object.entries(qeegData.frequencyBands).map(([band, data]) => (
            <div key={band} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">{band}</h4>
                  <p className="text-sm text-gray-600">{data.range}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{data.power} μV²</div>
                  <div className="text-sm text-gray-600">{data.relative}% relative</div>
                </div>
              </div>
              <div className={`mt-2 px-2 py-1 text-xs rounded-full inline-block ${
                data.status === 'normal'
                  ? 'bg-green-100 text-green-800'
                  : data.status === 'elevated'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
          Clinical Metrics
        </h3>
        <div className="space-y-3">
          {Object.entries(qeegData.metrics).map(([metric, value]) => (
            <div key={metric} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">
                {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <span className="font-medium text-gray-900">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Findings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
          Clinical Findings
        </h3>
        <div className="space-y-4">
          {qeegData.findings.map((finding, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${
                      finding.type === 'normal' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <h4 className="font-medium text-gray-900">{finding.region} Region</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      finding.severity === 'none'
                        ? 'bg-green-100 text-green-800'
                        : finding.severity === 'mild'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{finding.description}</p>
                  <p className="text-xs text-gray-500">{finding.clinical_significance}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Recording Quality
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Artifact Percentage</p>
            <p className="text-lg font-bold text-gray-900">{qeegData.quality.artifactPercentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Eye Blink Artifacts</p>
            <p className="text-lg font-bold text-gray-900">{qeegData.quality.eyeBlinkArtifacts}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Muscle Artifacts</p>
            <p className="text-lg font-bold text-gray-900">{qeegData.quality.muscleArtifacts}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overall Quality</p>
            <span className={`px-2 py-1 text-sm rounded-full capitalize ${
              qeegData.quality.overallQuality === 'good'
                ? 'bg-green-100 text-green-800'
                : qeegData.quality.overallQuality === 'fair'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {qeegData.quality.overallQuality}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportView = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Report Header */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-bold text-gray-900">qEEG Analysis Report</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Patient:</span> {qeegData.patient.name}
            </div>
            <div>
              <span className="font-medium">Recording Date:</span> {new Date(qeegData.recordingDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Age:</span> {qeegData.patient.age} years
            </div>
            <div>
              <span className="font-medium">Duration:</span> {Math.round(qeegData.duration / 60)} minutes
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
          <p className="text-sm text-gray-700">
            The qEEG analysis reveals patterns consistent with ADHD presentation, including elevated theta activity
            in frontal regions and reduced alpha activity posteriorly. The theta/beta ratio of {qeegData.metrics.thetaBetaRatio}
            is above normal range, supporting the clinical diagnosis.
          </p>
        </div>

        {/* Key Findings */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Findings</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {qeegData.findings.filter(f => f.type === 'abnormal').map((finding, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {finding.description} - {finding.clinical_significance}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Treatment Recommendations</h4>
          <ol className="space-y-1 text-sm text-gray-700">
            {qeegData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 font-medium mr-2">{index + 1}.</span>
                {rec}
              </li>
            ))}
          </ol>
        </div>

        {/* Technical Details */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Technical Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Sampling Rate:</span> {qeegData.samplingRate} Hz
            </div>
            <div>
              <span className="font-medium">Electrodes:</span> {qeegData.electrodes.length} channels
            </div>
            <div>
              <span className="font-medium">Recording Quality:</span> {qeegData.quality.overallQuality}
            </div>
            <div>
              <span className="font-medium">Artifact Percentage:</span> {qeegData.quality.artifactPercentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Brain className="mr-3" />
              qEEG Analysis Viewer
            </h2>
            <p className="mt-2 text-blue-100">
              Comprehensive brain activity analysis for {qeegData.patient.name}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleShare}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors flex items-center"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={handleExport}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900">{qeegData.patient.name}</h3>
              <p className="text-sm text-gray-600">
                {qeegData.patient.age} years, {qeegData.patient.gender} • {qeegData.patient.diagnosis}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(qeegData.recordingDate).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {Math.round(qeegData.duration / 60)} min
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'topographic', label: 'Topographic Maps', icon: MapPin },
            { id: 'waveform', label: 'Waveforms', icon: Activity },
            { id: 'metrics', label: 'Metrics & Analysis', icon: BarChart3 },
            { id: 'report', label: 'Clinical Report', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                viewMode === tab.id
                  ? 'border-blue-500 text-blue-600'
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
        {viewMode === 'topographic' && renderTopographicView()}
        {viewMode === 'waveform' && renderWaveformView()}
        {viewMode === 'metrics' && renderMetricsView()}
        {viewMode === 'report' && renderReportView()}
      </div>
    </div>
  );
};

export default QEEGFileViewer;